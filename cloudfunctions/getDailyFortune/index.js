// 云函数入口文件
const cloud = require('wx-server-sdk')
const https = require('https')
const http = require('http')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log('获取每日运势开始')
    
    // 从环境变量获取API密钥
    const apiKey = process.env.HUNYUAN_API_KEY
    
    // 如果没有配置API密钥，直接返回默认数据
    if (!apiKey) {
      console.log('未配置HUNYUAN_API_KEY环境变量，使用默认数据')
      const defaultFortune = getDefaultFortune()
      return {
        keyword: defaultFortune.keyword,
        color: defaultFortune.color,
        message: defaultFortune.message,
        success: true
      }
    }
    
    // 尝试调用API，设置超时
    const result = await callHunyuanAPI(apiKey)
    
    console.log('获取每日运势成功:', result)
    return {
      keyword: result.keyword,
      color: result.color,
      message: result.message,
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

// 调用混元API
function callHunyuanAPI(apiKey) {
  return new Promise((resolve, reject) => {
    const model = 'hunyuan-turbos-latest'
    const currentDate = new Date().toISOString().split('T')[0]
    const prompt = `你是一个温暖治愈的时光解读者，根据今天的日期${currentDate}，为用户生成一个独特的每日运势。

请生成：
1. 今日关键词：一个2-3字的充满诗意或禅意的词，如"微风"、"晨露"、"星辰"、"温暖"、"宁静"等，每次都要随机选择，不要重复
2. 幸运色：一种温柔治愈的颜色，从以下颜色中选择：晨雾蓝、奶白色、浅橘色、薄荷绿、淡紫色、暖黄色、樱花粉、天空蓝、橄榄绿、香槟色，每次随机选择
3. 治愈短句：一句20-35字的温暖治愈短句，富有哲理，温柔文艺，给用户力量和安慰

要求：
- 每次生成都要有创意，不要重复相同的词、句
- 语气温柔文艺，给人温暖治愈的感觉
- 以纯JSON格式返回，格式为：{"keyword":"关键词","color":"幸运色","message":"治愈短句"}
- 不要添加任何其他文字或说明，只返回JSON`
    
    const requestData = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    }
    
    const url = new URL('https://api.hunyuan.cloud.tencent.com/v1/chat/completions')
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(JSON.stringify(requestData))
      },
      timeout: 15000
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          console.log('模型返回结果:', response)
          
          // 解析模型返回的结果
          let fortuneData
          if (response && response.choices && response.choices.length > 0) {
            const content = response.choices[0].message.content
            console.log('模型生成内容:', content)

            // 尝试解析JSON格式的结果
            try {
              fortuneData = JSON.parse(content)
            } catch (e) {
              // 如果JSON解析失败，使用正则表达式解析
              fortuneData = parseFortuneContent(content)
            }
          } else {
            // 如果API调用失败，使用默认数据
            console.log('API调用失败，使用默认数据')
            fortuneData = getDefaultFortune()
          }
          
          resolve(fortuneData)
        } catch (e) {
          console.error('解析响应失败:', e)
          resolve(getDefaultFortune())
        }
      })
    })
    
    req.on('error', (error) => {
      console.error('API请求错误:', error.message)
      resolve(getDefaultFortune())
    })
    
    req.on('timeout', () => {
      console.error('API请求超时')
      req.destroy()
      resolve(getDefaultFortune())
    })
    
    req.write(JSON.stringify(requestData))
    req.end()
  })
}

// 解析模型返回的内容（兼容非JSON格式）
function parseFortuneContent(content) {
  let keyword = '微光'
  let color = '晨雾蓝'
  let message = '今日的微光，是明天的太阳。慢慢来，时间会给你答案。'
  
  // 简单的解析逻辑
  if (content.includes('关键词')) {
    const keywordMatch = content.match(/关键词[：:：]([^，,]+)/)
    if (keywordMatch && keywordMatch[1]) {
      keyword = keywordMatch[1].trim()
    }
  }
  
  if (content.includes('幸运色')) {
    const colorMatch = content.match(/幸运色[：:：]([^，,]+)/)
    if (colorMatch && colorMatch[1]) {
      color = colorMatch[1].trim()
    }
  }
  
  if (content.includes('治愈短句')) {
    const messageMatch = content.match(/治愈短句[：:：](.+)/)
    if (messageMatch && messageMatch[1]) {
      message = messageMatch[1].trim()
    }
  }
  
  // 如果中文冒号匹配失败，尝试英文冒号
  if (keyword === '微光' && content.includes('keyword')) {
    const keywordMatch = content.match(/keyword[：:：](["']?)([^"'}]+)\1/)
    if (keywordMatch && keywordMatch[2]) {
      keyword = keywordMatch[2].trim()
    }
  }
  
  if (color === '晨雾蓝' && content.includes('color')) {
    const colorMatch = content.match(/color[：:：](["']?)([^"'}]+)\1/)
    if (colorMatch && colorMatch[2]) {
      color = colorMatch[2].trim()
    }
  }
  
  if (message.includes('微光') && content.includes('message')) {
    const messageMatch = content.match(/message[：:：](["']?)([^"'}]+)\1/)
    if (messageMatch && messageMatch[2]) {
      message = messageMatch[2].trim()
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
