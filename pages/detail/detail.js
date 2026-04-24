const { get, post, put, del } = require('../../utils/request.js');

Page({
  data: {
    grid: {},
    isCollected: false
  },

  formatDisplayTime(value) {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');

    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  },

  onLoad(options) {
    this.loadGridDetail(options.id);
  },

  loadGridDetail(gridId) {
    get('/activities/' + gridId, {}, { showLoading: true })
      .then((data) => {
        const grid = {
          id: data.id,
          title: data.title,
          description: data.description,
          type: data.categoryName,
          location: data.address,
          locationInfo: {
            latitude: data.latitude,
            longitude: data.longitude
          },
          maxMembers: data.maxMembers,
          currentMembers: data.currentMembers,
          time: data.startTime,
          timeText: this.formatDisplayTime(data.startTime),
          tags: data.tags,
          creator: data.creator || { nickname: '匿名用户', avatarUrl: '' },
          cover: data.cover,
          images: data.images || [],
          status: data.status,
          requirements: data.requirements,
          hasApplied: data.hasApplied,
          applicationStatus: data.applicationStatus
        };
        this.setData({ grid });
      })
      .catch((err) => {
        console.error('加载详情失败', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      });
  },

  toggleCollect() {
    this.setData({ isCollected: !this.data.isCollected });
    wx.showToast({
      title: this.data.isCollected ? '收藏成功' : '取消收藏',
      icon: 'success'
    });
  },

  applyToJoin() {
    wx.navigateTo({
      url: '/pages/apply/apply?gridId=' + this.data.grid.id
    });
  }
});
