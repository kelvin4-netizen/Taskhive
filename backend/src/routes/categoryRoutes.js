// src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/authMiddleware');
const prisma = new PrismaClient();

// Public: list all active categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { tasks: true, packages: true } } },
    });
    res.json({ success: true, data: { categories } });
  } catch (err) { next(err); }
});

// Public: single category
router.get('/:slug', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        packages: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        _count: { select: { tasks: true } },
      },
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, data: { category } });
  } catch (err) { next(err); }
});

module.exports = router;
