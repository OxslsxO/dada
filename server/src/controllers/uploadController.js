const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('../config');
const { success } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');
const logService = require('../services/logService');

const uploadDir = config.upload.dir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dateDir = new Date().toISOString().split('T')[0];
    const fullDir = path.join(uploadDir, dateDir);
    if (!fs.existsSync(fullDir)) {
      fs.mkdirSync(fullDir, { recursive: true });
    }
    cb(null, fullDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '_' + Math.random().toString(36).substr(2, 8) + ext;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('只支持上传 JPG、PNG、GIF、WebP 格式的图片', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 9
  }
});

const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('请选择要上传的图片', 400);
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls = req.files.map(file => {
      const relativePath = path.relative(path.dirname(config.upload.dir), file.path).replace(/\\/g, '/');
      return `${baseUrl}/uploads/${relativePath}`;
    });

    logService.log({
      userId: req.user ? req.user.id : null,
      action: 'upload_image',
      targetType: 'image',
      detail: `上传${urls.length}张图片`,
      ip: req.ip
    });

    return success(res, { urls }, '上传成功');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  upload,
  uploadImages
};
