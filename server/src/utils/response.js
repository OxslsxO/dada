const success = (res, data = null, message = '操作成功', code = 0) => {
  return res.json({
    code,
    message,
    data
  });
};

const paginate = (res, { list, total, page, pageSize }, message = '查询成功') => {
  return res.json({
    code: 0,
    message,
    data: {
      list,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    }
  });
};

const error = (res, message = '操作失败', code = -1, statusCode = 400) => {
  return res.status(statusCode).json({
    code,
    message,
    data: null
  });
};

const unauthorized = (res, message = '未授权，请先登录') => {
  return res.status(401).json({
    code: 401,
    message,
    data: null
  });
};

const forbidden = (res, message = '权限不足') => {
  return res.status(403).json({
    code: 403,
    message,
    data: null
  });
};

const notFound = (res, message = '资源不存在') => {
  return res.status(404).json({
    code: 404,
    message,
    data: null
  });
};

const serverError = (res, message = '服务器内部错误') => {
  return res.status(500).json({
    code: 500,
    message,
    data: null
  });
};

module.exports = {
  success,
  paginate,
  error,
  unauthorized,
  forbidden,
  notFound,
  serverError
};
