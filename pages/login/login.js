const app = getApp();

Page({
  data: {
    step: 'login',
    name: '',
    idCard: '',
    privacyAgreed: false,
    isBindingPhone: false
  },

  onLoad(options) {
    if (options && options.step) {
      this.setData({ step: options.step });
    }
    if (this.data.step === 'bindPhone' && !wx.getStorageSync('token')) {
      this.setData({ step: 'login' });
    }
    this.preparePrivacyAuthorization();
  },

  preparePrivacyAuthorization() {
    if (!wx.requirePrivacyAuthorize) {
      this.setData({ privacyAgreed: true });
      return;
    }

    wx.requirePrivacyAuthorize({
      success: () => {
        this.setData({ privacyAgreed: true });
      },
      fail: () => {
        this.setData({ privacyAgreed: false });
      }
    });
  },

  onAgreePrivacy() {
    this.setData({ privacyAgreed: true });
  },

  wechatLogin() {
    wx.showLoading({ title: '登录中...' });

    app.login()
      .then((userInfo) => {
        wx.hideLoading();
        if (userInfo.phone) {
          wx.reLaunch({ url: '/pages/index/index' });
          return;
        }
        this.setData({ step: 'bindPhone' });
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      });
  },

  bindWechatPhone(e) {
    const detail = e.detail || {};
    const errMsg = detail.errMsg || '';
    console.log('getPhoneNumber detail:', detail);

    if (errMsg.indexOf('fail') !== -1 || errMsg.indexOf('deny') !== -1) {
      wx.showToast({ title: this.getPhoneAuthFailMessage(errMsg), icon: 'none' });
      return;
    }

    const payload = {};
    if (detail.code) {
      payload.phoneCode = detail.code;
    } else if (detail.encryptedData && detail.iv) {
      payload.encryptedData = detail.encryptedData;
      payload.iv = detail.iv;
    } else {
      wx.showToast({ title: '未获取到手机号授权', icon: 'none' });
      return;
    }

    this.setData({ isBindingPhone: true });
    app.bindPhone(payload)
      .then(() => {
        wx.showToast({ title: '绑定成功', icon: 'success' });
        setTimeout(() => {
          wx.reLaunch({ url: '/pages/index/index' });
        }, 800);
      })
      .catch((err) => {
        if (err && err.isAuthError) return;
        wx.showToast({ title: '绑定失败，请重试', icon: 'none' });
      })
      .finally(() => {
        this.setData({ isBindingPhone: false });
      });
  },

  getPhoneAuthFailMessage(errMsg) {
    if (errMsg.indexOf('privacy') !== -1) return '请先同意隐私协议';
    if (errMsg.indexOf('permission') !== -1 || errMsg.indexOf('auth deny') !== -1) return '当前小程序未开通手机号能力';
    if (errMsg.indexOf('user deny') !== -1 || errMsg.indexOf('deny') !== -1) return '需要授权手机号后继续';
    return '未唤起手机号授权，请查看控制台错误';
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
    app.authenticate({ realName: name, idCard })
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '验证成功', icon: 'success' });
        setTimeout(() => {
          wx.redirectTo({ url: '/pages/index/index' });
        }, 1500);
      })
      .catch(() => {
        wx.hideLoading();
      });
  }
});
