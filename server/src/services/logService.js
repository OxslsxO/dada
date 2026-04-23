const db = require('../models/db');
const logger = require('../utils/logger');

const log = ({ userId, action, targetType, targetId, detail, ip }) => {
  try {
    db.run(`
      INSERT INTO operation_logs (user_id, action, target_type, target_id, detail, ip)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId || null, action, targetType || null, targetId || null, detail || '', ip || '']);
  } catch (err) {
    logger.error('记录操作日志失败', { error: err.message });
  }
};

module.exports = { log };
