const axios = require('axios');
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
  msgSecCheck
};
