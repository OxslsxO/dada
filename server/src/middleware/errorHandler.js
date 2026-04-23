const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  logger.error('请求错误', {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    error: err.message,
    stack: err.stack
  });

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: 'Token无效，请重新登录',
      data: null
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: 'Token已过期，请重新登录',
      data: null
    });
  }

  if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      code: -1,
      message: '请求参数格式错误',
      data: null
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      code: -1,
      message: '上传文件过大',
      data: null
    });
  }

  res.status(err.statusCode || 500).json({
    code: err.code || -1,
    message: err.message || '服务器内部错误',
    data: null
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    code: 404,
    message: `接口不存在: ${req.method} ${req.url}`,
    data: null
  });
};

class AppError extends Error {
  constructor(message, statusCode = 400, code = -1) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError
};
