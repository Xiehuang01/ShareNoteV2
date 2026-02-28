// AI 辅助写作 API
const SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1'

/**
 * 调用硅基流动 AI API
 * @param {string} apiKey - API Key
 * @param {string} model - 模型名称
 * @param {string} prompt - 提示词
 * @param {string} selectedText - 选中的文本（可选）
 * @returns {Promise<string>} - AI 生成的内容
 */
export const callAI = async (apiKey, model, prompt, selectedText = '') => {
  try {
    const messages = []
    
    if (selectedText) {
      // 如果有选中文本，让 AI 基于选中内容进行修改
      messages.push({
        role: 'system',
        content: '你是一个专业的 Markdown 写作助手，擅长润色和改进文本内容。请保持 Markdown 格式。'
      })
      messages.push({
        role: 'user',
        content: `请根据以下要求修改这段内容：\n\n要求：${prompt}\n\n原文：\n${selectedText}`
      })
    } else {
      // 如果没有选中文本，直接生成新内容
      messages.push({
        role: 'system',
        content: '你是一个专业的 Markdown 写作助手，擅长生成结构清晰、内容丰富的 Markdown 文档。'
      })
      messages.push({
        role: 'user',
        content: prompt
      })
    }

    const response = await fetch(`${SILICONFLOW_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: false,
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      let errorMessage = 'AI 调用失败'
      try {
        const error = await response.json()
        errorMessage = error.error?.message || error.message || errorMessage
      } catch (e) {
        // 无法解析错误信息
      }
      
      // 根据状态码提供更友好的错误提示
      if (response.status === 401) {
        errorMessage = 'API Key 无效或已过期，请检查配置'
      } else if (response.status === 429) {
        errorMessage = 'API 调用次数超限，请稍后再试'
      } else if (response.status === 500) {
        errorMessage = 'AI 服务暂时不可用，请稍后再试'
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('AI 调用错误:', error)
    throw error
  }
}

/**
 * 流式调用 AI API（用于实时显示）
 * @param {string} apiKey - API Key
 * @param {string} model - 模型名称
 * @param {string} prompt - 提示词
 * @param {string} selectedText - 选中的文本（可选）
 * @param {Function} onChunk - 接收到数据块时的回调
 * @returns {Promise<void>}
 */
export const callAIStream = async (apiKey, model, prompt, selectedText = '', onChunk) => {
  try {
    console.log('=== AI 调用信息 ===')
    console.log('API Key (前10位):', apiKey?.substring(0, 10) + '...')
    console.log('模型:', model)
    console.log('提示词:', prompt)
    console.log('==================')
    
    const messages = []
    
    if (selectedText) {
      messages.push({
        role: 'system',
        content: '你是一个专业的 Markdown 写作助手，擅长润色和改进文本内容。请保持 Markdown 格式。'
      })
      messages.push({
        role: 'user',
        content: `请根据以下要求修改这段内容：\n\n要求：${prompt}\n\n原文：\n${selectedText}`
      })
    } else {
      messages.push({
        role: 'system',
        content: '你是一个专业的 Markdown 写作助手，擅长生成结构清晰、内容丰富的 Markdown 文档。'
      })
      messages.push({
        role: 'user',
        content: prompt
      })
    }

    const response = await fetch(`${SILICONFLOW_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      let errorMessage = 'AI 调用失败'
      try {
        const error = await response.json()
        errorMessage = error.error?.message || error.message || errorMessage
      } catch (e) {
        // 无法解析错误信息
      }
      
      // 根据状态码提供更友好的错误提示
      if (response.status === 401) {
        errorMessage = 'API Key 无效或已过期，请检查配置'
      } else if (response.status === 429) {
        errorMessage = 'API 调用次数超限，请稍后再试'
      } else if (response.status === 500) {
        errorMessage = 'AI 服务暂时不可用，请稍后再试'
      }
      
      throw new Error(errorMessage)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const json = JSON.parse(data)
            const content = json.choices[0]?.delta?.content
            if (content) {
              onChunk(content)
            }
          } catch (e) {
            console.error('解析 JSON 失败:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('AI 流式调用错误:', error)
    throw error
  }
}

