// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/authMiddleware');
const prisma = new PrismaClient();

router.patch('/profile', protect, async (req, res, next) => {
  try {
    const { fullName, country, phoneNumber } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName, country, phoneNumber, profileCompleted: true },
      select: { id: true, fullName: true, email: true, country: true, phoneNumber: true, profileCompleted: true },
    });
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
});

router.get('/earnings', protect, async (req, res, next) => {
  try {
    const submissions = await prisma.taskSubmission.findMany({
      where: { userId: req.user.id, approved: true },
      include: { task: { select: { title: true, categoryId: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const totalEarned = submissions.reduce((sum, s) => sum + s.reward, 0);
    res.json({ success: true, data: { submissions, totalEarned } });
  } catch (err) { next(err); }
});

module.exports = router;
