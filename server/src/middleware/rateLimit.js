const rateLimit = require('express-rate-limit');
const config = require('../config');

const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    code: 429,
    message: '登录请求过于频繁，请15分钟后再试',
    data: null
  }
});

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    code: 429,
    message: '创建操作过于频繁，请1小时后再试',
    data: null
  }
});

const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: {
    code: 429,
    message: '申请操作过于频繁，请1小时后再试',
    data: null
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  createLimiter,
  applyLimiter
};
