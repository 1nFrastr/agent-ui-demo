import * as React from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ToolDetailsPanel } from '@/components/chat/tool-details-panel'
import { ToolPanel } from '@/components/tool-panel'
import { cn } from '@/utils/cn'
import type { Message } from '@/types/chat'
import type { SimpleFileSystem } from '@/components/tool-panel/types'

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
  const [isToolDetailsPanelOpen, setIsToolDetailsPanelOpen] = React.useState(false)

  // 检查是否是AI编程场景（包含file_browser工具调用）
  const isAIProgrammingScenario = React.useMemo(() => {
    return messages.some(message => 
      message.type === 'tool_call' && 
      message.content.tool_call?.name === 'file_browser'
    )
  }, [messages])

  // 获取文件浏览器工具的文件系统数据
  const fileSystemData = React.useMemo((): SimpleFileSystem | undefined => {
    if (!isAIProgrammingScenario) return undefined
    
    // 查找最新的file_browser工具调用消息
    const fileBrowserMessage = messages
      .filter(message => 
        message.type === 'tool_call' && 
        message.content.tool_call?.name === 'file_browser'
      )
      .pop() // 获取最后一个

    const toolCall = fileBrowserMessage?.content.tool_call
    const fileSystemMetadata = toolCall?.metadata?.fileSystemData as SimpleFileSystem | undefined
    
    return fileSystemMetadata
  }, [messages, isAIProgrammingScenario])

  const handleToolDetailsClick = (messageId: string) => {
    setSelectedToolMessageId(messageId)
    setIsToolDetailsPanelOpen(true)
  }

  const handleCloseToolDetails = () => {
    setIsToolDetailsPanelOpen(false)
    setSelectedToolMessageId(null)
  }

  const handleFilesChange = (newFiles: SimpleFileSystem) => {
    // 在实际应用中，这里可以将文件更改同步到后端或状态管理器
    console.log('Files changed:', newFiles)
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
        (isAIProgrammingScenario || isToolDetailsPanelOpen)
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

      {/* AI编程场景：显示文件浏览器和预览器 */}
      {isAIProgrammingScenario && fileSystemData ? (
        <div className="w-2/3 border-l border-border">
          <ToolPanel
            files={fileSystemData}
            defaultTab="files"
            onFilesChange={handleFilesChange}
            className="h-full"
          />
        </div>
      ) : (
        /* 普通场景：工具详情面板 */
        <div className={cn(
          'ease-in-out overflow-hidden border-l border-border',
          isToolDetailsPanelOpen 
            ? 'w-2/3 opacity-100 transition-all duration-300' // 展开：300ms
            : 'w-0 opacity-0 transition-all duration-500' // 收起：500ms
        )}>
          <ToolDetailsPanel
            messageId={selectedToolMessageId}
            messages={messages}
            isOpen={isToolDetailsPanelOpen}
            onClose={handleCloseToolDetails}
            className="w-full"
          />
        </div>
      )}
    </div>
  )
}