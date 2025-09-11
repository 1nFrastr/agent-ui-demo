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
    type: 'simple' as const,
    content: `# 欢迎使用AI助手！

我是一个智能对话助手，可以帮助你：

## 主要功能
- **代码生成与解释**：支持多种编程语言
- **文档撰写**：Markdown格式支持
- **问题解答**：各种技术和非技术问题
- **创意协助**：文案、方案、想法等

## 代码示例
这是一个React Hook的示例：

\`\`\`typescript
import { useState, useEffect } from 'react'

export const useCounter = (initialValue: number = 0) => {
  const [count, setCount] = useState(initialValue)
  
  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)
  const reset = () => setCount(initialValue)
  
  return { count, increment, decrement, reset }
}
\`\`\`

有什么我可以帮助你的吗？`
  },
  
  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'web_search',
        message: '让我搜索一下最新的React最佳实践...'
      },
      {
        type: 'text' as const,
        content: `根据最新的搜索结果，这里是 **React 2024年最佳实践** 总结：

## 🚀 现代React开发指南

### 1. 函数组件 + Hooks
\`\`\`typescript
// ✅ 推荐：使用函数组件
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

### 2. TypeScript 严格模式
\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
\`\`\`

### 3. 状态管理新趋势
- **Zustand**: 轻量级，学习成本低
- **Jotai**: 原子化状态管理
- **TanStack Query**: 服务端状态缓存

让我知道你想深入了解哪个方面！`
      }
    ]
  },

  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'code_analyzer',
        message: '正在分析您的代码结构...'
      },
      {
        type: 'tool_call' as const,
        tool: 'documentation_generator',
        message: '生成项目文档...'
      },
      {
        type: 'text' as const,
        content: `# 项目分析报告 📊

基于代码分析，我为您生成了以下建议：

## 架构优化建议

### 1. 组件层级优化
\`\`\`
src/
├── components/
│   ├── ui/           # 基础组件
│   ├── features/     # 功能组件
│   └── layouts/      # 布局组件
├── hooks/            # 自定义Hooks
├── utils/            # 工具函数
└── types/            # 类型定义
\`\`\`

### 2. 性能优化点
- ✅ 使用 \`React.memo\` 优化重渲染
- ✅ 合理使用 \`useMemo\` 和 \`useCallback\`
- ✅ 代码分割和懒加载

### 3. 推荐的依赖包
- **UI组件**: Radix UI + TailwindCSS
- **状态管理**: Zustand
- **表单处理**: React Hook Form + Zod
- **路由**: React Router v6

这些优化可以显著提升应用性能和开发体验！`
      }
    ]
  },

  {
    type: 'simple' as const,
    content: `让我为你展示一个完整的 **待办事项应用** 示例：

## TodoApp 组件实现

\`\`\`tsx
import React, { useState, useEffect } from 'react'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
}

export const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  // 添加新任务
  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date()
      }
      setTodos(prev => [...prev, newTodo])
      setInputValue('')
    }
  }

  // 切换任务状态
  const toggleTodo = (id: number) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">待办事项</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button 
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          添加
        </button>
      </div>
    </div>
  )
}
\`\`\`

这个例子展示了React开发的最佳实践！`
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
    
    if (selectedResponse.type === 'simple') {
      // 简单的文本回复
      const aiMessageId = generateId()
      const aiMessage: Message = {
        id: aiMessageId,
        sender: 'assistant',
        type: 'text',
        content: { text: '' },
        timestamp: new Date(),
        status: 'pending',
      }
      
      setMessages(prev => [...prev, aiMessage])
      
      // 设置流式回复的状态
      currentStreamRef.current = {
        messageId: aiMessageId,
        fullContent: selectedResponse.content,
        currentIndex: 0
      }
      
      // 开始流式回复
      setTimeout(() => streamContent(), 500)
    } else {
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
          
          // 开始流式回复
          setTimeout(() => {
            streamContent()
            stepIndex++
          }, 500)
        }
      }
      
      processNextStep()
    }
  }, [streamContent])

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
