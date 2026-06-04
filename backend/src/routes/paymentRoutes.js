// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createStripeSession, stripeWebhook,
  initiateMpesa, mpesaCallback, getMyPayments,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { paymentLimiter } = require('../middleware/rateLimiter');

router.post('/stripe/create-session', protect, paymentLimiter, createStripeSession);
router.post('/stripe/webhook', stripeWebhook); // raw body, no auth
router.post('/mpesa/initiate', protect, paymentLimiter, initiateMpesa);
router.post('/mpesa/callback', mpesaCallback); // raw body, no auth
router.get('/my-payments', protect, getMyPayments);

module.exports = router;
