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
        colorName: defaultFortune.colorName,
        colorCode: defaultFortune.colorCode,
        message: defaultFortune.message,
        success: true
      }
    }
    
    // 尝试调用API，设置超时
    const result = await callHunyuanAPI(apiKey)
    
    console.log('获取每日运势成功:', result)
    return {
      keyword: result.keyword,
      colorName: result.colorName,
      colorCode: result.colorCode,
      message: result.message,
      success: true
    }
  } catch (error) {
    console.error('获取每日运势失败:', error)
    
    // 错误时返回默认数据
    const defaultFortune = getDefaultFortune()
    return {
      keyword: defaultFortune.keyword,
      colorName: defaultFortune.colorName,
      colorCode: defaultFortune.colorCode,
      message: defaultFortune.message,
      success: true,
      error: error.message
    }
  }
}

// 调用混元API
function callHunyuanAPI(apiKey) {
  return new Promise((resolve, reject) => {
    const model = 'hunyuan-2.0-instruct-20251111'
    const currentDate = new Date().toISOString().split('T')[0]
    const prompt = `根据日期${currentDate}，生成今日运势。要求：

1. keyword: 2-3字的关键词，富有诗意和禅意
2. colorName: 颜色的中文名称，优雅诗意
3. colorCode: 十六进制颜色代码，格式#XXXXXX
4. message: 20-35字的治愈短句

重要：每次生成的内容必须独特，避免重复。返回纯JSON格式：
{"keyword":"...","colorName":"...","colorCode":"#......","message":"..."}`
    
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
  let colorName = '晨雾蓝'
  let colorCode = '#B8C6D9'
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
      colorName = colorMatch[1].trim()
    }
  }

  // 尝试匹配十六进制颜色代码
  const hexColorMatch = content.match(/#[0-9A-Fa-f]{6}/)
  if (hexColorMatch) {
    colorCode = hexColorMatch[0]
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

  if (colorName === '晨雾蓝' && content.includes('colorName')) {
    const colorMatch = content.match(/colorName[：:：](["']?)([^"'}]+)\1/)
    if (colorMatch && colorMatch[2]) {
      colorName = colorMatch[2].trim()
    }
  }

  if (colorCode === '#B8C6D9' && content.includes('colorCode')) {
    const colorCodeMatch = content.match(/colorCode[：:：](["']?)([^"'}]+)\1/)
    if (colorCodeMatch && colorCodeMatch[2]) {
      colorCode = colorCodeMatch[2].trim()
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
    colorName,
    colorCode,
    message
  }
}

// 获取默认运势数据
function getDefaultFortune() {
  const dailyFortunes = [
    {
      keyword: '微光',
      colorName: '晨雾蓝',
      colorCode: '#B8C6D9',
      message: '今日的微光，是明天的太阳。慢慢来，时间会给你答案。'
    },
    {
      keyword: '宁静',
      colorName: '奶白色',
      colorCode: '#F5F0E8',
      message: '在宁静中找到力量，每一刻都是新的开始。'
    },
    {
      keyword: '温暖',
      colorName: '浅橘色',
      colorCode: '#FFE4B5',
      message: '温暖的相遇，是生活最好的礼物。'
    },
    {
      keyword: '希望',
      colorName: '薄荷绿',
      colorCode: '#98FB98',
      message: '带着希望前行，每一步都值得珍惜。'
    },
    {
      keyword: '从容',
      colorName: '淡紫色',
      colorCode: '#D8BFD8',
      message: '从容面对生活，美好会不期而遇。'
    }
  ]

  const randomIndex = Math.floor(Math.random() * dailyFortunes.length)
  return dailyFortunes[randomIndex]
}
