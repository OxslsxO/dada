// empty.js
Component({
  properties: {
    visible: {
      type: Boolean,
      value: true
    },
    icon: {
      type: String,
      value: '🔍'
    },
    text: {
      type: String,
      value: '暂无数据'
    },
    desc: {
      type: String,
      value: ''
    },
    btnText: {
      type: String,
      value: ''
    }
  },
  methods: {
    handleBtnClick() {
      this.triggerEvent('btnClick');
    }
  }
});
