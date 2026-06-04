// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const {
  getAnalytics, getUsers, updateUserStatus, deleteUser,
  createTask, updateTask, deleteTask,
  createCategory, getAllPayments, refundPayment, getAdminLogs,
} = require('../controllers/adminController');

// All admin routes: must be logged in + ADMIN role
router.use(protect, requireAdmin);

router.get('/analytics', getAnalytics);
router.get('/logs', getAdminLogs);

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

router.post('/categories', createCategory);

router.get('/payments', getAllPayments);
router.post('/payments/:id/refund', refundPayment);

module.exports = router;
