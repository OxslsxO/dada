const axios = require('axios');
const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');

const code2Session = async (code) => {
  const url = 'https://api.weixin.qq.com/sns/jscode2session';
  const params = {
    appid: config.wx.appid,
    secret: config.wx.secret,
    js_code: code,
    grant_type: 'authorization_code'
  };

  try {
    const response = await axios.get(url, { params, timeout: 10000 });
    const data = response.data;

    if (data.errcode) {
      logger.error('微信登录接口错误', { errcode: data.errcode, errmsg: data.errmsg });
      throw new Error(`微信登录失败: ${data.errmsg}`);
    }

    return {
      openid: data.openid,
      session_key: data.session_key,
      unionid: data.unionid || null
    };
  } catch (err) {
    logger.error('微信登录请求异常', { error: err.message });
    throw err;
  }
};

const getAccessToken = async () => {
  const url = 'https://api.weixin.qq.com/cgi-bin/token';
  const params = {
    grant_type: 'client_credential',
    appid: config.wx.appid,
    secret: config.wx.secret
  };

  try {
    const response = await axios.get(url, { params, timeout: 10000 });
    return response.data;
  } catch (err) {
    logger.error('获取AccessToken异常', { error: err.message });
    throw err;
  }
};

const getPhoneNumber = async (code) => {
  const tokenResult = await getAccessToken();
  const accessToken = tokenResult.access_token;

  if (!accessToken) {
    logger.error('获取微信手机号失败：AccessToken为空', tokenResult);
    throw new Error(tokenResult.errmsg || '获取微信AccessToken失败');
  }

  const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;

  try {
    const response = await axios.post(url, { code }, { timeout: 10000 });
    const data = response.data;

    if (data.errcode !== 0) {
      logger.error('微信手机号接口错误', { errcode: data.errcode, errmsg: data.errmsg });
      throw new Error(`获取微信手机号失败: ${data.errmsg}`);
    }

    return data.phone_info;
  } catch (err) {
    logger.error('微信手机号请求异常', { error: err.message });
    throw err;
  }
};

const decryptPhoneNumber = (sessionKey, encryptedData, iv) => {
  try {
    const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
    decipher.setAutoPadding(true);

    let decoded = decipher.update(encryptedDataBuffer, undefined, 'utf8');
    decoded += decipher.final('utf8');

    return JSON.parse(decoded);
  } catch (err) {
    logger.error('微信手机号解密失败', { error: err.message });
    throw err;
  }
};

const msgSecCheck = async (accessToken, content) => {
  const url = `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${accessToken}`;
  try {
    const response = await axios.post(url, {
      content,
      version: 2,
      scene: 1,
      openid: ''
    }, { timeout: 10000 });
    return response.data.errcode === 0;
  } catch (err) {
    logger.error('内容安全检测异常', { error: err.message });
    return true;
  }
};

module.exports = {
  code2Session,
  getAccessToken,
  getPhoneNumber,
  decryptPhoneNumber,
  msgSecCheck
};
