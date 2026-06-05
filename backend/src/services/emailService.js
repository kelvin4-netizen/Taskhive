// src/services/emailService.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASS, // Resend API key
  },
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    body { font-family: Arial, sans-serif; background: #0A0A0A; margin: 0; padding: 0; }
    .wrapper { max-width: 580px; margin: 0 auto; padding: 40px 16px; }
    .card { background: #141414; border: 1px solid #222; border-radius: 16px; padding: 40px 36px; }
    .logo { font-size: 22px; font-weight: 900; color: #D4A843; margin-bottom: 28px; letter-spacing: -0.5px; }
    .logo span { color: #fff; }
    h1 { color: #fff; font-size: 22px; margin: 0 0 14px; font-weight: 800; }
    p { color: #888; font-size: 14px; line-height: 1.75; margin: 0 0 14px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #D4A843, #A07820);
           color: #0A0A0A; padding: 13px 30px; border-radius: 10px; text-decoration: none;
           font-weight: 700; font-size: 14px; margin: 20px 0; }
    .divider { border: none; border-top: 1px solid #222; margin: 24px 0; }
    .code { background: #1A1A1A; border: 1px solid #333; border-radius: 8px; padding: 12px 18px;
            font-family: monospace; font-size: 20px; font-weight: 800; color: #D4A843;
            letter-spacing: 4px; text-align: center; margin: 16px 0; }
    .footer { color: #333; font-size: 11px; margin-top: 24px; text-align: center; line-height: 1.6; }
    .footer a { color: #555; text-decoration: none; }
    .warn { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
            border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #F59E0B; margin-top: 14px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">Task<span>Hive</span> 🐝</div>
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} TaskHive · All rights reserved</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>`;

const send = async ({ to, subject, html }) => {
  try {
    if (!process.env.SMTP_PASS) {
      logger.warn(`Email skipped (no SMTP_PASS) — would have sent "${subject}" to ${to}`);
      return;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'TaskHive <noreply@taskhive.com>',
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
  }
};

const sendVerificationEmail = async (email, name, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await send({
    to: email,
    subject: 'Verify Your TaskHive Account',
    html: baseTemplate(`
      <h1>Welcome, ${name}! 🎉</h1>
      <p>You're one step away from unlocking your earning potential on TaskHive. Click the button below to verify your email address.</p>
      <a href="${url}" class="btn">✓ Verify My Email</a>
      <hr class="divider"/>
      <p style="font-size:12px;color:#555;">Or copy this link: <a href="${url}" style="color:#D4A843;">${url}</a></p>
      <div class="warn">⏱ This link expires in 24 hours.</div>
    `),
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await send({
    to: email,
    subject: 'Reset Your TaskHive Password',
    html: baseTemplate(`
      <h1>Password Reset Request</h1>
      <p>Hi ${name}, we received a request to reset your password. Click below to choose a new one.</p>
      <a href="${url}" class="btn">Reset My Password</a>
      <hr class="divider"/>
      <div class="warn">⏱ This link expires in 1 hour. If you didn't request this, ignore this email.</div>
    `),
  });
};

const sendWelcomeEmail = async (email, name) => {
  await send({
    to: email,
    subject: 'Welcome to TaskHive — Start Earning Today!',
    html: baseTemplate(`
      <h1>You're in, ${name}! 🐝</h1>
      <p>Your TaskHive account is now active. Here's how to get started:</p>
      <p>✦ Browse task categories<br/>✦ Choose a package that fits your goals<br/>✦ Complete tasks and earn real money</p>
      <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard →</a>
    `),
  });
};

const sendPaymentConfirmation = async (email, name, packageName, amount) => {
  await send({
    to: email,
    subject: `Payment Confirmed — ${packageName}`,
    html: baseTemplate(`
      <h1>Payment Successful! ✓</h1>
      <p>Hi ${name}, your payment of <strong style="color:#D4A843;">$${amount}</strong> for the <strong>${packageName}</strong> package has been confirmed.</p>
      <p>Your category is now active and tasks are ready for you.</p>
      <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Start Earning →</a>
    `),
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPaymentConfirmation,
};