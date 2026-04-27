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

  syncUserInfo(data) {
    const userInfo = {
      id: data.id,
      nickname: data.nickname,
      avatarUrl: data.avatarUrl,
      phone: data.phone,
      isAuthenticated: data.isAuthenticated,
      stats: data.stats
    };

    this.globalData.userInfo = userInfo;
    this.globalData.isAuthenticated = !!userInfo.isAuthenticated;
    wx.setStorageSync('userInfo', userInfo);
    return userInfo;
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const cachedUserInfo = wx.getStorageSync('userInfo');

    if (!token) {
      this.logout();
      return this.login().catch(() => false);
    }

    this.globalData.token = token;
    if (cachedUserInfo) {
      this.globalData.userInfo = cachedUserInfo;
      this.globalData.isAuthenticated = !!cachedUserInfo.isAuthenticated;
    }

    return get('/auth/userinfo', {}, { showLoading: false, skipAuthRedirect: true })
      .then((data) => {
        this.syncUserInfo(data);
        return true;
      })
      .catch(() => this.login().catch(() => false));
  },

  ensureLogin() {
    if (this.globalData.token || wx.getStorageSync('token')) {
      return Promise.resolve(this.globalData.userInfo || wx.getStorageSync('userInfo'));
    }
    return this.login();
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (!res.code) {
            reject(new Error('微信登录失败'));
            return;
          }

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
              this.globalData.isAuthenticated = !!userInfo.isAuthenticated;

              wx.setStorageSync('token', data.token);
              wx.setStorageSync('userInfo', userInfo);

              resolve(userInfo);
            })
            .catch(reject);
        },
        fail: reject
      });
    });
  },

  bindPhone(phonePayload) {
    return post('/auth/bind-phone', phonePayload).then((data) => {
      const userInfo = this.globalData.userInfo || wx.getStorageSync('userInfo') || {};
      userInfo.phone = data.phone;
      this.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      return data;
    });
  },

  authenticate(info) {
    return post('/auth/authenticate', info).then(() => {
      this.globalData.isAuthenticated = true;
      const userInfo = this.globalData.userInfo || {};
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
