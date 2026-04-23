const { get, post, put, del } = require('../../utils/request.js');

Page({
  data: {
    grids: [],
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad() {
    this.loadMyGrids(true);
  },

  onPullDownRefresh() {
    this.loadMyGrids(true).then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore) this.loadMyGrids(false);
  },

  loadMyGrids(reset = false) {
    if (reset) this.setData({ page: 1, hasMore: true });

    const { page, pageSize } = this.data;
    return get('/activities/my', { page, pageSize })
      .then((data) => {
        const grids = data.list.map(item => ({
          id: item.id,
          title: item.title,
          type: item.categoryName,
          currentMembers: item.currentMembers,
          maxMembers: item.maxMembers,
          time: item.startTime,
          location: item.address,
          status: item.status === 'published' ? '招募中' :
                  item.status === 'draft' ? '草稿' :
                  item.status === 'ongoing' ? '进行中' : '已结束',
          cover: item.cover
        }));

        this.setData({
          grids: reset ? grids : this.data.grids.concat(grids),
          hasMore: grids.length >= pageSize,
          page: page + 1
        });
      })
      .catch((err) => {
        console.error('加载我的活动失败', err);
      });
  },

  viewApplications(e) {
    const gridId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/applyRecords/applyRecords?activityId=${gridId}&mode=manage`
    });
  },

  viewMembers(e) {
    wx.showToast({ title: '查看成员功能开发中', icon: 'none' });
  },

  goToCreate() {
    wx.navigateTo({ url: '/pages/create/create' });
  }
});
