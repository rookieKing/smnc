
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database/init.html
// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/database/Database.html
const db = cloud.database();

const api = {
  async wxcode(event, context) {
    const {
      phonenumber,
      sex,
      name,
      text,
    } = event.data;
    const time = Date.now();
    // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/database/collection/Collection.add.html
    const { _id } =  await db.collection('wxcode').add({
      data: {
        OPENID,
        UNIONID,
        phonenumber,
        sex,
        name,
        text,
        time,
        state: '',
        scan: [],
      },
    });
    // 小程序二维码
    // https://developers.weixin.qq.com/minigame/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html#method-cloud
    const { buffer } = await cloud.openapi.wxacode.getUnlimited({
      scene: _id,
      page: 'pages/scanCode/index',
      checkPath: false,
      envVersion: 'release',
    });
    // 由于 wxml-to-canvas 组件不支持 base64 图片，这里将图片存储并生成 url
    // 文件存储
    // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/storage/uploadFile/server.uploadFile.html
    // 云文件转 url 链接
    // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/storage/Cloud.getTempFileURL.html
    const { fileID } = await cloud.uploadFile({
      cloudPath: _id,
      fileContent: buffer,
    });
    const { fileList } = await cloud.getTempFileURL({
      fileList: [fileID],
    });
    return { src: fileList[0].tempFileURL };
  },
  async get(event, context) {
    const _ = db.command;
    const {
      id,
    } = event.data;
    const {
      phonenumber,
      state,
    } = (await db.collection('wxcode').doc(id).get()).data;
    const time = Date.now();
    await db.collection('wxcode').doc(id).update({
      data: {
        scan: _.push({
          OPENID,
          UNIONID,
          time,
          state,
        }),
      },
    });
    return phonenumber;
  },
}

var OPENID, UNIONID;

// 云函数入口函数
exports.main = async (event, context) => {
  // https://developers.weixin.qq.com/minigame/dev/wxcloud/reference-sdk-api/utils/Cloud.getWXContext.html
  const wxContext = cloud.getWXContext();
  OPENID = wxContext.OPENID;
  UNIONID = wxContext.UNIONID;
  const exec = api[event.type];
  if (exec)
    return await exec.call(cloud.getWXContext(), event, context);
};
