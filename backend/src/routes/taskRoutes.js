// src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { protect, requirePurchase } = require('../middleware/authMiddleware');
const prisma = new PrismaClient();

// All task routes require authentication + active purchase for the category
router.get('/category/:categoryId', protect, requirePurchase, async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, difficulty, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      categoryId,
      status: 'ACTIVE',
      ...(difficulty && { difficulty }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { submissions: true } },
          submissions: { where: { userId: req.user.id }, select: { approved: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    const tasksWithStatus = tasks.map(t => ({
      ...t,
      userSubmission: t.submissions[0] || null,
      submissions: undefined,
    }));

    res.json({
      success: true,
      data: {
        tasks: tasksWithStatus,
        purchase: req.purchase,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (err) { next(err); }
});

// Submit a task
router.post('/:taskId/submit', protect, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { proof, notes } = req.body;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    // Verify purchase for this task's category
    const purchase = await prisma.purchase.findFirst({
      where: { userId: req.user.id, categoryId: task.categoryId, isActive: true },
    });
    if (!purchase) return res.status(403).json({ success: false, message: 'Purchase required.' });

    const existing = await prisma.taskSubmission.findUnique({
      where: { taskId_userId: { taskId, userId: req.user.id } },
    });
    if (existing) return res.status(409).json({ success: false, message: 'Already submitted.' });

    const [submission] = await prisma.$transaction([
      prisma.taskSubmission.create({
        data: { taskId, userId: req.user.id, proof, notes, reward: task.reward },
      }),
      prisma.task.update({ where: { id: taskId }, data: { submissionCount: { increment: 1 } } }),
      prisma.purchase.update({
        where: { id: purchase.id },
        data: { tasksUsed: { increment: 1 } },
      }),
    ]);

    res.status(201).json({ success: true, data: { submission } });
  } catch (err) { next(err); }
});

module.exports = router;
