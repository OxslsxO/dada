const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');

async function connect() {
  try {
    await mongoose.connect(config.db.uri);
    logger.info('MongoDB 数据库连接成功');
    return mongoose.connection;
  } catch (err) {
    logger.error('MongoDB 连接失败', { error: err.message });
    throw err;
  }
}

function close() {
  if (mongoose.connection) {
    mongoose.connection.close();
  }
}

process.on('exit', close);
process.on('SIGINT', () => {
  close();
  process.exit(0);
});

module.exports = {
  connect,
  close,
  mongoose
};
