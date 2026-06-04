// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── PROTECT ──────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired.', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        emailVerified: true,
        profileCompleted: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Account suspended.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// ─── REQUIRE ADMIN ────────────────────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }
  next();
};

// ─── REQUIRE VERIFIED EMAIL ───────────────────────────────────────────────────
const requireEmailVerified = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email to access this resource.',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }
  next();
};

// ─── REQUIRE PROFILE COMPLETE ─────────────────────────────────────────────────
const requireProfileComplete = (req, res, next) => {
  if (!req.user.profileCompleted) {
    return res.status(403).json({
      success: false,
      message: 'Please complete your profile before proceeding.',
      code: 'PROFILE_INCOMPLETE',
    });
  }
  next();
};

// ─── REQUIRE PURCHASE ─────────────────────────────────────────────────────────
// Checks if user has an active purchase for the requested category
const requirePurchase = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId || req.query.categoryId;
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Category ID required.' });
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user.id,
        categoryId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (!purchase) {
      return res.status(403).json({
        success: false,
        message: 'Purchase required to access this content.',
        code: 'PURCHASE_REQUIRED',
      });
    }

    req.purchase = purchase;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  protect,
  requireAdmin,
  requireEmailVerified,
  requireProfileComplete,
  requirePurchase,
};
