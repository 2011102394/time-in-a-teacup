// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: 'cloud1-5gcmcrpr162d6ee6',
      traceUser: true
    })
    
    console.log('Time in a Teacup Mini Program launched')
  },
  globalData: {
    userInfo: null
  }
})