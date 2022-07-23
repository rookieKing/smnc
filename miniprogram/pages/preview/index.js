
const wrap = require('../../wrap.js');

const {
  windowWidth,
} = wx.getSystemInfoSync();

const sleep = fff => new Promise(rs => setTimeout(rs, fff));
var stop = false;
const widgetReady = async (widget) => {
  while (true && !stop) {
    console.log('sleep 50');
    await sleep(50);
    if (widget.ctx) return;
  }
}
Page(wrap({
  data: {
    windowWidth,
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('data', data => {
      Object.assign(this.data, data);
    });
  },
  onReady() {
    stop = false;
    const widget = this.widget = this.selectComponent('.widget');
    this.render(this.data, widget);
  },
  onHide() { stop = true; },
  onUnload() { stop = true; },
  async render(data, widget) {
    wx.showLoading({
      title: '生成中...',
    });
    try {
      const {
        phonenumber,
        sex,
        name,
        text,
      } = data;
      const { src } = await this.call('wxcode', {
        phonenumber,
        sex,
        name,
        text,
      });
      const texts = text.split('\n').map(v => `<text class="text">${v}</text>`).join('')  
      // 吐糟：组件内能不能处理一下，好歹是官方组件
      // 修正组件内 lifetimes 使用 setData 后初始化的问题：renderToCanvas: fail canvas has not been created
      await widgetReady(widget);
      // 吐糟: image 不支持 base64
      // https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/extended/component-plus/wxml-to-canvas.html
      await widget.renderToCanvas({
        wxml: `
          <view class="view">
            <image class="image" src="${src}" />
            ${texts}
          </view>`,
        style: {
          view: {
            width: windowWidth,
            height: windowWidth * 2,
            flexDirection: 'column',
            backgroundColor: '#fff',
          },
          image: {
            width: windowWidth,
            height: windowWidth,
          },
          text: {
            width: windowWidth,
            height: 45,
            fontSize: 32,
            textAlign: 'center',
            verticalAlign: 'middle',
          },
        },
      });
    } catch (e) {
      console.log(e)
      await wx.showToast({
        title: '出错啦',
        icon: 'error',
        duration: 2000,
      });
      wx.navigateBack();
    }
    wx.hideLoading();
  },
  async save() {
    // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/storage/Cloud.getTempFileURL.html
    const { tempFilePath: filePath } = await this.widget.canvasToTempFilePath();
    // 吐糟：只能先转临时文件再存相册
    // https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.saveImageToPhotosAlbum.html
    await wx.saveImageToPhotosAlbum({
      filePath,
    });
  },
}));
