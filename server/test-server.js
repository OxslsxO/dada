require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dada';
const WX_APPID = process.env.WX_APPID;
const WX_SECRET = process.env.WX_SECRET;

console.log('WX_APPID:', WX_APPID ? '***' : '未配置');
console.log('WX_SECRET:', WX_SECRET ? '***' : '未配置');

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB 连接成功'))
  .catch(err => console.error('MongoDB 连接失败:', err.message));

const UserSchema = new mongoose.Schema({
  openid: String,
  sessionKey: String,
  nickname: String,
  phone: String,
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

function generateToken(user) {
  return jwt.sign({ id: user._id, openid: user.openid }, JWT_SECRET, { expiresIn: '7d' });
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const { code } = req.body;
    console.log('收到登录请求，code:', code);
    
    if (!code) {
      return res.status(400).json({ code: 400, message: '缺少code' });
    }

    let openid, sessionKey;

    if (WX_APPID && WX_SECRET) {
      console.log('使用真实微信登录');
      const axios = require('axios');
      const url = 'https://api.weixin.qq.com/sns/jscode2session';
      const params = {
        appid: WX_APPID,
        secret: WX_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      };
      
      try {
        const response = await axios.get(url, { params, timeout: 10000 });
        const data = response.data;
        
        if (data.errcode) {
          console.error('微信登录失败:', data.errmsg);
          return res.status(400).json({ code: -1, message: '微信登录失败: ' + data.errmsg });
        }
        
        openid = data.openid;
        sessionKey = data.session_key;
        console.log('微信登录成功，openid:', openid);
      } catch (err) {
        console.error('微信API请求失败:', err.message);
        return res.status(500).json({ code: -1, message: '微信登录接口调用失败' });
      }
    } else {
      console.log('使用开发模式登录');
      openid = 'dev_openid_' + code;
      sessionKey = 'dev_session_key_' + Date.now();
    }

    let user = await User.findOne({ openid });
    
    if (user) {
      user.sessionKey = sessionKey;
      user.lastLoginAt = new Date();
      await user.save();
      console.log('用户已存在，更新登录时间');
    } else {
      user = await User.create({
        openid,
        sessionKey,
        nickname: '新用户',
        phone: null
      });
      console.log('创建新用户:', user._id);
    }

    const token = generateToken(user);
    
    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: user._id,
          nickname: user.nickname,
          phone: user.phone
        }
      }
    });
    
  } catch (err) {
    console.error('登录接口错误:', err.message);
    res.status(500).json({ code: -1, message: '服务器错误: ' + err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'ok', data: { status: 'running' } });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在端口 ${PORT}`);
});