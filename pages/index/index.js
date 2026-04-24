const { get } = require('../../utils/request.js');

Page({
  data: {
    activeTab: 0,
    tabIndex: 0,
    tabList: ["全部", "饭搭子", "运动搭子", "游戏搭子", "探店搭子", "学习搭子", "出行搭子", "娱乐搭子", "健身搭子", "宠物搭子", "其他"],
    showFilterPanel: false,
    filterOptions: {
      type: '全部',
      time: '全部',
      location: '全部',
      people: '全部'
    },
    hasActiveFilters: false,
    activeFilters: {
      type: '',
      time: '',
      location: '',
      people: ''
    },

    typeOptions: ['全部', '饭搭子', '运动搭子', '游戏搭子', '探店搭子', '学习搭子', '出行搭子', '娱乐搭子', '健身搭子', '宠物搭子', '其他'],
    timeOptions: ['全部', '今天', '明天', '本周', '周末', '自定义'],
    startTime: '',
    endTime: '',
    startTimeText: '选择开始时间',
    endTimeText: '选择结束时间',
    locationOptions: ['全部', '朝阳', '海淀', '东城', '西城', '丰台'],
    peopleOptions: ['全部', '2-3人', '4-6人', '7-10人', '10人以上'],
    activityList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: ''
  },

  onLoad() {
    const now = new Date();
    const defaultEndTime = new Date();
    defaultEndTime.setDate(now.getDate() + 7);

    this.setData({
      startTime: now.getTime(),
      endTime: defaultEndTime.getTime(),
      startTimeText: this.formatDateTime(now),
      endTimeText: this.formatDateTime(defaultEndTime)
    });

    this.loadActivityList(true);
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadActivityList(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadActivityList(false);
    }
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

  formatDateTime(date) {
    if (typeof date === 'number') date = new Date(date);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
  },

  loadActivityList(reset = false) {
    if (reset) {
      this.setData({ page: 1, hasMore: true });
    }

    const { page, pageSize, filterOptions, keyword, tabList, activeTab } = this.data;
    const params = {
      page,
      pageSize,
      sortBy: 'created_at',
      sortOrder: 'DESC'
    };

    const currentTab = tabList[activeTab];
    if (currentTab && currentTab !== '全部') {
      params.category = currentTab;
    }

    if (filterOptions.type !== '全部') params.category = filterOptions.type;
    if (filterOptions.location !== '全部') params.location = filterOptions.location;
    if (filterOptions.time !== '全部' && filterOptions.time !== '自定义') {
      params.timeRange = filterOptions.time === '今天' ? 'today' :
                         filterOptions.time === '明天' ? 'tomorrow' : 'thisWeek';
    }
    if (keyword) params.keyword = keyword;

    return get('/activities/list', params, { showLoading: reset })
      .then((data) => {
        const list = data.list.map(item => ({
          id: item.id,
          type: item.categoryName,
          title: item.title,
          location: item.address,
          currentNum: item.currentMembers,
          totalNum: item.maxMembers,
          avatar: (item.creator && item.creator.avatarUrl) || '',
          nickname: (item.creator && item.creator.nickname) || '匿名用户',
          cover: item.cover || '',
          tags: item.tags || [],
          time: item.startTime,
          timeText: this.formatDisplayTime(item.startTime),
          description: item.description
        }));

        this.setData({
          activityList: reset ? list : this.data.activityList.concat(list),
          hasMore: list.length >= pageSize,
          page: page + 1
        });
      })
      .catch((err) => {
        console.error('加载活动列表失败', err);
      });
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    this.loadActivityList(true);
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  joinActivity(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/apply/apply?gridId=${id}` });
  },

  stopBubble() {},

  stopPropagation(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (e && e.preventDefault) e.preventDefault();
  },

  goToMessages() {
    wx.switchTab({ url: '/pages/messages/messages' });
  },

  toggleFilter() {
    const newState = !this.data.showFilterPanel;
    this.setData({ showFilterPanel: newState });
    if (newState) {
      wx.setPageStyle({ style: { overflow: 'hidden', height: '100vh' } });
    } else {
      wx.setPageStyle({ style: { overflow: 'auto', height: 'auto' } });
    }
  },

  closeFilter() {
    this.setData({ showFilterPanel: false });
    wx.setPageStyle({ style: { overflow: 'auto', height: 'auto' } });
  },

  selectType(e) {
    this.setData({ 'filterOptions.type': e.currentTarget.dataset.value });
  },

  selectTime(e) {
    this.setData({ 'filterOptions.time': e.currentTarget.dataset.value });
  },

  selectLocation(e) {
    this.setData({ 'filterOptions.location': e.currentTarget.dataset.value });
  },

  selectPeople(e) {
    this.setData({ 'filterOptions.people': e.currentTarget.dataset.value });
  },

  resetFilter() {
    this.setData({
      filterOptions: { type: '全部', time: '全部', location: '全部', people: '全部' }
    });
    this.updateFilterStatus();
  },

  confirmFilter() {
    this.applyFilter();
    this.setData({ showFilterPanel: false });
    this.updateFilterStatus();
  },

  updateFilterStatus() {
    const { filterOptions } = this.data;
    const activeFilters = {
      type: filterOptions.type !== '全部' ? filterOptions.type : '',
      time: filterOptions.time !== '全部' ? filterOptions.time : '',
      location: filterOptions.location !== '全部' ? filterOptions.location : '',
      people: filterOptions.people !== '全部' ? filterOptions.people : ''
    };
    const hasActiveFilters = Object.values(activeFilters).some(v => v !== '');
    this.setData({ hasActiveFilters, activeFilters });
    if (filterOptions.type !== '全部') this.syncFilterTypeWithTab(filterOptions.type);
  },

  syncFilterTypeWithTab(filterType) {
    const tabIndex = this.data.tabList.indexOf(filterType);
    if (tabIndex !== -1) this.setData({ activeTab: tabIndex });
  },

  applyFilter() {
    this.loadActivityList(true);
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadActivityList(true);
  }
});
