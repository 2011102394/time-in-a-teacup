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

    // 获取用户信息
    this.getUserInfo()
  },

  /**
   * 获取用户openId和基本信息
   */
  getUserInfo() {
    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: {},
      success: (res) => {
        console.log('获取用户信息成功:', res.result)
        this.globalData.userInfo = res.result
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
      }
    })
  },

  globalData: {
    userInfo: null
  }
})