// 云函数入口文件
const cloud = require('wx-server-sdk')
const fetch = require('node-fetch')

// 初始化 cloud
cloud.init({
  env: 'cloud1-5gcmcrpr162d6ee6'
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log('获取每日运势开始')
    
    // 调用腾讯混元大模型
    // 注意：这里需要根据实际情况填写API密钥和相关配置
    const apiKey = 'YOUR_TENCENT_CLOUD_API_KEY' // 替换为您的腾讯云API密钥
    const model = 'hunyuan-exp'
    const prompt = "你是一个治愈系的时光解读者。请生成一句简短的、温暖的、富有哲理的'今日流年运势'，包含：今日关键词（如：'微光'）、幸运色（如：'晨雾蓝'）和一句治愈短句（30字以内）。语气要温柔、文艺。"
    
    // 构建API请求
    const requestData = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    }
    
    // 发送请求到混元大模型API
    // 注意：这里的API地址需要根据实际情况调整
    const response = await fetch('https://api.tencentcloud.com/asr/v1/Invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData)
    })
    
    const result = await response.json()
    console.log('模型返回结果:', result)
    
    // 解析模型返回的结果
    // 注意：这里需要根据实际的API返回格式进行调整
    let fortuneData
    if (result && result.choices && result.choices.length > 0) {
      const content = result.choices[0].message.content
      console.log('模型生成内容:', content)
      
      // 提取关键词、颜色和消息
      // 这里使用简单的解析逻辑，实际项目中可能需要更复杂的处理
      fortuneData = parseFortuneContent(content)
    } else {
      // 如果API调用失败，使用默认数据
      console.log('API调用失败，使用默认数据')
      fortuneData = getDefaultFortune()
    }
    
    console.log('获取每日运势成功:', fortuneData)
    
    // 返回格式
    return {
      keyword: fortuneData.keyword,
      color: fortuneData.color,
      message: fortuneData.message,
      success: true
    }
  } catch (error) {
    console.error('获取每日运势失败:', error)
    
    // 错误时返回默认数据
    const defaultFortune = getDefaultFortune()
    return {
      keyword: defaultFortune.keyword,
      color: defaultFortune.color,
      message: defaultFortune.message,
      success: true,
      error: error.message
    }
  }
}

// 解析模型返回的内容
function parseFortuneContent(content) {
  // 这里实现解析逻辑，根据实际的模型输出格式进行调整
  // 示例：假设模型返回 "关键词：微光，幸运色：晨雾蓝，治愈短句：今日的微光，是明天的太阳。"
  
  let keyword = '微光'
  let color = '晨雾蓝'
  let message = '今日的微光，是明天的太阳。慢慢来，时间会给你答案。'
  
  // 简单的解析逻辑
  if (content.includes('关键词')) {
    const keywordMatch = content.match(/关键词[：:]([^，,]+)/)
    if (keywordMatch && keywordMatch[1]) {
      keyword = keywordMatch[1].trim()
    }
  }
  
  if (content.includes('幸运色')) {
    const colorMatch = content.match(/幸运色[：:]([^，,]+)/)
    if (colorMatch && colorMatch[1]) {
      color = colorMatch[1].trim()
    }
  }
  
  if (content.includes('治愈短句')) {
    const messageMatch = content.match(/治愈短句[：:](.+)/)
    if (messageMatch && messageMatch[1]) {
      message = messageMatch[1].trim()
    }
  }
  
  return {
    keyword,
    color,
    message
  }
}

// 获取默认运势数据
function getDefaultFortune() {
  const dailyFortunes = [
    {
      keyword: '微光',
      color: '晨雾蓝',
      message: '今日的微光，是明天的太阳。慢慢来，时间会给你答案。'
    },
    {
      keyword: '宁静',
      color: '奶白色',
      message: '在宁静中找到力量，每一刻都是新的开始。'
    },
    {
      keyword: '温暖',
      color: '浅橘色',
      message: '温暖的相遇，是生活最好的礼物。'
    },
    {
      keyword: '希望',
      color: '薄荷绿',
      message: '带着希望前行，每一步都值得珍惜。'
    },
    {
      keyword: '从容',
      color: '淡紫色',
      message: '从容面对生活，美好会不期而遇。'
    }
  ]
  
  const randomIndex = Math.floor(Math.random() * dailyFortunes.length)
  return dailyFortunes[randomIndex]
}
