import * as React from 'react'
import { ChatMessage } from '@/components/chat/chat-message'
import { MessageInput } from '@/components/chat/message-input'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { MessageCircle, MoreVertical, Trash2 } from 'lucide-react'
import type { Message, ToolCallDetails } from '@/types/chat'

export interface ChatInterfaceProps {
  /** 消息列表 */
  messages?: Message[]
  /** 是否正在发送消息 */
  isLoading?: boolean
  /** 是否启用Markdown渲染 */
  enableMarkdown?: boolean
  /** 主题模式 */
  theme?: 'light' | 'dark'
  /** 输入框占位符 */
  placeholder?: string
  /** 发送消息回调 */
  onSendMessage?: (message: string) => void
  /** 停止当前操作回调 */
  onStop?: () => void
  /** 清空对话回调 */
  onClearChat?: () => void
  /** 工具详情点击回调 */
  onToolDetailsClick?: (toolDetails: ToolCallDetails) => void
  /** 自定义类名 */
  className?: string
}

export const ChatInterface = React.forwardRef<HTMLDivElement, ChatInterfaceProps>(
  (
    {
      messages = [],
      isLoading = false,
      enableMarkdown = true,
      theme = 'light',
      placeholder = '输入消息...',
      onSendMessage,
      onStop,
      onClearChat,
      onToolDetailsClick,
      className,
    },
    ref
  ) => {
    const messagesEndRef = React.useRef<HTMLDivElement>(null)
    const messagesContainerRef = React.useRef<HTMLDivElement>(null)
    const [inputValue, setInputValue] = React.useState('')

    // 自动滚动到底部
    const scrollToBottom = React.useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    React.useEffect(() => {
      scrollToBottom()
    }, [messages, scrollToBottom])

    const handleSendMessage = (message: string) => {
      onSendMessage?.(message)
      setInputValue('')
    }

    const handleToolDetailsClick = (toolDetails: ToolCallDetails) => {
      onToolDetailsClick?.(toolDetails)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full bg-background',
          className
        )}
      >
        {/* 聊天头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">AI助手</h2>
              <p className="text-sm text-muted-foreground">智能对话助手</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onClearChat && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearChat}
                disabled={messages.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 消息列表容器 */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                开始新对话
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                发送消息开始与AI助手对话，支持Markdown格式和代码高亮。
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isUser = message.sender === 'user'
                const prevMessage = index > 0 ? messages[index - 1] : null
                const isConsecutiveAssistant = 
                  !isUser && 
                  prevMessage && 
                  prevMessage.sender === 'assistant'
                
                return (
                  <div 
                    key={message.id}
                    className={cn(
                      // 用户消息保持正常间距
                      isUser ? 'mb-4' : 
                      // AI连续消息间距很小，看起来像同一条消息
                      isConsecutiveAssistant ? 'mb-1' : 'mb-3'
                    )}
                  >
                    <ChatMessage
                      message={message}
                      enableMarkdown={enableMarkdown}
                      theme={theme}
                      onToolDetailsClick={handleToolDetailsClick}
                    />
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 消息输入框 */}
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          placeholder={placeholder}
          isLoading={isLoading}
          onSend={handleSendMessage}
          onStop={onStop}
          className="border-t-0"
        />
      </div>
    )
  }
)
