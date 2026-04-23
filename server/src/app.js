require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimit');
const db = require('./models/db');

const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activity');
const applicationRoutes = require('./routes/application');
const categoryRoutes = require('./routes/category');
const uploadRoutes = require('./routes/upload');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.use(globalLimiter);

const uploadDir = config.upload.dir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.resolve(uploadDir)));

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    code: 0,
    message: '服务运行正常',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

async function start() {
  try {
    await db.connect();
    logger.info('数据库初始化完成');

    app.listen(PORT, () => {
      logger.info(`搭哒后端服务已启动，端口: ${PORT}`);
      logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API文档: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    logger.error('服务启动失败', { error: err.message });
    process.exit(1);
  }
}

start();

module.exports = app;
