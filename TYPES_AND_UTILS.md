# 工具函数和类型定义

## cn.ts - 类名合并工具
```typescript
// src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx'

/**
 * 合并类名的工具函数
 * 基于 clsx 和 class-variance-authority
 * 
 * @param inputs - 类名数组或条件类名
 * @returns 合并后的类名字符串
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': true, 'text-black': false })
 * // => 'px-4 py-2 bg-blue-500 text-white'
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
```

## 类型定义示例

### chat.ts - 对话相关类型
```typescript
// src/types/chat.ts

/**
 * 消息发送者类型
 */
export type MessageSender = 'user' | 'assistant' | 'system'

/**
 * 消息状态
 */
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed'

/**
 * 消息类型
 */
export type MessageType = 'text' | 'code' | 'image' | 'file' | 'system'

/**
 * 消息内容接口
 */
export interface MessageContent {
  /** 消息文本内容 */
  text?: string
  /** 代码内容和语言 */
  code?: {
    content: string
    language: string
  }
  /** 图片信息 */
  image?: {
    url: string
    alt?: string
    width?: number
    height?: number
  }
  /** 文件信息 */
  file?: {
    name: string
    url: string
    size: number
    type: string
  }
}

/**
 * 消息接口
 */
export interface Message {
  /** 消息唯一标识 */
  id: string
  /** 消息发送者 */
  sender: MessageSender
  /** 消息类型 */
  type: MessageType
  /** 消息内容 */
  content: MessageContent
  /** 消息时间戳 */
  timestamp: Date
  /** 消息状态 */
  status: MessageStatus
  /** 是否可编辑 */
  editable?: boolean
  /** 是否可删除 */
  deletable?: boolean
  /** 消息元数据 */
  metadata?: Record<string, any>
}

/**
 * 对话会话接口
 */
export interface ChatSession {
  /** 会话ID */
  id: string
  /** 会话标题 */
  title: string
  /** 消息列表 */
  messages: Message[]
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 会话配置 */
  config?: ChatConfig
}

/**
 * 对话配置接口
 */
export interface ChatConfig {
  /** 是否显示时间戳 */
  showTimestamp?: boolean
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 是否支持代码高亮 */
  enableCodeHighlight?: boolean
  /** 自动滚动到底部 */
  autoScrollToBottom?: boolean
  /** 最大消息数量 */
  maxMessages?: number
  /** 主题模式 */
  theme?: 'light' | 'dark' | 'auto'
}

/**
 * 消息发送回调类型
 */
export type OnSendMessage = (content: string, type?: MessageType) => void | Promise<void>

/**
 * 消息操作回调类型
 */
export type OnMessageAction = (messageId: string, action: 'edit' | 'delete' | 'copy' | 'retry') => void | Promise<void>

/**
 * 打字状态接口
 */
export interface TypingStatus {
  /** 是否正在打字 */
  isTyping: boolean
  /** 打字用户/助手标识 */
  sender: MessageSender
  /** 打字文本预览 */
  preview?: string
}
```

### theme.ts - 主题相关类型
```typescript
// src/types/theme.ts

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 颜色方案接口
 */
export interface ColorScheme {
  /** 主色调 */
  primary: string
  /** 次要颜色 */
  secondary: string
  /** 背景色 */
  background: string
  /** 前景色 */
  foreground: string
  /** 边框色 */
  border: string
  /** 静音色 */
  muted: string
  /** 强调色 */
  accent: string
  /** 错误色 */
  destructive: string
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题模式 */
  mode: ThemeMode
  /** 颜色方案 */
  colors?: Partial<ColorScheme>
  /** 圆角大小 */
  radius?: number
  /** 字体配置 */
  font?: {
    family?: string
    size?: 'sm' | 'md' | 'lg'
  }
  /** 动画配置 */
  animations?: {
    enabled: boolean
    duration: 'fast' | 'normal' | 'slow'
  }
}
```

### component.ts - 通用组件类型
```typescript
// src/types/component.ts
import { ReactNode, HTMLAttributes } from 'react'

/**
 * 基础组件Props
 */
export interface BaseComponentProps {
  /** 子元素 */
  children?: ReactNode
  /** 自定义类名 */
  className?: string
  /** 测试ID */
  'data-testid'?: string
}

/**
 * 尺寸变体
 */
export type SizeVariant = 'sm' | 'md' | 'lg'

/**
 * 颜色变体
 */
export type ColorVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'link'

/**
 * 按钮变体类型
 */
export interface ButtonVariants {
  variant?: ColorVariant
  size?: SizeVariant
  disabled?: boolean
  loading?: boolean
}

/**
 * 输入框变体类型
 */
export interface InputVariants {
  variant?: 'default' | 'error'
  size?: SizeVariant
  disabled?: boolean
}

/**
 * 带有HTML属性的组件Props
 */
export type ComponentPropsWithHTML<T = HTMLDivElement> = BaseComponentProps & 
  HTMLAttributes<T>

/**
 * 转发Ref的组件Props
 */
export type ComponentPropsWithRef<T = HTMLDivElement> = ComponentPropsWithHTML<T> & {
  ref?: React.Ref<T>
}
```

## Hooks 示例

### useChat.ts - 对话管理Hook
```typescript
// src/hooks/useChat.ts
import { useState, useCallback, useRef, useEffect } from 'react'
import type { Message, ChatSession, MessageStatus, OnSendMessage } from '@/types/chat'

/**
 * useChat Hook 配置选项
 */
export interface UseChatOptions {
  /** 初始消息列表 */
  initialMessages?: Message[]
  /** 会话ID */
  sessionId?: string
  /** 自动滚动到底部 */
  autoScrollToBottom?: boolean
  /** 最大消息数量 */
  maxMessages?: number
  /** 消息发送处理函数 */
  onSendMessage?: OnSendMessage
}

/**
 * useChat Hook 返回值
 */
export interface UseChatReturn {
  /** 消息列表 */
  messages: Message[]
  /** 当前会话 */
  session: ChatSession | null
  /** 是否正在发送消息 */
  isLoading: boolean
  /** 是否正在打字 */
  isTyping: boolean
  /** 发送消息 */
  sendMessage: (content: string) => Promise<void>
  /** 重试消息 */
  retryMessage: (messageId: string) => Promise<void>
  /** 编辑消息 */
  editMessage: (messageId: string, newContent: string) => void
  /** 删除消息 */
  deleteMessage: (messageId: string) => void
  /** 清空对话 */
  clearMessages: () => void
  /** 滚动到底部 */
  scrollToBottom: () => void
  /** 消息容器引用 */
  messagesEndRef: React.RefObject<HTMLDivElement>
}

/**
 * 对话管理Hook
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    initialMessages = [],
    sessionId,
    autoScrollToBottom = true,
    maxMessages = 1000,
    onSendMessage,
  } = options

  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [session, setSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    if (autoScrollToBottom) {
      scrollToBottom()
    }
  }, [messages, autoScrollToBottom, scrollToBottom])

  // 生成消息ID
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: generateMessageId(),
      sender: 'user',
      type: 'text',
      content: { text: content.trim() },
      timestamp: new Date(),
      status: 'sent',
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      if (onSendMessage) {
        await onSendMessage(content.trim())
      }
    } catch (error) {
      // 更新消息状态为失败
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'failed' as MessageStatus }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, onSendMessage, generateMessageId])

  // 重试消息
  const retryMessage = useCallback(async (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId)
    if (!message || message.status !== 'failed') return

    const content = message.content.text
    if (content) {
      await sendMessage(content)
    }
  }, [messages, sendMessage])

  // 编辑消息
  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, content: { ...msg.content, text: newContent } }
          : msg
      )
    )
  }, [])

  // 删除消息
  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }, [])

  // 清空对话
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  // 限制消息数量
  useEffect(() => {
    if (messages.length > maxMessages) {
      setMessages(prev => prev.slice(-maxMessages))
    }
  }, [messages.length, maxMessages])

  return {
    messages,
    session,
    isLoading,
    isTyping,
    sendMessage,
    retryMessage,
    editMessage,
    deleteMessage,
    clearMessages,
    scrollToBottom,
    messagesEndRef,
  }
}
```

这些文件提供了完整的类型定义和核心Hook实现，遵循了严格的TypeScript类型检查和React最佳实践。
