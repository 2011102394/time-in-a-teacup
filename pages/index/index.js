// index.js
Page({
  data: {
    // 页面数据
    isLoading: false,
    fortuneData: null,
    todayDate: ''
  },
  onLoad() {
    // 页面加载时执行
    console.log('Home page loaded')
    this.setTodayDate()
  },
  
  // 设置当前日期
  setTodayDate() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekDay = weekDays[today.getDay()]
    this.setData({
      todayDate: `${year}.${month}.${day} ${weekDay}`
    })
  },
  
  // 茶杯点击事件
  onGetFortune() {
    console.log('点击茶杯，获取今日日签')
    
    // 设置加载状态
    this.setData({
      isLoading: true
    })
    
    // 播放茶杯震动动画
    const teaCup = wx.createSelectorQuery().select('.tea-cup')
    teaCup.fields({
      size: true
    }, (res) => {
      // 这里可以添加更复杂的动画逻辑
      console.log('茶杯动画效果')
    }).exec()
    
    // 调用云函数获取每日运势
    wx.cloud.callFunction({
      name: 'getDailyFortune',
      data: {},
      success: (res) => {
        console.log('云函数调用成功:', res.result)

        // 保存运势数据（颜色值直接使用大模型返回的HEX代码）
        this.setData({
          fortuneData: res.result,
          isLoading: false
        })
        
        // 输出日签信息
        if (res.result.success) {
          console.log('=== 今日日签 ===')
          console.log('关键词:', res.result.keyword)
          console.log('幸运色:', res.result.colorName, res.result.colorCode)
          console.log('治愈短句:', res.result.message)
          console.log('=============')
          
          wx.showToast({
            title: '获取日签成功',
            icon: 'success',
            duration: 1500
          })
        }
      },
      fail: (err) => {
        console.error('云函数调用失败:', err)
        this.setData({
          isLoading: false
        })
        wx.showToast({
          title: '获取日签失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  
  // 重置，重新获取日签
  onReset() {
    this.setData({
      fortuneData: null
    })
  },
  
  // 分享功能
  onShareAppMessage() {
    if (this.data.fortuneData) {
      return {
        title: `今日日签：${this.data.fortuneData.keyword}`,
        path: '/pages/index/index',
        imageUrl: ''
      }
    }
    return {
      title: '浅杯流年 - 获取你的今日日签',
      path: '/pages/index/index'
    }
  }
})