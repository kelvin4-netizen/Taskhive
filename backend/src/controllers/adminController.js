// src/controllers/adminController.js
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// ─── ANALYTICS OVERVIEW ───────────────────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalRevenue,
      totalPurchases,
      totalTasks,
      totalSubscriptions,
      recentPayments,
      topCategories,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.purchase.count({ where: { isActive: true } }),
      prisma.task.count({ where: { status: 'ACTIVE' } }),
      prisma.phoneSubscription.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { fullName: true, email: true } } },
      }),
      prisma.purchase.groupBy({
        by: ['categoryId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, fullName: true, email: true, country: true, status: true, createdAt: true },
      }),
    ]);

    // Revenue chart (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const revenueByDay = await prisma.payment.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
      select: { amount: true, createdAt: true },
    });

    const revenueChart = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      const dayStr = date.toISOString().split('T')[0];
      const dayTotal = revenueByDay
        .filter(p => p.createdAt.toISOString().split('T')[0] === dayStr)
        .reduce((sum, p) => sum + p.amount, 0);
      return { date: dayStr, revenue: dayTotal };
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          suspendedUsers,
          totalRevenue: totalRevenue._sum.amount || 0,
          totalPurchases,
          totalTasks,
          totalSubscriptions,
        },
        recentPayments,
        topCategories,
        recentUsers,
        revenueChart,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(role && { role }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, fullName: true, email: true, country: true,
          role: true, status: true, emailVerified: true,
          walletBalance: true, totalEarned: true,
          createdAt: true,
          _count: { select: { purchases: true, payments: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: { users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, fullName: true, email: true, status: true },
    });

    await logAdminAction(req.user.id, id, `USER_${status}`, `User ${status.toLowerCase()}: ${user.email}`);

    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }

    const user = await prisma.user.delete({ where: { id } });
    await logAdminAction(req.user.id, null, 'USER_DELETED', `User deleted: ${user.email}`);

    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── TASK MANAGEMENT ──────────────────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const { categoryId, title, description, instructions, reward, difficulty, timeLimit, deadline, maxSubmissions, tags, externalUrl } = req.body;

    const task = await prisma.task.create({
      data: { categoryId, title, description, instructions, reward: parseFloat(reward), difficulty, timeLimit: timeLimit ? parseInt(timeLimit) : null, deadline: deadline ? new Date(deadline) : null, maxSubmissions: maxSubmissions ? parseInt(maxSubmissions) : null, tags: tags || [], externalUrl },
    });

    await logAdminAction(req.user.id, null, 'TASK_CREATED', `Task created: ${title}`);
    res.status(201).json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.update({ where: { id }, data: req.body });
    await logAdminAction(req.user.id, null, 'TASK_UPDATED', `Task updated: ${task.title}`);
    res.json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    await logAdminAction(req.user.id, null, 'TASK_DELETED', `Task deleted: ${id}`);
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── CATEGORY MANAGEMENT ──────────────────────────────────────────────────────
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, estimatedEarn, sortOrder } = req.body;
    const category = await prisma.category.create({ data: { name, slug, description, estimatedEarn, sortOrder: sortOrder ? parseInt(sortOrder) : 0 } });
    await logAdminAction(req.user.id, null, 'CATEGORY_CREATED', `Category created: ${name}`);
    res.status(201).json({ success: true, data: { category } });
  } catch (err) {
    next(err);
  }
};

// ─── PAYMENT MANAGEMENT ───────────────────────────────────────────────────────
const getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: status ? { status } : {},
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, email: true } } },
      }),
      prisma.payment.count({ where: status ? { status } : {} }),
    ]);

    res.json({ success: true, data: { payments, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (err) {
    next(err);
  }
};

const refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment || payment.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Payment not eligible for refund.' });
    }

    // Stripe refund
    if (payment.method === 'STRIPE' && payment.externalId) {
      await stripe.refunds.create({ payment_intent: payment.externalId });
    }

    await prisma.$transaction([
      prisma.payment.update({ where: { id }, data: { status: 'REFUNDED', refundedAt: new Date() } }),
      prisma.purchase.updateMany({ where: { paymentId: id }, data: { isActive: false } }),
    ]);

    await logAdminAction(req.user.id, payment.userId, 'PAYMENT_REFUNDED', `Refund issued for payment: ${id}`);
    res.json({ success: true, message: 'Refund processed.' });
  } catch (err) {
    next(err);
  }
};

// ─── ADMIN LOGS ───────────────────────────────────────────────────────────────
const getAdminLogs = async (req, res, next) => {
  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { admin: { select: { fullName: true, email: true } } },
    });
    res.json({ success: true, data: { logs } });
  } catch (err) {
    next(err);
  }
};

// ─── HELPER: LOG ADMIN ACTION ─────────────────────────────────────────────────
const logAdminAction = async (adminId, targetId, action, description, req) => {
  try {
    await prisma.adminLog.create({
      data: { adminId, targetId, action, description, ipAddress: req?.ip },
    });
  } catch (err) {
    logger.error(`Failed to log admin action: ${err.message}`);
  }
};

module.exports = {
  getAnalytics,
  getUsers,
  updateUserStatus,
  deleteUser,
  createTask,
  updateTask,
  deleteTask,
  createCategory,
  getAllPayments,
  refundPayment,
  getAdminLogs,
};
