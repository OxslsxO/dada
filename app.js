const { post, get } = require('./utils/request.js');

App({
  globalData: {
    userInfo: null,
    token: null,
    isAuthenticated: false
  },

  onLaunch() {
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isAuthenticated = userInfo.isAuthenticated || false;
    }
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            post('/auth/login', { code: res.code }, { showLoading: true, loadingText: '登录中...' })
              .then((data) => {
                const userInfo = {
                  id: data.userInfo.id,
                  nickname: data.userInfo.nickname,
                  avatarUrl: data.userInfo.avatarUrl,
                  phone: data.userInfo.phone,
                  isAuthenticated: data.userInfo.isAuthenticated
                };

                this.globalData.token = data.token;
                this.globalData.userInfo = userInfo;
                this.globalData.isAuthenticated = userInfo.isAuthenticated;

                wx.setStorageSync('token', data.token);
                wx.setStorageSync('userInfo', userInfo);

                resolve(userInfo);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            reject(new Error('微信登录失败'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  bindPhone(phone) {
    return post('/auth/bind-phone', { phone });
  },

  authenticate(info) {
    return post('/auth/authenticate', info).then(() => {
      this.globalData.isAuthenticated = true;
      const userInfo = this.globalData.userInfo;
      userInfo.isAuthenticated = true;
      wx.setStorageSync('userInfo', userInfo);
      return true;
    });
  },

  logout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.userInfo = null;
    this.globalData.token = null;
    this.globalData.isAuthenticated = false;
  },

  onError(error) {
    console.error('全局错误:', error);
  }
});
