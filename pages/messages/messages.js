// messages.js
const app = getApp();

Page({
  data: {
    messages: []
  },

  onLoad() {
    this.loadMessages();
  },

  // 加载消息
  loadMessages() {
    wx.showLoading({
      title: '加载中...'
    });

    // 模拟数据
    setTimeout(() => {
      const mockMessages = [
        {
          id: '1',
          icon: '📋',
          title: '申请通过通知',
          content: '您申请加入的「周末羽毛球局」已通过审核，欢迎加入！',
          time: '2026-04-15 10:30',
          read: false
        },
        {
          id: '2',
          icon: '🔔',
          title: '系统公告',
          content: '搭哒小程序已更新至最新版本，新增了消息通知功能',
          time: '2026-04-14 18:00',
          read: true
        },
        {
          id: '3',
          icon: '📋',
          title: '申请拒绝通知',
          content: '您申请加入的「剧本杀组队」未通过审核，原因：本次活动需要有一定经验的玩家',
          time: '2026-04-13 20:00',
          read: true
        }
      ];

      wx.hideLoading();
      this.setData({ messages: mockMessages });
    }, 1000);
  },

  // 查看消息
  viewMessage(e) {
    const messageId = e.currentTarget.dataset.id;
    // 标记消息为已读
    const messages = this.data.messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, read: true };
      }
      return msg;
    });
    this.setData({ messages });
    
    wx.showToast({
      title: '消息已标记为已读',
      icon: 'success'
    });
  }
});
