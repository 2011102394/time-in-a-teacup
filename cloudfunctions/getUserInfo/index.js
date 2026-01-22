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
    // 使用 getWXContext 获取用户 openid
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    if (!openid) {
      throw new Error('无法获取用户openid')
    }

    console.log('用户openid:', openid)

    // 检查用户是否已注册
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()

    console.log('---------------------')
    const isRegistered = userResult.data && userResult.data.length > 0
    console.log('用户注册状态:', isRegistered, '记录数:', userResult.data?.length || 0)

    // 如果用户不存在，创建用户记录
    if (!isRegistered) {
      console.log('新用户，创建用户记录，openid:', openid)
      try {
        const result = await db.collection('users').add({
          data: {
            _openid: openid,  // 显式设置 openid
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
        })
        console.log('用户记录创建成功，ID:', result._id)
      } catch (addError) {
        console.error('创建用户记录失败:', addError)
        // 检查是否是重复键错误（通常是由于数据库中已有 _openid 为 null 的记录）
        if (addError.errCode === -502001 || addError?.message?.includes('duplicate key')) {
          console.log('用户记录可能已存在，视为已注册')
        } else {
          throw addError
        }
      }
    }

    return {
      openid,
      isRegistered: true,
      createdAt: db.serverDate()
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
  }
}
