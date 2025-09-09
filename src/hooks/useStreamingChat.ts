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
  `# 欢迎使用AI助手！

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

有什么我可以帮助你的吗？`,

  `当然！我来为你详细介绍一下 **React Hooks** 的核心概念：

## React Hooks 简介

React Hooks 是 React 16.8 引入的新特性，让你能在函数组件中使用状态和其他React特性。

### 常用的 Hooks

#### 1. useState - 状态管理
\`\`\`javascript
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  )
}
\`\`\`

#### 2. useEffect - 副作用处理
\`\`\`javascript
import { useEffect, useState } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    // 组件挂载或userId变化时执行
    fetchUser(userId).then(setUser)
    
    // 清理函数（可选）
    return () => {
      // 清理逻辑
    }
  }, [userId]) // 依赖数组
  
  return <div>{user?.name}</div>
}
\`\`\`

### Hook 规则
1. **只在顶层调用** - 不要在循环、条件或嵌套函数中调用
2. **只在React函数中调用** - 函数组件或自定义Hook

> 💡 **提示**：自定义Hook是复用状态逻辑的强大方式！

还有什么想了解的吗？`,

  `让我为你展示一个完整的 **待办事项应用** 示例：

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

  // 删除任务
  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  // 过滤任务
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active': return !todo.completed
      case 'completed': return todo.completed
      default: return true
    }
  })

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">待办事项</h1>
      
      {/* 输入框 */}
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

      {/* 过滤器 */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={\`px-3 py-1 rounded \${
              filter === f ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }\`}
          >
            {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      {/* 任务列表 */}
      <ul className="space-y-2">
        {filteredTodos.map(todo => (
          <li 
            key={todo.id}
            className="flex items-center gap-2 p-2 border rounded"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span 
              className={\`flex-1 \${
                todo.completed ? 'line-through text-gray-500' : ''
              }\`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              删除
            </button>
          </li>
        ))}
      </ul>

      {filteredTodos.length === 0 && (
        <p className="text-gray-500 text-center mt-4">
          {filter === 'all' ? '暂无任务' : 
           filter === 'active' ? '没有进行中的任务' : '没有已完成的任务'}
        </p>
      )}
    </div>
  )
}
\`\`\`

## 特性说明

### 🎯 核心功能
- ✅ **添加任务**：输入框 + 回车键/按钮
- ✅ **切换状态**：点击复选框完成/取消任务  
- ✅ **删除任务**：删除按钮移除任务
- ✅ **过滤查看**：全部/进行中/已完成

### 🛠️ 技术亮点
- **TypeScript**：完整的类型定义
- **React Hooks**：useState 管理状态
- **响应式设计**：TailwindCSS 样式
- **用户体验**：键盘快捷键支持

这个例子展示了React开发的最佳实践，你可以基于此扩展更多功能！`,

  `# 现代前端开发技术栈

让我为你介绍当前最流行的前端技术栈：

## 🚀 核心框架对比

| 框架 | 优势 | 适用场景 |
|------|------|----------|
| **React** | 生态丰富、学习资源多 | 大型应用、企业级项目 |
| **Vue.js** | 上手简单、文档友好 | 中小型项目、快速开发 |
| **Angular** | 完整解决方案、企业级 | 大型企业应用 |
| **Svelte** | 编译时优化、体积小 | 性能敏感应用 |

## 📦 构建工具演进

### 传统构建工具
\`\`\`bash
# Webpack 配置示例
module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
}
\`\`\`

### 现代构建工具
\`\`\`json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
\`\`\`

## 🎨 样式解决方案

### 1. TailwindCSS - 实用优先
\`\`\`html
<div class="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
  <h1 class="text-4xl font-bold text-white">Hello World</h1>
</div>
\`\`\`

### 2. CSS-in-JS - 动态样式
\`\`\`javascript
import styled from 'styled-components'

const Button = styled.button\`
  padding: 12px 24px;
  background: \${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 4px;
  
  &:hover {
    opacity: 0.8;
  }
\`
\`\`\`

## 🔧 开发工具链

### TypeScript 配置
\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
\`\`\`

## 🧪 测试策略

\`\`\`javascript
// Jest + Testing Library
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
\`\`\`

> 💡 **建议**：选择技术栈时要考虑团队经验、项目规模和长期维护成本！

还想了解哪个方面的详细内容？`
]

export const useStreamingChat = (options: UseStreamingChatOptions = {}): UseStreamingChatReturn => {
  const { streamDelay = 30, chunkSize = 2 } = options
  
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

  const simulateAIResponse = useCallback((_userMessage: string) => {
    console.log('simulateAIResponse called with:', _userMessage)
    setIsLoading(true)
    
    // 随机选择一个AI回复
    const responseIndex = Math.floor(Math.random() * AI_RESPONSES.length)
    const fullResponse = AI_RESPONSES[responseIndex]
    
    // 创建AI消息
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
      fullContent: fullResponse,
      currentIndex: 0
    }
    
    // 开始流式回复
    const streamContent = () => {
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
    }
    
    // 延迟开始，模拟思考时间
    setTimeout(streamContent, 500)
  }, [streamDelay, chunkSize])

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
