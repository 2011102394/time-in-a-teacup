// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: 'cloud1-0gq43i7f8a4c9b4f', // 请根据实际云开发环境ID修改
      traceUser: true
    })
    
    console.log('Time in a Teacup Mini Program launched')
  },
  globalData: {
    userInfo: null
  }
})