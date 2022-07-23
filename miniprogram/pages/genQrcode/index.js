
const wrap = require('../../wrap.js');

Page(wrap({
  data: {
    edit: true,
    phonenumber: '',
    sex: '1',
    name: '',
    text: '',
    surname: '',
  },
  async formSubmit(e) {
    Object.assign(this.data, e.detail.value);
    wx.navigateTo({
      url: `/pages/preview/index`,
      success: ({ eventChannel }) => {
        console.log('emit')
        eventChannel.emit('data',  this.data);
      },
    });
    return;
  },
  onInput(e) {
    var phonenumber = (e.detail.value || '').trim();
    this.setData({
      phonenumber,
    });
    this.buildText();
  },
  onNameInput(e) {
    var name = (e.detail.value || '').trim();
    var compoundSurname = name.substr(0, 2);
    var singleSurname = name.substr(0, 1);
    var surnames = this.app.globalData.surnames
    this.setData({
      surname: surnames[compoundSurname]
        ? compoundSurname
        : surnames[singleSurname]
          ? singleSurname
          : ''
    });
    this.buildText();
  },
  onChange(e) {
    this.setData({
      sex: e.detail.value
    });
    this.buildText();
  },
  buildText() {
    var arr = ['扫码挪车'];
    if (this.data.phonenumber) arr.push(this.data.phonenumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3'));
    if (this.data.surname) arr.push(this.data.surname + (this.data.sex === '1' ? '先生' : '女士'));
    this.setData({
      text: arr.length === 1
        ? ''
        : arr.join('\n'),
    })
  },
  // 吐糟：个人开发者没权限
  // https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html
  getPhoneNumber(e) {
    console.log(e.detail.code);
  },
}));
