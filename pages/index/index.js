// index.js
Page({
  data: {
    isLoading: false,
    fortuneData: null,
    todayDate: ''
  },

  /**
   * 页面加载
   */
  onLoad() {
    // 页面加载时执行
    console.log('Home page loaded')
    this.setTodayDate()
  },

  /**
   * 设置当前日期
   */
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

  /**
   * 茶杯点击事件 - 获取今日运势
   */
  onGetFortune() {
    console.log('点击茶杯，获取今日日签')

    // 显示加载提示
    wx.showLoading({
      title: '正在抽取日签...',
      mask: true
    })

    // 调用云函数获取每日运势
    wx.cloud.callFunction({
      name: 'getDailyFortune',
      data: {},
      success: (res) => {
        wx.hideLoading()

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
        wx.hideLoading()
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

  /**
   * 重置 - 清空运势数据
   */
  onReset() {
    this.setData({
      fortuneData: null
    })
    wx.showToast({
      title: '已重置',
      icon: 'success',
      duration: 1000
    })
  },

  /**
   * 分享配置
   * @returns {Object} 分享配置对象
   */
  onShareAppMessage() {
    if (this.data.fortuneData) {
      return {
        title: `今日日签：${this.data.fortuneData.keyword}`,
        path: '/pages/index/index'
      }
    }
    return {
      title: '浅杯流年 - 获取你的今日日签',
      path: '/pages/index/index'
    }
  }
})