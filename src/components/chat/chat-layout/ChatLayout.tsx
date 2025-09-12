import * as React from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ToolDetailsPanel } from '@/components/chat/tool-details-panel'
import { cn } from '@/utils/cn'
import type { Message, ToolCallDetails } from '@/types/chat'

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
  const [selectedToolDetails, setSelectedToolDetails] = React.useState<ToolCallDetails | null>(null)
  const [isToolDetailsPanelOpen, setIsToolDetailsPanelOpen] = React.useState(false)

  const handleToolDetailsClick = (toolDetails: ToolCallDetails) => {
    setSelectedToolDetails(toolDetails)
    setIsToolDetailsPanelOpen(true)
  }

  const handleCloseToolDetails = () => {
    setIsToolDetailsPanelOpen(false)
    setSelectedToolDetails(null)
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
        // 展开时快速动画，收起时慢速动画
        isToolDetailsPanelOpen 
          ? 'w-1/3 min-w-0 ml-0 transition-all duration-300' // 展开：300ms
          : 'w-full max-w-4xl mx-auto transition-all duration-500' // 收起：500ms
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

      {/* 工具详情面板 - 展开快，收起慢 */}
      <div className={cn(
        'ease-in-out overflow-hidden border-l border-border',
        isToolDetailsPanelOpen 
          ? 'w-2/3 opacity-100 transition-all duration-300' // 展开：300ms
          : 'w-0 opacity-0 transition-all duration-500' // 收起：500ms
      )}>
        {selectedToolDetails && (
          <ToolDetailsPanel
            toolDetails={selectedToolDetails}
            isOpen={isToolDetailsPanelOpen}
            onClose={handleCloseToolDetails}
            className="w-full"
          />
        )}
      </div>
    </div>
  )
}