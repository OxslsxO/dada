const { post, uploadFiles } = require('../../utils/request.js');

const typeWithTags = {
  food: ['火锅', '烧烤', '日料', '下午茶', '宵夜', '奶茶', '咖啡', '聚餐'],
  sports: ['羽毛球', '篮球', '跑步', '游泳', '瑜伽', '骑行', '健身', '乒乓球'],
  game: ['王者荣耀', '原神', 'LOL', '桌游', '剧本杀', '电竞', '吃鸡', '手游'],
  shopping: ['探店', '逛街', '打卡', '美食', '购物', '拍照', '网红店'],
  study: ['考研', '考公', '英语', '自习', '考证', '阅读', '学习', '备考'],
  travel: ['周边游', '露营', '自驾游', '看海', '爬山', '摄影', '旅行', '徒步'],
  entertainment: ['电影', 'KTV', '演唱会', '看展', 'livehouse', '音乐节', '话剧'],
  fitness: ['健身', '撸铁', '瑜伽', '普拉提', '游泳', '跑步', '塑形'],
  pet: ['遛狗', '撸猫', '宠物聚会', '宠物摄影', '宠物训练'],
  other: ['约伴', '同城', '周末', '新手友好', 'AA制']
};

function buildPresetTags(typeId, selectedTags = []) {
  return (typeWithTags[typeId] || []).map(name => ({
    name,
    selected: selectedTags.indexOf(name) !== -1
  }));
}

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
    presetTags: buildPresetTags('food'),
    selectedTags: [],
    customTagValue: '',
    maxMembers: 6,
    minDate: '',
    startDate: '',
    startClock: '',
    endDate: '',
    endClock: '',
    hasStartTime: false,
    showEndTimePanel: false,
    locationInfo: {},
    manualLocation: '',
    imageList: [],
    showPhonePanel: false,
    privacyAgreed: false,
    isBindingPhone: false,
    isSubmitting: false
  },

  onLoad() {
    const now = new Date();
    this.setData({ minDate: this.formatDate(now) });

    getApp().ensureLogin().then(() => {
      this.showPhonePanelIfNeeded();
    });
  },

  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  formatClock(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
  },

  composeDateTime(date, clock) {
    if (!date || !clock) return '';
    return `${date} ${clock}`;
  },

  parseDateTime(value) {
    if (!value) return null;
    const date = new Date(value.replace(/-/g, '/'));
    return Number.isNaN(date.getTime()) ? null : date;
  },

  showPhonePanelIfNeeded() {
    const app = getApp();
    const userInfo = (app.globalData && app.globalData.userInfo) || wx.getStorageSync('userInfo') || {};
    if (!userInfo.phone) {
      this.setData({ showPhonePanel: true });
      this.preparePrivacyAuthorization();
      return true;
    }
    return false;
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

  hidePhonePanel() {
    this.setData({ showPhonePanel: false });
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
      wx.showToast({ title: '未获取到手机号授权，请重试', icon: 'none' });
      return;
    }

    this.setData({ isBindingPhone: true });
    getApp().bindPhone(payload)
      .then(() => {
        wx.showToast({ title: '绑定成功', icon: 'success' });
        this.setData({ showPhonePanel: false });
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
    if (errMsg.indexOf('user deny') !== -1 || errMsg.indexOf('deny') !== -1) return '绑定手机号后才能发布活动';
    return '未唤起手机号授权，请查看控制台错误';
  },

  selectType(e) {
    const typeIndex = Number(e.currentTarget.dataset.index);
    const typeId = this.data.types[typeIndex].id;
    this.setData({
      typeIndex,
      presetTags: buildPresetTags(typeId),
      selectedTags: []
    });
  },

  syncPresetTags(selectedTags) {
    const typeId = this.data.types[this.data.typeIndex].id;
    this.setData({ presetTags: buildPresetTags(typeId, selectedTags) });
  },

  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const selectedTags = [...this.data.selectedTags];
    const index = selectedTags.indexOf(tag);

    if (index !== -1) {
      selectedTags.splice(index, 1);
    } else {
      if (selectedTags.length >= 5) {
        wx.showToast({ title: '最多选择5个标签', icon: 'none' });
        return;
      }
      selectedTags.push(tag);
    }

    this.setData({ selectedTags }, () => this.syncPresetTags(selectedTags));
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

    const selectedTags = [...this.data.selectedTags, tag];
    this.setData({ selectedTags, customTagValue: '' }, () => this.syncPresetTags(selectedTags));
  },

  removeTag(e) {
    const selectedTags = [...this.data.selectedTags];
    selectedTags.splice(Number(e.currentTarget.dataset.index), 1);
    this.setData({ selectedTags }, () => this.syncPresetTags(selectedTags));
  },

  onMaxMembersChange(e) {
    this.setData({ maxMembers: e.detail.value });
  },

  bindStartDateChange(e) {
    this.setData({ startDate: e.detail.value }, () => this.updateDefaultEndTime());
  },

  bindStartClockChange(e) {
    this.setData({ startClock: e.detail.value }, () => this.updateDefaultEndTime());
  },

  bindEndDateChange(e) {
    this.setData({ endDate: e.detail.value }, () => this.ensureEndAfterStart());
  },

  bindEndClockChange(e) {
    this.setData({ endClock: e.detail.value }, () => this.ensureEndAfterStart());
  },

  updateDefaultEndTime() {
    const start = this.parseDateTime(this.composeDateTime(this.data.startDate, this.data.startClock));
    if (!start) {
      this.setData({ hasStartTime: false, showEndTimePanel: false });
      return;
    }

    const defaultEnd = new Date(start.getTime() + 30 * 60 * 1000);
    this.setData({
      hasStartTime: true,
      showEndTimePanel: true,
      endDate: this.formatDate(defaultEnd),
      endClock: this.formatClock(defaultEnd)
    });
  },

  confirmEndTime() {
    this.setData({ showEndTimePanel: false });
  },

  ensureEndAfterStart() {
    const start = this.parseDateTime(this.composeDateTime(this.data.startDate, this.data.startClock));
    const end = this.parseDateTime(this.composeDateTime(this.data.endDate, this.data.endClock));

    if (start && end && end <= start) {
      wx.showToast({ title: '结束时间需晚于开始时间', icon: 'none' });
      this.setData({ endDate: '', endClock: '' });
    }
  },

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
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
        this.setData({ imageList: this.data.imageList.concat(res.tempFilePaths) });
      }
    });
  },

  previewImage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.imageList
    });
  },

  removeImage(e) {
    const imageList = [...this.data.imageList];
    imageList.splice(Number(e.currentTarget.dataset.index), 1);
    this.setData({ imageList });
  },

  async submitForm(e) {
    if (this.data.isSubmitting) return;

    await getApp().ensureLogin();
    if (this.showPhonePanelIfNeeded()) return;

    const formData = e.detail.value;
    const title = (formData.title || '').trim();
    const description = (formData.description || '').trim();
    const requirements = (formData.requirements || '').trim();
    const address = (this.data.manualLocation || this.data.locationInfo.name || '').trim();
    const startTime = this.composeDateTime(this.data.startDate, this.data.startClock);
    const endTime = this.composeDateTime(this.data.endDate, this.data.endClock);

    if (!title) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!startTime) {
      wx.showToast({ title: '请选择开始时间', icon: 'none' });
      return;
    }
    if (!endTime) {
      wx.showToast({ title: '请选择结束时间', icon: 'none' });
      return;
    }
    if (!address) {
      wx.showToast({ title: '请选择或输入活动地点', icon: 'none' });
      return;
    }
    if (!description) {
      wx.showToast({ title: '请输入详细描述', icon: 'none' });
      return;
    }
    if (this.data.selectedTags.length === 0) {
      wx.showToast({ title: '请至少添加一个标签', icon: 'none' });
      return;
    }

    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '创建中...' });

    try {
      let imageUrls = [];
      if (this.data.imageList.length > 0) {
        const uploadResults = await uploadFiles(this.data.imageList);
        imageUrls = uploadResults.flat();
      }

      await post('/activities', {
        title,
        description,
        categoryName: this.data.types[this.data.typeIndex].name,
        images: imageUrls,
        startTime,
        endTime,
        address,
        latitude: this.data.locationInfo.latitude || 0,
        longitude: this.data.locationInfo.longitude || 0,
        maxMembers: this.data.maxMembers,
        tags: this.data.selectedTags,
        requirements,
        cover: imageUrls.length > 0 ? imageUrls[0] : '',
        status: 'published'
      }, { showLoading: false });

      wx.hideLoading();
      wx.showToast({ title: '创建成功', icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/index/index' });
      }, 1500);
    } catch (err) {
      wx.hideLoading();
      console.error('创建活动失败', err);
      if (err && err.isAuthError) return;
      wx.showToast({ title: '创建失败，请重试', icon: 'none' });
    } finally {
      this.setData({ isSubmitting: false });
    }
  }
});
