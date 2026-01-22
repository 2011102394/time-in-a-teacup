// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    // 注意：小程序端不支持 cloud.DYNAMIC_CURRENT_ENV
    // 环境ID由开发者工具或真机调试时自动识别
    wx.cloud.init({
      traceUser: true
    })

    console.log('Time in a Teacup Mini Program launched')
  },
  globalData: {
    userInfo: null
  }
})