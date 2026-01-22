// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 用户信息类型
 * @typedef {Object} UserInfo
 * @property {string} openid - 用户openid
 * @property {boolean} isRegistered - 是否已注册
 */

/**
 * 云函数入口 - 获取用户信息
 * @returns {Promise<UserInfo>} 用户信息
 */
exports.main = async (event, context) => {
  try {
    // 调用云函数时，context 会自动包含 openid
    const openid = context.OPENID || context.cloudContext?.OPENID

    if (!openid) {
      throw new Error('无法获取用户openid')
    }

    console.log('用户openid:', openid)

    // 检查用户是否已注册
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()

    const isRegistered = userResult.data && userResult.data.length > 0

    // 如果用户不存在，创建用户记录
    if (!isRegistered) {
      console.log('新用户，创建用户记录')
      await db.collection('users').add({
        data: {
          _openid: openid,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    }

    return {
      openid,
      isRegistered,
      createdAt: db.serverDate()
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
  }
}
