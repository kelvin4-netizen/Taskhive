// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register, verifyEmail, login, refreshToken,
  logout, forgotPassword, resetPassword, getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const registerValidation = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('country').notEmpty().withMessage('Country is required'),
];

router.post('/register', authLimiter, registerValidation, register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', authLimiter, [body('email').isEmail()], forgotPassword);
router.post('/reset-password/:token', [body('password').isLength({ min: 8 })], resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
