// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();
const emailService = require('../services/emailService');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { fullName, email, password, country, phoneNumber } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerifyToken = uuidv4();
    const referralCode = `TH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        country,
        phoneNumber,
        emailVerifyToken,
        referralCode,
        status: 'PENDING_VERIFICATION',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        country: true,
        role: true,
        status: true,
        emailVerified: true,
        referralCode: true,
        createdAt: true,
      },
    });

    // Send verification email
    await emailService.sendVerificationEmail(email, fullName, emailVerifyToken);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        status: 'ACTIVE',
      },
    });

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Contact support.',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in Redis (TTL = 7 days)
    await redisClient.set(
      `refresh:${user.id}`,
      refreshToken,
      'EX',
      60 * 60 * 24 * 7
    );

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          country: user.country,
          role: user.role,
          status: user.status,
          profileCompleted: user.profileCompleted,
          walletBalance: user.walletBalance,
          totalEarned: user.totalEarned,
          referralCode: user.referralCode,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided.' });
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    // Verify token matches what's stored in Redis
    const storedToken = await redisClient.get(`refresh:${payload.id}`);
    if (!storedToken || storedToken !== token) {
      return res.status(401).json({ success: false, message: 'Refresh token expired or revoked.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user || user.status === 'SUSPENDED') {
      return res.status(401).json({ success: false, message: 'User not found or suspended.' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Rotate refresh token
    await redisClient.set(`refresh:${user.id}`, newRefreshToken, 'EX', 60 * 60 * 24 * 7);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      await redisClient.del(`refresh:${userId}`);
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    const resetToken = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken, resetPasswordExpiry: expiry },
    });

    await emailService.sendPasswordResetEmail(email, user.fullName, resetToken);

    res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    // Invalidate all sessions
    await redisClient.del(`refresh:${user.id}`);

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        country: true,
        phoneNumber: true,
        role: true,
        status: true,
        emailVerified: true,
        profileCompleted: true,
        walletBalance: true,
        totalEarned: true,
        referralCode: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// ─── RESEND VERIFICATION EMAIL ────────────────────────────────────────────────
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return res.json({ success: true, message: 'If that email exists and is unverified, a new link has been sent.' });
    }

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: token },
    });

    await emailService.sendVerificationEmail(email, user.fullName, token);

    res.json({ success: true, message: 'Verification email resent. Please check your inbox.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};