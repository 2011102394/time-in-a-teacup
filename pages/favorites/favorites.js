// pages/favorites/favorites.js
Page({
  data: {
    favoritesList: []
  },

  /**
   * 页面加载
   */
  onLoad() {
    console.log('Favorites page loaded')
    this.loadFavorites()
  },

  /**
   * 返回首页
   */
  goBack() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },

  /**
   * 加载收藏列表
   */
  loadFavorites() {
    const db = wx.cloud.database()

    db.collection('favorites')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get({
        success: (res) => {
          console.log('收藏列表加载成功:', res.data.length)
          this.setData({
            favoritesList: res.data
          })
        },
        fail: (err) => {
          console.error('收藏列表加载失败:', err)
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
  },

  /**
   * 取消收藏
   * @param {Object} e - 事件对象
   */
  onUnfavorite(e) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index

    wx.showModal({
      title: '确认取消',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          this.removeFavorite(id, index)
        }
      }
    })
  },

  /**
   * 移除收藏
   * @param {string} id - 收藏记录ID
   * @param {number} index - 列表索引
   */
  removeFavorite(id, index) {
    const db = wx.cloud.database()

    db.collection('favorites').doc(id).remove({
      success: () => {
        console.log('取消收藏成功')

        // 从列表中移除
        const favoritesList = this.data.favoritesList
        favoritesList.splice(index, 1)

        this.setData({
          favoritesList: favoritesList
        })

        wx.showToast({
          title: '已取消收藏',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('取消收藏失败:', err)
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadFavorites()
    wx.stopPullDownRefresh()
  }
})
