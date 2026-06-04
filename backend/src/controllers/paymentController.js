// src/controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// ─── CREATE STRIPE CHECKOUT SESSION ──────────────────────────────────────────
const createStripeSession = async (req, res, next) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.id;

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: { category: true },
    });

    if (!pkg || !pkg.isActive) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: pkg.price,
        method: 'STRIPE',
        status: 'PENDING',
        metadata: { packageId, categoryId: pkg.categoryId },
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${pkg.category.name} — ${pkg.name}`,
            description: pkg.description,
          },
          unit_amount: Math.round(pkg.price * 100),
        },
        quantity: 1,
      }],
      metadata: {
        paymentId: payment.id,
        userId,
        packageId,
        categoryId: pkg.categoryId,
      },
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancelled`,
    });

    res.json({ success: true, data: { url: session.url, sessionId: session.id } });
  } catch (err) {
    next(err);
  }
};

// ─── STRIPE WEBHOOK ───────────────────────────────────────────────────────────
const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error(`Stripe webhook signature failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { paymentId, userId, packageId, categoryId } = session.metadata;

    try {
      await fulfillPurchase({ paymentId, userId, packageId, categoryId, externalId: session.payment_intent });
    } catch (err) {
      logger.error(`Fulfillment failed for payment ${paymentId}: ${err.message}`);
    }
  }

  res.json({ received: true });
};

// ─── MPESA STK PUSH ───────────────────────────────────────────────────────────
const initiateMpesa = async (req, res, next) => {
  try {
    const { packageId, phone } = req.body;
    const userId = req.user.id;

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: { category: true },
    });

    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });

    // Get M-Pesa access token
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` },
    });
    const { access_token } = await tokenRes.json();

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
    const amount = Math.ceil(pkg.price * 150); // Convert USD to KES (approx)

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: pkg.price,
        method: 'MPESA',
        status: 'PENDING',
        metadata: { packageId, categoryId: pkg.categoryId, phone },
      },
    });

    const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `TH-${payment.id.slice(0, 8)}`,
        TransactionDesc: `TaskHive: ${pkg.name}`,
      }),
    });

    const stkData = await stkRes.json();

    // Store payment ID in metadata for callback matching
    await prisma.payment.update({
      where: { id: payment.id },
      data: { metadata: { ...payment.metadata, checkoutRequestId: stkData.CheckoutRequestID } },
    });

    res.json({
      success: true,
      message: 'STK Push sent. Please complete payment on your phone.',
      data: { checkoutRequestId: stkData.CheckoutRequestID },
    });
  } catch (err) {
    next(err);
  }
};

// ─── MPESA CALLBACK ───────────────────────────────────────────────────────────
const mpesaCallback = async (req, res, next) => {
  try {
    const body = req.body?.Body?.stkCallback;
    if (!body) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const { ResultCode, CheckoutRequestID } = body;

    // Find payment by checkoutRequestId stored in metadata
    const payments = await prisma.payment.findMany({
      where: { method: 'MPESA', status: 'PENDING' },
    });

    const payment = payments.find(p => p.metadata?.checkoutRequestId === CheckoutRequestID);
    if (!payment) {
      logger.warn(`M-Pesa callback: payment not found for ${CheckoutRequestID}`);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (ResultCode === 0) {
      const { packageId, categoryId } = payment.metadata;
      await fulfillPurchase({
        paymentId: payment.id,
        userId: payment.userId,
        packageId,
        categoryId,
        externalId: CheckoutRequestID,
      });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    logger.error(`M-Pesa callback error: ${err.message}`);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' }); // Always return 200 to Safaricom
  }
};

// ─── FULFILL PURCHASE (shared logic) ─────────────────────────────────────────
const fulfillPurchase = async ({ paymentId, userId, packageId, categoryId, externalId }) => {
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    include: { category: true },
  });

  const expiresAt = pkg.isMonthly
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : null;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'COMPLETED', externalId, webhookVerified: true },
    }),
    prisma.purchase.upsert({
      where: { userId_categoryId: { userId, categoryId } },
      create: {
        userId,
        categoryId,
        packageId,
        paymentId,
        taskLimit: pkg.isUnlimited ? null : pkg.taskLimit,
        isUnlimited: pkg.isUnlimited,
        isActive: true,
        expiresAt,
      },
      update: {
        packageId,
        paymentId,
        taskLimit: pkg.isUnlimited ? null : pkg.taskLimit,
        isUnlimited: pkg.isUnlimited,
        tasksUsed: 0,
        isActive: true,
        expiresAt,
      },
    }),
    prisma.notification.create({
      data: {
        userId,
        type: 'PAYMENT',
        title: 'Payment Confirmed ✦',
        message: `Your ${pkg.category.name} — ${pkg.name} access has been activated.`,
        metadata: { packageId, categoryId },
      },
    }),
  ]);

  // Send confirmation email
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, fullName: true } });
  await emailService.sendPaymentConfirmationEmail(user.email, user.fullName, {
    packageName: pkg.name,
    categoryName: pkg.category.name,
    amount: pkg.price,
  });

  logger.info(`Purchase fulfilled: user=${userId} category=${categoryId} package=${packageId}`);
};

// ─── GET PAYMENT HISTORY ──────────────────────────────────────────────────────
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: { payments } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createStripeSession,
  stripeWebhook,
  initiateMpesa,
  mpesaCallback,
  getMyPayments,
};
