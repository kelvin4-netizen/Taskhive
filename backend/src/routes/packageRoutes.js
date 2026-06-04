// src/routes/packageRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/category/:categoryId', async (req, res, next) => {
  try {
    const packages = await prisma.package.findMany({
      where: { categoryId: req.params.categoryId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: { packages } });
  } catch (err) { next(err); }
});

module.exports = router;
