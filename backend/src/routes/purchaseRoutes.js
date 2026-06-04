// src/routes/purchaseRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/authMiddleware');
const prisma = new PrismaClient();

router.get('/my-purchases', protect, async (req, res, next) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.user.id, isActive: true },
      include: { category: true, package: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: { purchases } });
  } catch (err) { next(err); }
});

module.exports = router;
