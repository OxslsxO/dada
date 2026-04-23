Component({
  data: {
    activeIndex: 0
  },
  
  attached() {
    // 初始化时获取当前页面路径，设置激活的标签
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentPath = currentPage.route;
    
    // 根据当前路径设置激活的标签
    switch (currentPath) {
      case 'pages/index/index':
        this.setData({ activeIndex: 0 });
        break;
      case 'pages/create/create':
        this.setData({ activeIndex: 1 });
        break;
      case 'pages/messages/messages':
        this.setData({ activeIndex: 2 });
        break;
      case 'pages/profile/profile':
        this.setData({ activeIndex: 3 });
        break;
      default:
        this.setData({ activeIndex: 0 });
    }
  },
  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const path = e.currentTarget.dataset.path;
      
      this.setData({ activeIndex: index });
      
      wx.switchTab({
        url: path
      });
    }
  }
});