const { post } = require('../../utils/request.js');
const { uploadFiles } = require('../../utils/request.js');

const typeWithTags = {
  food: ['火锅', '烧烤', '日料', '下午茶', '宵夜', '奶茶', '咖啡', '聚餐'],
  sports: ['羽毛球', '篮球', '跑步', '游泳', '瑜伽', '骑行', '健身', '乒乓球'],
  game: ['王者荣耀', '原神', 'LOL', '桌游', '剧本杀', '电竞', '吃鸡', '手游'],
  shopping: ['探店', '逛街', '打卡', '美食', '购物', '拍照', '网红店'],
  study: ['考研', '考公', '英语', '自习', '考证', '阅读', '学习', '备考'],
  travel: ['周边游', '露营', '自驾游', '看海', '爬山', '摄影', '旅行', '徒步'],
  entertainment: ['电影', 'KTV', '演唱会', '看展', 'livehouse', '音乐节', '话剧'],
  fitness: ['健身', '撸铁', '瑜伽', '普拉提', '游泳', '跑步', '健身', '塑形'],
  pet: ['遛狗', '撸猫', '宠物聚会', '宠物摄影', '宠物训练'],
  other: []
};

Page({
  data: {
    types: [
      { id: 'food', name: '饭搭子' },
      { id: 'sports', name: '运动搭子' },
      { id: 'game', name: '游戏搭子' },
      { id: 'shopping', name: '探店搭子' },
      { id: 'study', name: '学习搭子' },
      { id: 'travel', name: '出行搭子' },
      { id: 'entertainment', name: '娱乐搭子' },
      { id: 'fitness', name: '健身搭子' },
      { id: 'pet', name: '宠物搭子' },
      { id: 'other', name: '其他' }
    ],
    typeIndex: 0,
    presetTags: [],
    selectedTags: [],
    customTagValue: '',
    timeValue: '',
    timeText: '请选择活动时间',
    startTime: '',
    locationInfo: {},
    manualLocation: '',
    imageList: [],
    isSubmitting: false
  },

  onLoad() {
    const now = new Date();
    const startTime = now.getFullYear() + '-' +
                    (now.getMonth() + 1).toString().padStart(2, '0') + '-' +
                    now.getDate().toString().padStart(2, '0') + ' ' +
                    now.getHours().toString().padStart(2, '0') + ':' +
                    now.getMinutes().toString().padStart(2, '0');

    this.setData({
      startTime,
      timeValue: now.getTime(),
      presetTags: typeWithTags[this.data.types[0].id]
    });
  },

  bindTypeChange(e) {
    const typeIndex = e.detail.value;
    const typeId = this.data.types[typeIndex].id;
    this.setData({
      typeIndex,
      presetTags: typeWithTags[typeId] || [],
      selectedTags: []
    });
  },

  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const selectedTags = [...this.data.selectedTags];
    const index = selectedTags.indexOf(tag);

    if (index !== -1) {
      selectedTags.splice(index, 1);
    } else {
      if (selectedTags.length < 5) {
        selectedTags.push(tag);
      } else {
        wx.showToast({ title: '最多选择5个标签', icon: 'none' });
        return;
      }
    }
    this.setData({ selectedTags });
  },

  onCustomTagInput(e) {
    this.setData({ customTagValue: e.detail.value });
  },

  addCustomTag() {
    const tag = this.data.customTagValue.trim();
    if (!tag) {
      wx.showToast({ title: '请输入标签内容', icon: 'none' });
      return;
    }
    if (this.data.selectedTags.length >= 5) {
      wx.showToast({ title: '最多选择5个标签', icon: 'none' });
      return;
    }
    if (this.data.selectedTags.indexOf(tag) !== -1) {
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }
    this.setData({ selectedTags: [...this.data.selectedTags, tag], customTagValue: '' });
  },

  removeTag(e) {
    const index = e.currentTarget.dataset.index;
    const selectedTags = [...this.data.selectedTags];
    selectedTags.splice(index, 1);
    this.setData({ selectedTags });
  },

  bindTimeChange(e) {
    const date = new Date(e.detail.value);
    const timeText = date.getFullYear() + '-' +
                    (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
                    date.getDate().toString().padStart(2, '0') + ' ' +
                    date.getHours().toString().padStart(2, '0') + ':' +
                    date.getMinutes().toString().padStart(2, '0');

    this.setData({ timeText, timeValue: e.detail.value });
  },

  chooseLocation() {
    const that = this;
    wx.chooseLocation({
      success(res) {
        that.setData({
          locationInfo: {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          },
          manualLocation: res.name || res.address
        });
      },
      fail() {
        wx.showToast({ title: '选择位置失败', icon: 'none' });
      }
    });
  },

  onManualLocationInput(e) {
    this.setData({ manualLocation: e.detail.value });
  },

  chooseImage() {
    const remaining = 9 - this.data.imageList.length;
    if (remaining <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }

    wx.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          imageList: this.data.imageList.concat(res.tempFilePaths)
        });
      }
    });
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const imageList = [...this.data.imageList];
    imageList.splice(index, 1);
    this.setData({ imageList });
  },

  async submitForm(e) {
    if (this.data.isSubmitting) return;

    const formData = e.detail.value;

    if (!formData.title) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!formData.maxMembers || formData.maxMembers < 2) {
      wx.showToast({ title: '请输入至少2人的人数限制', icon: 'none' });
      return;
    }
    if (this.data.timeText === '请选择活动时间') {
      wx.showToast({ title: '请选择活动时间', icon: 'none' });
      return;
    }
    if (!this.data.manualLocation && !this.data.locationInfo.name) {
      wx.showToast({ title: '请选择或输入活动地点', icon: 'none' });
      return;
    }
    if (!formData.description) {
      wx.showToast({ title: '请输入详细描述', icon: 'none' });
      return;
    }
    if (this.data.selectedTags.length === 0) {
      wx.showToast({ title: '请至少选择一个标签', icon: 'none' });
      return;
    }

    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '创建中...' });

    try {
      let imageUrls = [];
      if (this.data.imageList.length > 0) {
        try {
          const uploadResults = await uploadFiles(this.data.imageList);
          imageUrls = uploadResults.flat();
        } catch (err) {
          console.error('图片上传失败', err);
        }
      }

      const activityData = {
        title: formData.title,
        description: formData.description,
        categoryName: this.data.types[this.data.typeIndex].name,
        images: imageUrls,
        startTime: this.data.timeText,
        address: this.data.manualLocation || this.data.locationInfo.name || '',
        latitude: this.data.locationInfo.latitude || 0,
        longitude: this.data.locationInfo.longitude || 0,
        maxMembers: parseInt(formData.maxMembers),
        tags: this.data.selectedTags,
        requirements: formData.requirements || '',
        cover: imageUrls.length > 0 ? imageUrls[0] : '',
        status: 'published'
      };

      await post('/activities', activityData, { showLoading: false });

      wx.hideLoading();
      wx.showToast({ title: '创建成功', icon: 'success' });

      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);
    } catch (err) {
      wx.hideLoading();
      console.error('创建活动失败', err);
      wx.showToast({ title: '创建失败，请重试', icon: 'none' });
    } finally {
      this.setData({ isSubmitting: false });
    }
  }
});
