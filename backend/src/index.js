// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const xssClean = require('xss-clean');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { generalLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const authRoutes         = require('./routes/authRoutes');
const categoryRoutes     = require('./routes/categoryRoutes');
const taskRoutes         = require('./routes/taskRoutes');
const packageRoutes      = require('./routes/packageRoutes');
const paymentRoutes      = require('./routes/paymentRoutes');
const purchaseRoutes     = require('./routes/purchaseRoutes');
const phoneRoutes        = require('./routes/phoneRoutes');
const userRoutes         = require('./routes/userRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ─── ALLOWED ORIGINS ─────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    logger.warn(`CORS blocked: ${origin}`);
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(xssClean());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight for all routes

// ─── GENERAL MIDDLEWARE ───────────────────────────────────────────────────────
app.use(compression());
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

app.use('/api/payments/stripe/webhook',      express.raw({ type: 'application/json' }));
app.use('/api/payments/flutterwave/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    allowedOrigins: ALLOWED_ORIGINS,
  });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/packages',      packageRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/purchases',     purchaseRoutes);
app.use('/api/phones',        phoneRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🐝 TaskHive API running on port ${PORT} [${process.env.NODE_ENV}]`);
  logger.info(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});

module.exports = app;