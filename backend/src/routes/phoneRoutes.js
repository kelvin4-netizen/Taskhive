// src/routes/phoneRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/authMiddleware');
const prisma = new PrismaClient();

const PHONE_PLANS = [
  { name: 'Basic', numbers: 1, price: 15 },
  { name: 'Standard', numbers: 3, price: 35 },
  { name: 'Premium', numbers: 10, price: 70 },
];

router.get('/plans', (req, res) => {
  res.json({ success: true, data: { plans: PHONE_PLANS } });
});

router.get('/my-subscriptions', protect, async (req, res, next) => {
  try {
    const subs = await prisma.phoneSubscription.findMany({
      where: { userId: req.user.id },
      include: { phoneNumber: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: { subscriptions: subs } });
  } catch (err) { next(err); }
});

module.exports = router;
