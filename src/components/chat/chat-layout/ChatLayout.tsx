import * as React from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ToolInterface } from '@/components/chat/tool-interface'
import { cn } from '@/utils/cn'
import type { Message } from '@/types/chat'

export interface ChatLayoutProps {
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
  /** 自定义类名 */
  className?: string
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  messages = [],
  isLoading = false,
  enableMarkdown = true,
  theme = 'light',
  placeholder = '输入消息...',
  onSendMessage,
  onStop,
  onClearChat,
  className,
}) => {
  const [selectedToolMessageId, setSelectedToolMessageId] = React.useState<string | null>(null)
  const [isToolPanelOpen, setIsToolPanelOpen] = React.useState(false)

  const handleToolDetailsClick = (messageId: string) => {
    setSelectedToolMessageId(messageId)
    setIsToolPanelOpen(true)
  }

  const handleCloseToolPanel = () => {
    setIsToolPanelOpen(false)
    setSelectedToolMessageId(null)
  }

  return (
    <div
      className={cn(
        'flex h-full max-h-screen bg-background',
        className
      )}
    >
      {/* 对话区域 - 平滑过渡 */}
      <div className={cn(
        'flex flex-col ease-in-out',
        // 根据场景调整布局
        isToolPanelOpen
          ? 'w-1/3 min-w-0 ml-0 transition-all duration-300' // 工具面板展开：占1/3
          : 'w-full max-w-4xl mx-auto transition-all duration-500' // 默认：居中全宽
      )}>
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          enableMarkdown={enableMarkdown}
          theme={theme}
          placeholder={placeholder}
          onSendMessage={onSendMessage}
          onStop={onStop}
          onClearChat={onClearChat}
          onToolDetailsClick={handleToolDetailsClick}
          className="h-full"
        />
      </div>

      {/* 工具界面 - 统一处理不同类型的工具面板 */}
      <ToolInterface
        messages={messages}
        selectedToolMessageId={selectedToolMessageId}
        isOpen={isToolPanelOpen}
        onClose={handleCloseToolPanel}
        className=""
      />
    </div>
  )
}