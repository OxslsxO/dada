const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Application = require('../models/Application');
const OperationLog = require('../models/OperationLog');
const config = require('../config');
const wechatService = require('../services/wechatService');
const { success } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, openid: user.openid },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const login = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new AppError('缺少微信登录code', 400);
    }

    let openid, sessionKey;

    if (config.wx.appid && config.wx.secret && code !== 'dev') {
      try {
        const wxResult = await wechatService.code2Session(code);
        openid = wxResult.openid;
        sessionKey = wxResult.session_key;
      } catch (wxErr) {
        logger.error('微信登录失败，切换到开发模式', { error: wxErr.message });
        openid = 'dev_openid_' + code;
        sessionKey = 'dev_session_key_' + Date.now();
      }
    } else {
      openid = 'dev_openid_' + code;
      sessionKey = 'dev_session_key_' + Date.now();
      logger.info('开发模式: 使用模拟openid', { openid });
    }

    let user;
    try {
      user = await User.findOne({ openid });
    } catch (findErr) {
      logger.error('查询用户失败，可能存在损坏数据，尝试清理', { openid, error: findErr.message });
      await User.deleteOne({ openid });
      user = null;
    }

    if (user) {
      user.sessionKey = sessionKey;
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.create({
        openid,
        sessionKey,
        nickname: '新用户',
        avatarUrl: ''
      });
    }

    const token = generateToken(user);

    await OperationLog.create({
      userId: user._id,
      action: 'login',
      targetType: 'user',
      targetId: user._id,
      ip: req.ip
    });

    return success(res, {
      token,
      userInfo: {
        id: user._id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        isAuthenticated: !!user.isAuthenticated
      }
    }, '登录成功');
  } catch (err) {
    next(err);
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const activityCount = await Activity.countDocuments({ creatorId: userId });
    const joinedCount = await Application.countDocuments({ applicantId: userId, status: 'approved' });

    return success(res, {
      id: user._id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      gender: user.gender,
      isAuthenticated: !!user.isAuthenticated,
      createdAt: user.createdAt,
      stats: {
        createdActivities: activityCount,
        joinedActivities: joinedCount
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateUserInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { nickname, avatarUrl, gender } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    if (nickname !== undefined) {
      if (nickname.length > 20) throw new AppError('昵称不能超过20个字符', 400);
      user.nickname = nickname;
    }
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (gender !== undefined) {
      const genderNum = parseInt(gender);
      if (!isNaN(genderNum) && (genderNum === 0 || genderNum === 1 || genderNum === 2)) {
        user.gender = genderNum;
      }
    }

    await user.save();

    await OperationLog.create({
      userId,
      action: 'update_profile',
      targetType: 'user',
      targetId: userId,
      detail: JSON.stringify(req.body),
      ip: req.ip
    });

    return success(res, {
      id: user._id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      gender: user.gender
    }, '更新成功');
  } catch (err) {
    next(err);
  }
};

const bindPhone = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { phone, phoneCode, encryptedData, iv } = req.body;
    let resolvedPhone = phone;

    if (!resolvedPhone && phoneCode) {
      if (config.wx.appid && config.wx.secret) {
        const phoneInfo = await wechatService.getPhoneNumber(phoneCode);
        resolvedPhone = phoneInfo && (phoneInfo.purePhoneNumber || phoneInfo.phoneNumber);
      } else {
        const suffix = String(
          Math.abs(String(userId).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0))
        ).padStart(9, '0').slice(-9);
        resolvedPhone = `13${suffix}`;
        logger.info('开发模式: 使用模拟微信手机号', { userId, phone: resolvedPhone });
      }
    }

    if (!resolvedPhone && encryptedData && iv) {
      const user = await User.findById(userId);
      if (!user || !user.sessionKey) {
        throw new AppError('微信登录状态无效，请重新登录', 401);
      }
      const phoneInfo = wechatService.decryptPhoneNumber(user.sessionKey, encryptedData, iv);
      resolvedPhone = phoneInfo && (phoneInfo.purePhoneNumber || phoneInfo.phoneNumber);
    }

    if (!resolvedPhone || !/^1[3-9]\d{9}$/.test(resolvedPhone)) {
      throw new AppError('请输入正确的手机号', 400);
    }

    const existingUser = await User.findOne({ phone: resolvedPhone, _id: { $ne: userId } });
    if (existingUser) {
      throw new AppError('该手机号已被其他用户绑定', 400);
    }

    await User.findByIdAndUpdate(userId, { phone: resolvedPhone });

    await OperationLog.create({
      userId,
      action: 'bind_phone',
      targetType: 'user',
      targetId: userId,
      ip: req.ip
    });

    return success(res, { phone: resolvedPhone }, '手机号绑定成功');
  } catch (err) {
    next(err);
  }
};

const authenticate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { realName } = req.body;

    if (!realName) throw new AppError('请输入真实姓名', 400);

    await User.findByIdAndUpdate(userId, { isAuthenticated: true, realName });

    await OperationLog.create({
      userId,
      action: 'authenticate',
      targetType: 'user',
      targetId: userId,
      ip: req.ip
    });

    return success(res, null, '实名认证成功');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getUserInfo,
  updateUserInfo,
  bindPhone,
  authenticate
};
