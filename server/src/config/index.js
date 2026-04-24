require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'dada_default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  wx: {
    appid: process.env.WX_APPID || '',
    secret: process.env.WX_SECRET || ''
  },
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dada'
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    auth: {
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10
    },
    create: {
      windowMs: parseInt(process.env.CREATE_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
      max: parseInt(process.env.CREATE_RATE_LIMIT_MAX) || 20
    },
    apply: {
      windowMs: parseInt(process.env.APPLY_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
      max: parseInt(process.env.APPLY_RATE_LIMIT_MAX) || 30
    }
  }
};
