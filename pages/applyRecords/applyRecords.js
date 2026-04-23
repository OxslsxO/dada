const { get, post, put } = require('../../utils/request.js');

Page({
  data: {
    records: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    mode: 'my',
    activityId: ''
  },

  onLoad(options) {
    const mode = options.mode || 'my';
    const activityId = options.activityId || '';
    this.setData({ mode, activityId });
    this.loadRecords(true);
  },

  onPullDownRefresh() {
    this.loadRecords(true).then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore) this.loadRecords(false);
  },

  loadRecords(reset = false) {
    if (reset) this.setData({ page: 1, hasMore: true });

    const { page, pageSize, mode, activityId } = this.data;

    let apiPath;
    if (mode === 'manage' && activityId) {
      apiPath = `/applications/${activityId}/applications`;
    } else {
      apiPath = '/applications/my';
    }

    return get(apiPath, { page, pageSize })
      .then((data) => {
        const records = data.list.map(item => ({
          id: item.id,
          gridTitle: (item.activity && item.activity.title) || '未知活动',
          status: item.status === 'pending' ? '待审核' :
                  item.status === 'approved' ? '已通过' :
                  item.status === 'rejected' ? '已拒绝' :
                  item.status === 'quit' ? '已退出' : item.status,
          applyTime: item.createdAt,
          reason: item.reason,
          feedback: item.handlerRemark || '',
          applicant: item.applicant ? item.applicant.nickname : '',
          applicantAvatar: item.applicant ? item.applicant.avatarUrl : ''
        }));

        this.setData({
          records: reset ? records : this.data.records.concat(records),
          hasMore: records.length >= pageSize,
          page: page + 1
        });
      })
      .catch((err) => {
        console.error('加载申请记录失败', err);
      });
  },

  handleApplication(e) {
    const { id, action } = e.currentTarget.dataset;
    const remark = '';

    put(`/applications/${id}/handle`, { action, remark })
      .then(() => {
        wx.showToast({
          title: action === 'approve' ? '已通过' : '已拒绝',
          icon: 'success'
        });
        this.loadRecords(true);
      })
      .catch((err) => {
        console.error('处理申请失败', err);
      });
  },

  goToHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
