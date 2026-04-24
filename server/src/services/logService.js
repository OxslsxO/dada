const OperationLog = require('../models/OperationLog');
const logger = require('../utils/logger');

const log = async ({ userId, action, targetType, targetId, detail, ip }) => {
  try {
    await OperationLog.create({
      userId,
      action,
      targetType,
      targetId,
      detail: detail || '',
      ip: ip || ''
    });
  } catch (err) {
    logger.error('记录操作日志失败', { error: err.message });
  }
};

module.exports = { log };
