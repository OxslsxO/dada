const jwt = require('jsonwebtoken');
const db = require('../models/db');
const config = require('../config');
const wechatService = require('../services/wechatService');
const logService = require('../services/logService');
const { success } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, openid: user.openid },
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

    let openid, session_key;

    if (config.wx.appid && config.wx.secret) {
      const wxResult = await wechatService.code2Session(code);
      openid = wxResult.openid;
      session_key = wxResult.session_key;
    } else {
      openid = 'dev_openid_' + code;
      session_key = 'dev_session_key_' + Date.now();
      logger.info('开发模式: 使用模拟openid', { openid });
    }

    let user = db.get('SELECT * FROM users WHERE openid = ?', [openid]);

    if (user) {
      db.run(`
        UPDATE users SET session_key = ?, last_login_at = datetime('now', 'localtime')
        WHERE id = ?
      `, [session_key, user.id]);
      user.session_key = session_key;
    } else {
      const userId = 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      db.run(`
        INSERT INTO users (id, openid, session_key, nickname, avatar_url)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, openid, session_key, '新用户', '']);

      user = db.get('SELECT * FROM users WHERE id = ?', [userId]);
    }

    const token = generateToken(user);

    logService.log({
      userId: user.id,
      action: 'login',
      targetType: 'user',
      targetId: user.id,
      ip: req.ip
    });

    return success(res, {
      token,
      userInfo: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        isAuthenticated: !!user.is_authenticated
      }
    }, '登录成功');
  } catch (err) {
    next(err);
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const activityCount = db.get('SELECT COUNT(*) as count FROM activities WHERE creator_id = ?', [userId]).count;
    const joinedCount = db.get("SELECT COUNT(*) as count FROM applications WHERE applicant_id = ? AND status = 'approved'", [userId]).count;

    return success(res, {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
      phone: user.phone,
      gender: user.gender,
      isAuthenticated: !!user.is_authenticated,
      createdAt: user.created_at,
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

    const user = db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const updates = [];
    const values = [];

    if (nickname !== undefined) {
      if (nickname.length > 20) throw new AppError('昵称不能超过20个字符', 400);
      updates.push('nickname = ?');
      values.push(nickname);
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatarUrl);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      values.push(gender);
    }

    if (updates.length === 0) {
      throw new AppError('没有需要更新的字段', 400);
    }

    updates.push("updated_at = datetime('now', 'localtime')");
    values.push(userId);

    db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedUser = db.get('SELECT * FROM users WHERE id = ?', [userId]);

    logService.log({
      userId,
      action: 'update_profile',
      targetType: 'user',
      targetId: userId,
      detail: JSON.stringify(req.body),
      ip: req.ip
    });

    return success(res, {
      id: updatedUser.id,
      nickname: updatedUser.nickname,
      avatarUrl: updatedUser.avatar_url,
      gender: updatedUser.gender
    }, '更新成功');
  } catch (err) {
    next(err);
  }
};

const bindPhone = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { phone } = req.body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      throw new AppError('请输入正确的手机号', 400);
    }

    const existingUser = db.get('SELECT * FROM users WHERE phone = ? AND id != ?', [phone, userId]);
    if (existingUser) {
      throw new AppError('该手机号已被其他用户绑定', 400);
    }

    db.run(`
      UPDATE users SET phone = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [phone, userId]);

    logService.log({
      userId,
      action: 'bind_phone',
      targetType: 'user',
      targetId: userId,
      ip: req.ip
    });

    return success(res, null, '手机号绑定成功');
  } catch (err) {
    next(err);
  }
};

const authenticate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { realName, idCard } = req.body;

    if (!realName) throw new AppError('请输入真实姓名', 400);
    if (!idCard || !/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/.test(idCard)) {
      throw new AppError('请输入正确的身份证号', 400);
    }

    db.run(`
      UPDATE users SET is_authenticated = 1, real_name = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [realName, userId]);

    logService.log({
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
