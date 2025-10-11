import * as React from 'react'
import { ChatMessage } from '@/components/chat/chat-message'
import { MessageInput } from '@/components/chat/message-input'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { MessageCircle, MoreVertical, Trash2, ArrowDown } from 'lucide-react'
import type { Message } from '@/types/chat'

export interface ChatInterfaceProps {
  /** 消息列表 */
  messages?: Message[]
  /** 是否正在发送消息 */
  isLoading?: boolean
  /** 是否启用Markdown渲染 */
  enableMarkdown?: boolean
  /** 输入框占位符 */
  placeholder?: string
  /** 发送消息回调 */
  onSendMessage?: (message: string) => void
  /** 停止当前操作回调 */
  onStop?: () => void
  /** 清空对话回调 */
  onClearChat?: () => void
  /** 工具详情点击回调 */
  onToolDetailsClick?: (messageId: string) => void
  /** 自定义类名 */
  className?: string
}

export const ChatInterface = React.forwardRef<HTMLDivElement, ChatInterfaceProps>(
  (
    {
      messages = [],
      isLoading = false,
      enableMarkdown = true,
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
    const [showScrollButton, setShowScrollButton] = React.useState(false)

    // 检测滚动位置，决定是否显示向下滑一页按钮
    const handleScroll = React.useCallback(() => {
      if (!messagesContainerRef.current) return
      
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const threshold = 100 // 距离底部100px以内不显示按钮
      const isNearBottom = scrollHeight - scrollTop - clientHeight <= threshold
      
      setShowScrollButton(!isNearBottom && messages.length > 0)
    }, [messages.length])

    // 向下滚动一页的函数
    const scrollDownOnePage = React.useCallback(() => {
      if (!messagesContainerRef.current) return
      
      const container = messagesContainerRef.current
      const scrollAmount = container.clientHeight * 0.8 // 滚动80%的容器高度
      
      container.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
      })
    }, [])

    // 滚动到底部的函数（用于发送新消息时）
    const scrollToBottom = React.useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    // 监听消息变化，检测用户发送的新消息并自动滚动到底部
    React.useEffect(() => {
      if (messages.length === 0) return
      
      const lastMessage = messages[messages.length - 1]
      // 只在用户发送消息时自动滚动到底部
      if (lastMessage && lastMessage.sender === 'user') {
        // 使用setTimeout确保DOM更新完成后再滚动
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }
    }, [messages, scrollToBottom])

    // 监听滚动事件
    React.useEffect(() => {
      const container = messagesContainerRef.current
      if (container) {
        container.addEventListener('scroll', handleScroll)
        // 初始检查
        handleScroll()
        
        return () => {
          container.removeEventListener('scroll', handleScroll)
        }
      }
    }, [handleScroll])

    // 使用 useCallback 缓存事件处理器，避免每次渲染时重新创建
    const handleSendMessage = React.useCallback((message: string) => {
      onSendMessage?.(message)
      setInputValue('')
    }, [onSendMessage])

    const handleToolDetailsClick = React.useCallback((messageId: string) => {
      onToolDetailsClick?.(messageId)
    }, [onToolDetailsClick])

    const handleInputChange = React.useCallback((value: string) => {
      setInputValue(value)
    }, [])

    // 缓存消息列表渲染，避免因为输入框状态变化导致重新渲染
    // TODO: 对比useMemo和外层react.memo的区别
    const messageList = React.useMemo(() => {
      return messages.map((message, index) => {
        const isUser = message.sender === 'user'
        const prevMessage = index > 0 ? messages[index - 1] : null
        const isConsecutiveAssistant = 
          !isUser && 
          prevMessage && 
          prevMessage.sender === 'assistant'
        
        // 判断是否是最后一条消息
        const isLastMessage = index === messages.length - 1
        
        return (
          <div 
            key={message.id}
            className={cn(
              // 用户消息保持正常间距
              isUser ? 'mb-4' : 
              // AI连续消息间距很小，看起来像同一条消息
              isConsecutiveAssistant ? 'mb-1' : 'mb-3'
            )}
            style={
              // 为最后一条消息设置min-height，类似ChatGPT的实现
              // 计算: 100vh - 头部高度(约80px) - 输入框高度(约120px) - 内边距(约48px)
              isLastMessage ? {
                minHeight: 'calc(100vh - 248px)'
              } : undefined
            }
          >
            <ChatMessage
              message={message}
              enableMarkdown={enableMarkdown}
              onToolDetailsClick={handleToolDetailsClick}
            />
          </div>
        )
      })
    }, [messages, enableMarkdown, handleToolDetailsClick])

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full bg-background relative',
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
              {messageList}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 向下滑一页按钮 */}
        {showScrollButton && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
            <div
              onClick={scrollDownOnePage}
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background/90 hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center cursor-pointer"
            >
              <ArrowDown className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* 消息输入框 */}
        <MessageInput
          value={inputValue}
          onChange={handleInputChange}
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
