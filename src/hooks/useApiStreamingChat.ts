import { useState, useCallback, useRef } from 'react'
import type { Message, MessageType, MessageStatus, ToolCallDetails } from '../types/chat'

/**
 * API流式聊天Hook配置
 */
export interface UseApiStreamingChatOptions {
  /** API基础URL */
  baseUrl?: string
  /** 默认session ID */
  defaultSessionId?: string
  /** 是否自动生成消息ID */
  autoGenerateId?: boolean
  /** 连接超时时间（毫秒） */
  connectionTimeout?: number
  /** 代理类型 */
  agentType?: string
}

/**
 * API流式聊天Hook返回值
 */
export interface UseApiStreamingChatReturn {
  /** 消息列表 */
  messages: Message[]
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否连接中 */
  isConnecting: boolean
  /** 连接错误 */
  connectionError: string | null
  /** 发送消息 */
  sendMessage: (content: string, type?: MessageType) => Promise<void>
  /** 停止当前流 */
  stopStreaming: () => void
  /** 清空聊天 */
  clearChat: () => void
  /** 重试最后一条消息 */
  retryLastMessage: () => Promise<void>
  /** 当前会话ID */
  sessionId: string
}

/**
 * 流式事件类型
 */
interface StreamEvent {
  type: 'tool_call_start' | 'tool_call_end' | 'text_chunk' | 'message_complete' | 'session_end' | 'error'
  data: Record<string, unknown>
}

/**
 * API流式聊天Hook
 * 真实调用后端的流式接口进行对话
 */
export const useApiStreamingChat = ({
  baseUrl = 'http://localhost:8000',
  defaultSessionId,
  autoGenerateId = true,
  agentType = 'deepresearch'
}: UseApiStreamingChatOptions = {}): UseApiStreamingChatReturn => {

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  /**
   * 生成唯一ID
   */
  const generateId = useCallback(() => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }, [])

  /**
   * 生成会话ID
   */
  const generateSessionId = useCallback(() => {
    return 'session_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
  }, [])

  // 当前会话ID
  const [sessionId, setSessionId] = useState<string>(() => defaultSessionId || generateSessionId())

  // EventSource连接引用
  const eventSourceRef = useRef<EventSource | null>(null)
  // ReadableStream reader引用（用于手动取消流）
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  // 当前流式消息引用 - 支持多个并发流式消息
  const currentStreamingMessagesRef = useRef<Set<string>>(new Set())
  // 最后一条用户消息（用于重试）
  const lastUserMessageRef = useRef<string>('')
  // 停止标志引用
  const isStoppedRef = useRef(false)

  /**
   * 停止当前EventSource连接
   */
  const stopStreaming = useCallback(() => {
    // 设置停止标志
    isStoppedRef.current = true
    
    // 关闭EventSource连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    // 取消ReadableStream读取
    if (readerRef.current) {
      readerRef.current.cancel('User stopped the stream')
      readerRef.current = null
    }
    
    // 更新正在运行的工具调用状态为 'stop'
    setMessages(prev => 
      prev.map(msg => {
        if (msg.type === 'tool_call' && msg.content.tool_call?.status === 'running') {
          return {
            ...msg,
            content: {
              tool_call: {
                ...msg.content.tool_call,
                status: 'stop' as const,
                error: '用户停止了操作',
                endTime: new Date()
              }
            }
          }
        }
        return msg
      })
    )
    
    // 如果有正在流式传输的消息，标记为完成
    const streamingMessages = currentStreamingMessagesRef.current
    if (streamingMessages.size > 0) {
      setMessages(prev => 
        prev.map(msg => 
          streamingMessages.has(msg.id)
            ? { ...msg, status: 'delivered' as MessageStatus }
            : msg
        )
      )
      currentStreamingMessagesRef.current.clear()
    }
    
    setIsLoading(false)
    setIsConnecting(false)
    setConnectionError(null)
    
    console.log('停止API流式传输')
  }, [])

  /**
   * 处理工具调用开始事件
   */
  const handleToolCallStart = useCallback((eventData: Record<string, unknown>) => {
    // 检查是否已被停止
    if (isStoppedRef.current) {
      console.log('工具调用开始事件被忽略：已停止')
      return
    }
    
    const toolMessageId = generateId()
    
    // 从工具名称映射到前端的工具类型
    const getToolType = (toolName: string): ToolCallDetails['type'] => {
      switch (toolName) {
        case 'web_search': return 'web_search'
        case 'web_content': return 'web_content' 
        case 'research_planner': return 'analysis'
        case 'llm_analysis': return 'analysis'
        default: return 'other'
      }
    }

    const toolMessage: Message = {
      id: toolMessageId,
      sender: 'assistant',
      type: 'tool_call',
      content: {
        tool_call: {
          id: (eventData.toolId as string) || generateId(),
          name: (eventData.toolName as string) || 'unknown',
          type: getToolType((eventData.toolName as string) || ''),
          status: 'running',
          description: eventData.message as string,
          startTime: new Date()
        }
      },
      timestamp: new Date(),
      status: 'delivered'
    }
    
    setMessages(prev => [...prev, toolMessage])
  }, [generateId])

  /**
   * 处理工具调用结束事件
   */
  const handleToolCallEnd = useCallback((eventData: Record<string, unknown>) => {
    // 检查是否已被停止
    if (isStoppedRef.current) {
      console.log('工具调用结束事件被忽略：已停止')
      return
    }
    
    setMessages(prev => 
      prev.map(msg => {
        if (msg.type === 'tool_call' && msg.content.tool_call?.id === eventData.toolId) {
          return {
            ...msg,
            content: {
              tool_call: {
                ...msg.content.tool_call!,
                status: eventData.status === 'success' ? 'success' : 'error',
                result: eventData.result as string,
                error: eventData.status === 'error' ? (eventData.result as string) : undefined,
                endTime: new Date(),
                duration: msg.content.tool_call!.startTime 
                  ? Date.now() - msg.content.tool_call!.startTime.getTime()
                  : undefined,
                metadata: eventData.metadata as Record<string, unknown>
              }
            }
          }
        }
        return msg
      })
    )
  }, [])

  /**
   * 处理文本块事件（流式文本）
   */
  const handleTextChunk = useCallback((eventData: Record<string, unknown>) => {
    // 检查是否已被停止
    if (isStoppedRef.current) {
      console.log('文本块事件被忽略：已停止')
      return
    }
    
    const messageId = eventData.messageId as string
    const content = eventData.content as string
    
    // 检查是否是新的流式消息
    if (!currentStreamingMessagesRef.current.has(messageId)) {
      // 添加到流式消息集合
      currentStreamingMessagesRef.current.add(messageId)
      
      const textMessage: Message = {
        id: messageId,
        sender: 'assistant',
        type: 'text',
        content: { text: content },
        timestamp: new Date(),
        status: 'pending'
      }
      
      setMessages(prev => [...prev, textMessage])
    } else {
      // 更新现有流式消息
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId
            ? { 
                ...msg, 
                content: { text: (msg.content.text || '') + content }
              }
            : msg
        )
      )
    }
  }, [])

  /**
   * 处理消息完成事件
   */
  const handleMessageComplete = useCallback((eventData: Record<string, unknown>) => {
    // 检查是否已被停止
    if (isStoppedRef.current) {
      console.log('消息完成事件被忽略：已停止')
      return
    }
    
    const messageId = eventData.messageId as string
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId
          ? { 
              ...msg, 
              content: { text: eventData.content as string },
              status: 'delivered' as MessageStatus
            }
          : msg
      )
    )
    
    // 从流式消息集合中移除完成的消息
    currentStreamingMessagesRef.current.delete(messageId)
    
    // 如果所有流式消息都完成了，结束加载状态
    if (currentStreamingMessagesRef.current.size === 0) {
      setIsLoading(false)
    }
  }, [])

  /**
   * 处理错误事件
   */
  const handleError = useCallback((eventData: Record<string, unknown>) => {
    console.error('Stream error:', eventData)
    setConnectionError((eventData.message as string) || '连接出现错误')
    setIsLoading(false)
    setIsConnecting(false)
    
    // 如果有正在进行的流式消息，标记为失败
    const streamingMessages = currentStreamingMessagesRef.current
    if (streamingMessages.size > 0) {
      setMessages(prev => 
        prev.map(msg => 
          streamingMessages.has(msg.id)
            ? { ...msg, status: 'failed' as MessageStatus }
            : msg
        )
      )
      currentStreamingMessagesRef.current.clear()
    }
  }, [])

  /**
   * 建立EventSource连接并处理流式响应
   */
  const startEventStream = useCallback(async (message: string) => {
    try {
      // 重置停止标志
      isStoppedRef.current = false
      setIsConnecting(true)
      setConnectionError(null)
      
      // 准备请求数据
      const requestData = {
        message,
        sessionId,
        agentType: agentType
      }

      // 发送POST请求启动流式响应
      const response = await fetch(`${baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      setIsConnecting(false)
      setIsLoading(true)

      // 使用ReadableStream处理流式响应
      const reader = response.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()

      try {
        while (true) {
          // 检查是否已被停止
          if (isStoppedRef.current) {
            console.log('检测到停止信号，中断流式读取')
            break
          }
          
          const { done, value } = await reader.read()
          
          if (done) {
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              
              if (data === '[DONE]') {
                setIsLoading(false)
                currentStreamingMessagesRef.current.clear()
                return
              }

              try {
                const event: StreamEvent = JSON.parse(data)
                
                switch (event.type) {
                  case 'tool_call_start':
                    handleToolCallStart(event.data)
                    break
                  case 'tool_call_end':
                    handleToolCallEnd(event.data)
                    break
                  case 'text_chunk':
                    handleTextChunk(event.data)
                    break
                  case 'message_complete':
                    handleMessageComplete(event.data)
                    break
                  case 'session_end':
                    // 会话结束，强制设置加载状态为false
                    setIsLoading(false)
                    currentStreamingMessagesRef.current.clear()
                    console.log('Session ended:', event.data)
                    return
                  case 'error':
                    handleError(event.data)
                    return
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', data, parseError)
              }
            }
          }
        }
      } catch (streamError) {
        console.error('Stream reading error:', streamError)
        throw streamError
      } finally {
        reader.releaseLock()
        readerRef.current = null
      }

    } catch (error) {
      console.error('EventSource connection error:', error)
      setConnectionError(error instanceof Error ? error.message : '连接失败')
      setIsLoading(false)
      setIsConnecting(false)
    }
  }, [
    baseUrl, 
    sessionId, 
    agentType,
    handleToolCallStart,
    handleToolCallEnd, 
    handleTextChunk,
    handleMessageComplete,
    handleError
  ])

  /**
   * 发送消息
   */
  const sendMessage = useCallback(async (content: string, type: MessageType = 'text') => {
    if (!content.trim() || isLoading) return

    // 记录用户消息用于重试
    lastUserMessageRef.current = content

    // 创建用户消息
    const userMessage: Message = {
      id: autoGenerateId ? generateId() : Date.now().toString(),
      sender: 'user',
      type,
      content: { text: content },
      timestamp: new Date(),
      status: 'sent'
    }

    setMessages(prev => [...prev, userMessage])
    
    // 开始流式响应
    await startEventStream(content)
  }, [isLoading, autoGenerateId, generateId, startEventStream])

  /**
   * 清空聊天
   */
  const clearChat = useCallback(() => {
    stopStreaming()
    setMessages([])
    setSessionId(generateSessionId())
    setConnectionError(null)
    // 重置停止标志
    isStoppedRef.current = false
  }, [stopStreaming, generateSessionId])

  /**
   * 重试最后一条消息
   */
  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current) return
    
    stopStreaming()
    setConnectionError(null)
    // 重置停止标志
    isStoppedRef.current = false
    
    // 重新发送最后一条用户消息
    await startEventStream(lastUserMessageRef.current)
  }, [stopStreaming, startEventStream])

  return {
    messages,
    isLoading,
    isConnecting,
    connectionError,
    sendMessage,
    stopStreaming,
    clearChat,
    retryLastMessage,
    sessionId
  }
}

export default useApiStreamingChat