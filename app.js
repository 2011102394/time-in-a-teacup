// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: cloud.DYNAMIC_CURRENT_ENV,
      traceUser: true
    })

    console.log('Time in a Teacup Mini Program launched')
  },
  globalData: {
    userInfo: null
  }
})