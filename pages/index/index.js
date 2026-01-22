// index.js
Page({
  data: {
    fortuneData: null,
    todayDate: '',
    isFavorited: false
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

        // 保存运势数据
        this.setData({
          fortuneData: res.result
        })

        // 检查是否已收藏
        this.checkFavorite(res.result)

        // 输出日签信息
        if (res.result.success) {
          console.log('=== 今日日签 ===')
          console.log('关键词:', res.result.keyword)
          console.log('幸运色:', res.result.colorName, res.result.colorCode)
          console.log('治愈短句:', res.result.message)
          console.log('=============')

          // 保存到历史记录
          this.saveToHistory(res.result)

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
   * 保存到历史记录
   * @param {Object} fortune - 运势数据
   */
  saveToHistory(fortune) {
    const db = wx.cloud.database()
    const today = new Date()
    const dateStr = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`

    db.collection('history').add({
      data: {
        keyword: fortune.keyword,
        colorName: fortune.colorName,
        colorCode: fortune.colorCode,
        message: fortune.message,
        date: dateStr,
        createdAt: db.serverDate()
      },
      success: () => {
        console.log('历史记录保存成功')
      },
      fail: (err) => {
        console.error('历史记录保存失败:', err)
      }
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
  },

  /**
   * 跳转到历史记录页
   */
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  /**
   * 跳转到收藏页
   */
  goToFavorites() {
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    })
  },

  /**
   * 检查是否已收藏
   * @param {Object} fortune - 运势数据
   */
  checkFavorite(fortune) {
    const db = wx.cloud.database()

    db.collection('favorites')
      .where({
        keyword: fortune.keyword,
        message: fortune.message
      })
      .count({
        success: (res) => {
          this.setData({
            isFavorited: res.total > 0
          })
        }
      })
  },

  /**
   * 添加收藏
   */
  onFavorite() {
    const fortune = this.data.fortuneData
    if (!fortune) return

    const db = wx.cloud.database()
    const today = new Date()
    const dateStr = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`

    db.collection('favorites').add({
      data: {
        keyword: fortune.keyword,
        colorName: fortune.colorName,
        colorCode: fortune.colorCode,
        message: fortune.message,
        date: dateStr,
        createdAt: db.serverDate()
      },
      success: () => {
        console.log('收藏成功')
        this.setData({
          isFavorited: true
        })
        wx.showToast({
          title: '已收藏',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('收藏失败:', err)
        wx.showToast({
          title: '收藏失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 取消收藏
   */
  onUnfavorite() {
    const fortune = this.data.fortuneData
    if (!fortune) return

    const db = wx.cloud.database()

    db.collection('favorites')
      .where({
        keyword: fortune.keyword,
        message: fortune.message
      })
      .get({
        success: (res) => {
          if (res.data && res.data.length > 0) {
            const id = res.data[0]._id
            db.collection('favorites').doc(id).remove({
              success: () => {
                console.log('取消收藏成功')
                this.setData({
                  isFavorited: false
                })
                wx.showToast({
                  title: '已取消收藏',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
  }
})