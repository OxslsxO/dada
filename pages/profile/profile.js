const { get, post, put, del } = require('../../utils/request.js');
const app = getApp();

Page({
  data: {
    userInfo: {},
    isAuthenticated: false
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo || {
      avatarUrl: '',
      nickname: '未登录用户'
    };

    this.setData({
      userInfo,
      isAuthenticated: app.globalData.isAuthenticated
    });

    if (app.globalData.token) {
      get('/auth/userinfo', {}, { showLoading: false })
        .then((data) => {
          const info = {
            id: data.id,
            nickname: data.nickname,
            avatarUrl: data.avatarUrl,
            phone: data.phone,
            isAuthenticated: data.isAuthenticated,
            stats: data.stats
          };
          this.setData({ userInfo: info, isAuthenticated: info.isAuthenticated });
        })
        .catch(() => {});
    }
  },

  editProfile() {
    wx.showToast({ title: '编辑资料功能开发中', icon: 'none' });
  },

  goToMyGrids() {
    wx.navigateTo({ url: '/pages/myGrids/myGrids' });
  },

  goToMyDadas() {
    wx.showToast({ title: '我的搭子功能开发中', icon: 'none' });
  },

  goToApplyRecords() {
    wx.navigateTo({ url: '/pages/applyRecords/applyRecords' });
  },

  goToSecurity() {
    wx.showToast({ title: '安全设置功能开发中', icon: 'none' });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  }
});
