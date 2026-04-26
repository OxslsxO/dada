const { post } = require('../../utils/request.js');
const app = getApp();

Page({
  data: {
    step: 'login',
    phone: '',
    code: '',
    countdown: 0,
    name: '',
    idCard: ''
  },

  wechatLogin() {
    wx.showLoading({ title: '登录中...' });

    app.login().then((userInfo) => {
      wx.hideLoading();
      this.setData({ step: 'bindPhone' });
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    });
  },

  bindPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  bindCodeInput(e) {
    this.setData({ code: e.detail.value });
  },

  sendCode() {
    const phone = this.data.phone;
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    wx.showToast({ title: '验证码已发送', icon: 'success' });

    this.setData({ countdown: 60 });
    const timer = setInterval(() => {
      this.setData({ countdown: this.data.countdown - 1 });
      if (this.data.countdown <= 0) clearInterval(timer);
    }, 1000);
  },

  submitPhone() {
    const { phone, code } = this.data;
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (!code || code.length !== 6) {
      wx.showToast({ title: '请输入正确的验证码', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '绑定中...' });
    app.bindPhone(phone).then(() => {
      wx.hideLoading();
      this.setData({ step: 'authenticate' });
    }).catch(() => {
      wx.hideLoading();
    });
  },

  bindNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  bindIdCardInput(e) {
    this.setData({ idCard: e.detail.value });
  },

  submitAuth() {
    const { name, idCard } = this.data;
    if (!name) {
      wx.showToast({ title: '请输入真实姓名', icon: 'none' });
      return;
    }
    if (!idCard || idCard.length !== 18) {
      wx.showToast({ title: '请输入正确的身份证号', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '验证中...' });
    app.authenticate({ realName: name, idCard }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '验证成功', icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/index/index' });
      }, 1500);
    }).catch(() => {
      wx.hideLoading();
    });
  }
});
