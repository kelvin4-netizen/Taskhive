// src/config/redis.js
const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    retryStrategy: (times) => Math.min(times * 100, 3000),
    maxRetriesPerRequest: 3,
  });

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));
} else {
  // Fallback in-memory mock for development without Redis
  const store = new Map();
  redisClient = {
    get: async (key) => store.get(key) || null,
    set: async (key, value, ...args) => { store.set(key, value); return 'OK'; },
    del: async (key) => { store.delete(key); return 1; },
    exists: async (key) => store.has(key) ? 1 : 0,
  };
  logger.warn('Redis not configured — using in-memory fallback (not for production)');
}

module.exports = redisClient;
