import { useState, useCallback, useRef } from 'react'
import type { Message } from '@/types/chat'

interface UseStreamingChatOptions {
  /** 流式回复的延迟时间（毫秒） */
  streamDelay?: number
  /** 每次流式更新的字符数 */
  chunkSize?: number
}

interface UseStreamingChatReturn {
  /** 消息列表 */
  messages: Message[]
  /** 是否正在加载 */
  isLoading: boolean
  /** 发送消息 */
  sendMessage: (content: string) => void
  /** 停止流式回复 */
  stopStreaming: () => void
  /** 清空对话 */
  clearChat: () => void
  /** 删除消息 */
  deleteMessage: (messageId: string) => void
}

// 模拟AI回复的示例内容
const AI_RESPONSES = [
  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'web_search',
        message: '搜索最新的React最佳实践...'
      },
      {
        type: 'text' as const,
        content: `根据搜索结果，我为您整理了 **React 2024年最佳实践**：

## 🚀 核心开发原则

### 1. 组件设计模式
- 使用函数组件 + Hooks
- 遵循单一职责原则
- 合理拆分组件粒度`
      },
      {
        type: 'tool_call' as const,
        tool: 'code_generator',
        message: '生成示例代码...'
      },
      {
        type: 'text' as const,
        content: `## 代码示例

\`\`\`typescript
// ✅ 推荐：函数组件模式
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false))
  }, [userId])
  
  if (loading) return <div>Loading...</div>
  return <div>{user?.name}</div>
}
\`\`\`

这样的设计清晰、易维护！`
      }
    ]
  },

  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'project_analyzer',
        message: '分析项目结构...'
      },
      {
        type: 'text' as const,
        content: `# 项目分析结果 📊

我发现了一些可以优化的地方：

## 架构建议
- 组件目录结构需要优化
- 状态管理可以更加清晰`
      },
      {
        type: 'tool_call' as const,
        tool: 'performance_checker',
        message: '检查性能指标...'
      },
      {
        type: 'text' as const,
        content: `## 性能优化建议

### 1. 组件优化
- ✅ 使用 \`React.memo\` 减少重渲染
- ✅ 合理使用 \`useMemo\` 和 \`useCallback\`
- ✅ 实现虚拟滚动优化长列表

### 2. 打包优化
- 代码分割和懒加载
- 压缩静态资源
- 使用 CDN 加速

这些改进可以显著提升用户体验！`
      }
    ]
  },

  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'api_designer',
        message: '设计API接口...'
      },
      {
        type: 'text' as const,
        content: `# API设计方案 🔧

基于您的需求，我设计了以下API结构：

## RESTful 接口设计
\`\`\`
GET    /api/users           # 获取用户列表
POST   /api/users           # 创建用户
GET    /api/users/:id       # 获取用户详情
PUT    /api/users/:id       # 更新用户
DELETE /api/users/:id       # 删除用户
\`\`\``
      },
      {
        type: 'tool_call' as const,
        tool: 'database_optimizer',
        message: '优化数据库查询...'
      },
      {
        type: 'text' as const,
        content: `## 数据库优化

### 索引策略
\`\`\`sql
-- 用户表索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_created_at ON users(created_at);
CREATE INDEX idx_user_status ON users(status);
\`\`\`

### 查询优化
- 使用预编译语句防止SQL注入
- 合理使用连接查询
- 实现查询缓存机制

这样可以大幅提升数据库性能！`
      }
    ]
  },

  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'ui_designer',
        message: '设计用户界面布局...'
      },
      {
        type: 'text' as const,
        content: `# UI设计方案 🎨

我为您设计了现代化的用户界面：

## 设计原则
- 简洁明了的布局
- 一致的视觉风格
- 良好的用户体验`
      },
      {
        type: 'tool_call' as const,
        tool: 'component_generator',
        message: '生成组件代码...'
      },
      {
        type: 'text' as const,
        content: `## 组件实现

### 1. 卡片组件
\`\`\`typescript
interface CardProps {
  title: string
  content: string
  actions?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ title, content, actions }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{content}</p>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
\`\`\`

### 2. 按钮组件
\`\`\`typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({ 
  variant, 
  size, 
  children, 
  onClick 
}) => {
  const baseClasses = 'rounded font-medium transition-colors'
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  }
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]}\`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
\`\`\`

### 3. 布局系统
\`\`\`typescript
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">应用标题</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
\`\`\`

这些组件提供了完整的UI基础，可以快速构建现代化应用！ ✨`
      }
    ]
  }
]

export const useStreamingChat = (options: UseStreamingChatOptions = {}): UseStreamingChatReturn => {
  const { streamDelay = 10, chunkSize = 50 } = options
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentStreamRef = useRef<{
    messageId: string
    fullContent: string
    currentIndex: number
  } | null>(null)

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  const stopStreaming = useCallback(() => {
    if (streamingTimeoutRef.current) {
      clearTimeout(streamingTimeoutRef.current)
      streamingTimeoutRef.current = null
    }
    
    if (currentStreamRef.current) {
      // 完成当前流式消息
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentStreamRef.current?.messageId
            ? { ...msg, content: { text: currentStreamRef.current.fullContent }, status: 'delivered' as const }
            : msg
        )
      )
      currentStreamRef.current = null
    }
    
    setIsLoading(false)
  }, [])

  const streamContent = useCallback(() => {
    if (!currentStreamRef.current) return
    
    const { messageId, fullContent, currentIndex } = currentStreamRef.current
    
    if (currentIndex >= fullContent.length) {
      // 流式回复完成
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: { text: fullContent }, status: 'delivered' as const }
            : msg
        )
      )
      currentStreamRef.current = null
      setIsLoading(false)
      return
    }
    
    // 计算下一个chunk的结束位置
    const nextIndex = Math.min(currentIndex + chunkSize, fullContent.length)
    const partialContent = fullContent.slice(0, nextIndex)
    
    // 更新消息内容
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: { text: partialContent } }
          : msg
      )
    )
    
    // 更新当前索引
    currentStreamRef.current.currentIndex = nextIndex
    
    // 继续流式回复
    streamingTimeoutRef.current = setTimeout(streamContent, streamDelay)
  }, [streamDelay, chunkSize])

  const simulateAIResponse = useCallback((_userMessage: string) => {
    console.log('simulateAIResponse called with:', _userMessage)
    setIsLoading(true)
    
    // 随机选择一个AI回复
    const responseIndex = Math.floor(Math.random() * AI_RESPONSES.length)
    const selectedResponse = AI_RESPONSES[responseIndex]
    
    // 包含工具调用的回复
    let stepIndex = 0
    
    const processNextStep = () => {
      if (stepIndex >= selectedResponse.steps.length) {
        setIsLoading(false)
        return
      }
      
      const step = selectedResponse.steps[stepIndex]
      
      if (step.type === 'tool_call') {
        // 创建工具调用消息
        const toolMessageId = generateId()
        const toolMessage: Message = {
          id: toolMessageId,
          sender: 'assistant',
          type: 'tool_call',
          content: { 
            tool_call: {
              name: step.tool,
              status: 'running'
            }
          },
          timestamp: new Date(),
          status: 'delivered',
        }
        
        setMessages(prev => [...prev, toolMessage])
        
        // 模拟工具调用完成
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === toolMessageId 
                ? { 
                    ...msg, 
                    content: { 
                      tool_call: {
                        name: step.tool,
                        status: 'success'
                      }
                    }
                  }
                : msg
            )
          )
          
          stepIndex++
          setTimeout(processNextStep, 300)
        }, 1500 + Math.random() * 1000) // 1.5-2.5秒的随机延迟
        
      } else if (step.type === 'text') {
        // 创建文本消息并开始流式回复
        const textMessageId = generateId()
        const textMessage: Message = {
          id: textMessageId,
          sender: 'assistant',
          type: 'text',
          content: { text: '' },
          timestamp: new Date(),
          status: 'pending',
        }
        
        setMessages(prev => [...prev, textMessage])
        
        // 设置流式回复的状态
        currentStreamRef.current = {
          messageId: textMessageId,
          fullContent: step.content,
          currentIndex: 0
        }
        
        // 开始流式回复，完成后继续下一步
        const streamForThisStep = () => {
          if (!currentStreamRef.current) return
          
          const { messageId, fullContent, currentIndex } = currentStreamRef.current
          
          if (currentIndex >= fullContent.length) {
            // 流式回复完成
            setMessages(prev => 
              prev.map(msg => 
                msg.id === messageId 
                  ? { ...msg, content: { text: fullContent }, status: 'delivered' as const }
                  : msg
              )
            )
            currentStreamRef.current = null
            
            // 继续下一步
            stepIndex++
            setTimeout(processNextStep, 800) // 增加间隔时间
            return
          }
          
          // 计算下一个chunk的结束位置
          const nextIndex = Math.min(currentIndex + chunkSize, fullContent.length)
          const partialContent = fullContent.slice(0, nextIndex)
          
          // 更新消息内容
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, content: { text: partialContent } }
                : msg
            )
          )
          
          // 更新当前索引
          currentStreamRef.current.currentIndex = nextIndex
          
          // 继续流式回复
          streamingTimeoutRef.current = setTimeout(streamForThisStep, streamDelay)
        }
        
        setTimeout(streamForThisStep, 500)
      }
    }
    
    processNextStep()
  }, [chunkSize, streamDelay])

  const sendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: generateId(),
      sender: 'user',
      type: 'text',
      content: { text: content },
      timestamp: new Date(),
      status: 'delivered',
      editable: true,
      deletable: true,
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // 模拟AI回复
    setTimeout(() => {
      simulateAIResponse(content)
    }, 300)
  }, [simulateAIResponse])

  const clearChat = useCallback(() => {
    stopStreaming()
    setMessages([])
  }, [stopStreaming])

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    stopStreaming,
    clearChat,
    deleteMessage,
  }
}
