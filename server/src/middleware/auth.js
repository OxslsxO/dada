const jwt = require('jsonwebtoken');
const config = require('../config');
const { unauthorized } = require('../utils/response');
const logger = require('../utils/logger');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, '未提供认证Token');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('Token验证失败', { token: token.substring(0, 10) + '...', error: err.message });
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token已过期，请重新登录');
    }
    return unauthorized(res, 'Token无效，请重新登录');
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

module.exports = {
  auth,
  optionalAuth
};
