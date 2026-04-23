const { post } = require('../../utils/request.js');

Page({
  data: {
    reason: '',
    gridId: ''
  },

  onLoad(options) {
    this.setData({ gridId: options.gridId });
  },

  bindReasonInput(e) {
    this.setData({ reason: e.detail.value });
  },

  submitApply() {
    const { reason, gridId } = this.data;
    if (!reason || !reason.trim()) {
      wx.showToast({ title: '请输入申请理由', icon: 'none' });
      return;
    }

    post('/applications/' + gridId + '/apply', { reason: reason.trim() })
      .then(() => {
        wx.showToast({ title: '申请提交成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      })
      .catch((err) => {
        console.error('提交申请失败', err);
      });
  }
});
