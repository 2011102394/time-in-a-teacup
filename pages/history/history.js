// pages/history/history.js
Page({
  data: {
    historyList: []
  },

  /**
   * 页面加载
   */
  onLoad() {
    console.log('History page loaded')
    this.loadHistory()
  },

  /**
   * 加载历史记录
   */
  loadHistory() {
    const db = wx.cloud.database()

    db.collection('history')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get({
        success: (res) => {
          console.log('历史记录加载成功:', res.data.length)
          this.setData({
            historyList: res.data
          })
        },
        fail: (err) => {
          console.error('历史记录加载失败:', err)
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
  },

  /**
   * 点击历史记录项
   */
  onHistoryItem(e) {
    const item = e.currentTarget.dataset.item
    console.log('点击历史记录:', item)

    // 可以在这里实现查看详情功能
    wx.showToast({
      title: '查看详情',
      icon: 'none',
      duration: 1500
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadHistory()
    wx.stopPullDownRefresh()
  }
})
