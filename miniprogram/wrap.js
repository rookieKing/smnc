
const call = function (type, data) {
  return wx.cloud.callFunction({
    name: 'quickstartFunctions',
    config: {
      env: 'free-6gixn2qc479bdf6c',
    },
    data: {
      data,
      type,
    },
  }).then(({ result }) => result);
};

module.exports = function wrap(options = {}) {
  var {
    onLoad,
  } = options;
  if (!onLoad) {
    onLoad = function () { };
  }
  const preOnLoad = function () { };
  // hack onLoad
  options.onLoad = function (...args) {
    const app = getApp();
    this.app = app;
    this.call = call;
    preOnLoad.apply(this, args);
    onLoad.apply(this, args);
  };
  return options;
};
