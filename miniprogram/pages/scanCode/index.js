
const wrap = require('../../wrap.js');

Page(wrap({
  data: {
    id: '',
    phoneNumber: '',
  },
  onLoad(query) {
    this.setData({
      id: query.scene
    });
  },
  async onReady() {
    const phoneNumber = await this.call('get', { id: this.data.id });
    this.setData({
      phoneNumber,
    });
  },
  async dial() {
    // https://developers.weixin.qq.com/miniprogram/dev/api/device/phone/wx.makePhoneCall.html
    var { phoneNumber } = this.data;
    await wx.makePhoneCall({
      phoneNumber,
    });
  },
  home() {
    wx.navigateTo({
      url: '/pages/index/index',
    });
  },
}));
