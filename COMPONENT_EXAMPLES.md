# 组件开发指南

## 基础UI组件示例

### Button 组件
```typescript
// src/components/ui/button/Button.tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

### Avatar 组件
```typescript
// src/components/ui/avatar/Avatar.tsx
import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/utils/cn'

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
```

## 对话组件示例

### ChatMessage 组件
```typescript
// src/components/chat/chat-message/ChatMessage.tsx
import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { Copy, RotateCcw, Trash2, Edit3, User, Bot } from 'lucide-react'
import type { Message, OnMessageAction } from '@/types/chat'

export interface ChatMessageProps {
  message: Message
  showAvatar?: boolean
  showTimestamp?: boolean
  onAction?: OnMessageAction
  className?: string
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message, showAvatar = true, showTimestamp = true, onAction, className }, ref) => {
    const isUser = message.sender === 'user'
    const isSystem = message.sender === 'system'

    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    }

    const handleAction = (action: 'edit' | 'delete' | 'copy' | 'retry') => {
      onAction?.(message.id, action)
    }

    const copyToClipboard = async () => {
      if (message.content.text) {
        await navigator.clipboard.writeText(message.content.text)
        handleAction('copy')
      }
    }

    if (isSystem) {
      return (
        <div
          ref={ref}
          className={cn('flex justify-center my-4', className)}
        >
          <div className="bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground">
            {message.content.text}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-3 max-w-4xl mx-auto px-4 py-4 group',
          isUser ? 'flex-row-reverse' : 'flex-row',
          className
        )}
      >
        {showAvatar && (
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={isUser ? undefined : '/bot-avatar.png'} />
            <AvatarFallback>
              {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={cn('flex flex-col gap-1 flex-1', isUser ? 'items-end' : 'items-start')}>
          {/* 消息内容 */}
          <div
            className={cn(
              'rounded-lg px-4 py-2 max-w-2xl break-words',
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground',
              message.status === 'failed' && 'border-destructive border'
            )}
          >
            {message.type === 'text' && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content.text}
              </p>
            )}
            
            {message.type === 'code' && message.content.code && (
              <div className="bg-black/10 dark:bg-white/10 rounded p-3 my-2">
                <div className="text-xs text-muted-foreground mb-2">
                  {message.content.code.language}
                </div>
                <pre className="text-sm overflow-x-auto">
                  <code>{message.content.code.content}</code>
                </pre>
              </div>
            )}
          </div>

          {/* 时间戳和操作按钮 */}
          <div className={cn(
            'flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}>
            {showTimestamp && (
              <span className="text-xs text-muted-foreground">
                {formatTime(message.timestamp)}
              </span>
            )}

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyToClipboard}
              >
                <Copy className="h-3 w-3" />
              </Button>

              {message.status === 'failed' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleAction('retry')}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}

              {message.editable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleAction('edit')}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}

              {message.deletable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => handleAction('delete')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

ChatMessage.displayName = 'ChatMessage'

export { ChatMessage }
```

### ChatInput 组件
```typescript
// src/components/chat/chat-input/ChatInput.tsx
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { Send, Paperclip, Mic } from 'lucide-react'
import type { OnSendMessage } from '@/types/chat'

export interface ChatInputProps {
  onSendMessage?: OnSendMessage
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  maxLength?: number
  multiline?: boolean
  showAttachButton?: boolean
  showMicButton?: boolean
  className?: string
}

const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  ({
    onSendMessage,
    placeholder = '输入消息...',
    disabled = false,
    loading = false,
    maxLength = 2000,
    multiline = true,
    showAttachButton = true,
    showMicButton = true,
    className,
  }, ref) => {
    const [message, setMessage] = React.useState('')
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!message.trim() || disabled || loading) return

      const messageToSend = message.trim()
      setMessage('')
      
      // 重置文本域高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }

      try {
        await onSendMessage?.(messageToSend)
      } catch (error) {
        // 如果发送失败，恢复消息内容
        setMessage(messageToSend)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    }

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      if (value.length <= maxLength) {
        setMessage(value)
        
        // 自动调整高度
        if (multiline && textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
        }
      }
    }

    const canSend = message.trim().length > 0 && !disabled && !loading

    return (
      <div
        ref={ref}
        className={cn(
          'border-t bg-background px-4 py-4',
          className
        )}
      >
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* 附件按钮 */}
          {showAttachButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          )}

          {/* 输入框 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                multiline ? 'min-h-[40px] max-h-[120px]' : 'h-10'
              )}
              style={{
                fieldSizing: 'content',
              }}
            />
            
            {/* 字符计数 */}
            {maxLength && (
              <div className="absolute right-2 bottom-1 text-xs text-muted-foreground">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* 语音按钮 */}
          {showMicButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              disabled={disabled}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}

          {/* 发送按钮 */}
          <Button
            type="submit"
            size="icon"
            disabled={!canSend}
            loading={loading}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    )
  }
)

ChatInput.displayName = 'ChatInput'

export { ChatInput }
```

### ChatContainer 组件
```typescript
// src/components/chat/chat-container/ChatContainer.tsx
import * as React from 'react'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { ChatMessage } from '../chat-message'
import { ChatInput } from '../chat-input'
import { cn } from '@/utils/cn'
import { useChat } from '@/hooks/useChat'
import type { Message, OnSendMessage, OnMessageAction } from '@/types/chat'

export interface ChatContainerProps {
  messages?: Message[]
  onSendMessage?: OnSendMessage
  onMessageAction?: OnMessageAction
  showAvatar?: boolean
  showTimestamp?: boolean
  autoScrollToBottom?: boolean
  maxMessages?: number
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  children?: React.ReactNode
}

const ChatContainer = React.forwardRef<HTMLDivElement, ChatContainerProps>(
  ({
    messages: externalMessages,
    onSendMessage,
    onMessageAction,
    showAvatar = true,
    showTimestamp = true,
    autoScrollToBottom = true,
    maxMessages = 1000,
    placeholder = '输入消息...',
    disabled = false,
    loading = false,
    className,
    children,
  }, ref) => {
    const {
      messages: internalMessages,
      isLoading,
      sendMessage,
      retryMessage,
      editMessage,
      deleteMessage,
      messagesEndRef,
    } = useChat({
      initialMessages: externalMessages,
      autoScrollToBottom,
      maxMessages,
      onSendMessage,
    })

    // 使用外部消息或内部消息
    const messages = externalMessages || internalMessages
    const isLoadingState = loading || isLoading

    const handleMessageAction: OnMessageAction = async (messageId, action) => {
      switch (action) {
        case 'retry':
          await retryMessage(messageId)
          break
        case 'edit':
          // 这里应该打开编辑模式，暂时跳过
          break
        case 'delete':
          deleteMessage(messageId)
          break
        case 'copy':
          // 复制操作在 ChatMessage 组件内部处理
          break
      }
      
      // 调用外部处理函数
      onMessageAction?.(messageId, action)
    }

    const handleSendMessage = async (content: string) => {
      if (externalMessages) {
        // 如果使用外部消息，调用外部处理函数
        await onSendMessage?.(content)
      } else {
        // 否则使用内部处理
        await sendMessage(content)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full bg-background',
          className
        )}
      >
        {/* 消息列表区域 */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">开始对话</p>
                  <p className="text-sm">发送消息开始与AI助手对话</p>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    showAvatar={showAvatar}
                    showTimestamp={showTimestamp}
                    onAction={handleMessageAction}
                  />
                ))}
                
                {/* 正在输入指示器 */}
                {isLoadingState && (
                  <div className="flex gap-3 max-w-4xl mx-auto px-4 py-4">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-muted animate-pulse" />
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 滚动锚点 */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 自定义内容区域 */}
        {children}

        {/* 输入区域 */}
        <ChatInput
          onSendMessage={handleSendMessage}
          placeholder={placeholder}
          disabled={disabled}
          loading={isLoadingState}
        />
      </div>
    )
  }
)

ChatContainer.displayName = 'ChatContainer'

export { ChatContainer }
```

## Storybook 故事示例

### Button.stories.tsx
```typescript
// src/components/ui/button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { Send, Download, Trash2 } from 'lucide-react'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
    asChild: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

export const Icon: Story = {
  args: {
    variant: 'outline',
    size: 'icon',
    children: <Send className="h-4 w-4" />,
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Download className="mr-2 h-4 w-4" />
        Download
      </>
    ),
  },
}

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}
```

## 组件导出文件

### 各组件的 index.ts
```typescript
// src/components/ui/button/index.ts
export { Button, buttonVariants, type ButtonProps } from './Button'

// src/components/ui/avatar/index.ts
export { Avatar, AvatarImage, AvatarFallback } from './Avatar'

// src/components/ui/index.ts
export * from './button'
export * from './avatar'
// ... 其他组件

// src/components/chat/chat-message/index.ts
export { ChatMessage, type ChatMessageProps } from './ChatMessage'

// src/components/chat/chat-input/index.ts
export { ChatInput, type ChatInputProps } from './ChatInput'

// src/components/chat/chat-container/index.ts
export { ChatContainer, type ChatContainerProps } from './ChatContainer'

// src/components/chat/index.ts
export * from './chat-message'
export * from './chat-input'
export * from './chat-container'

// src/components/index.ts
export * from './ui'
export * from './chat'

// src/index.ts - 库的主入口
export * from './components'
export * from './hooks'
export * from './types'
export * from './utils'
```

这些组件示例展示了如何结合使用React、TypeScript、Radix UI、Lucide Icons和TailwindCSS来构建现代化的对话界面组件。每个组件都遵循了可访问性标准、类型安全和可复用的设计原则。
