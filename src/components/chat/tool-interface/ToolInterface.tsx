import * as React from 'react'
import { ToolDetailsPanel } from '@/components/chat/tool-details-panel'
import { AIProgrammingPanel } from '@/components/chat/ai-programming-panel'
import { cn } from '@/utils/cn'
import type { Message } from '@/types/chat'
import type { SimpleFileSystem } from '@/components/tool-panel/types'

export interface ToolInterfaceProps {
  /** 消息列表 */
  messages: Message[]
  /** 选中的工具消息ID */
  selectedToolMessageId?: string | null
  /** 是否打开工具面板 */
  isOpen: boolean
  /** 关闭工具面板回调 */
  onClose: () => void
  /** 自定义类名 */
  className?: string
}

/**
 * 工具界面统一组件
 * 根据不同的工具调用类型，显示相应的面板组件
 */
export const ToolInterface: React.FC<ToolInterfaceProps> = ({
  messages,
  selectedToolMessageId,
  isOpen,
  onClose,
  className,
}) => {
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

  const handleFilesChange = (newFiles: SimpleFileSystem) => {
    // 在实际应用中，这里可以将文件更改同步到后端或状态管理器
    console.log('Files changed:', newFiles)
  }

  // 根据场景决定显示哪种面板
  if (isAIProgrammingScenario && fileSystemData) {
    // AI编程场景：显示文件浏览器和预览器
    return (
      <div className={cn(
        'ease-in-out border-l border-border',
        isOpen 
          ? 'w-2/3 opacity-100 transition-all duration-300'
          : 'w-0 opacity-0 transition-all duration-500 overflow-hidden',
        className
      )}>
        {isOpen && (
          <AIProgrammingPanel
            files={fileSystemData}
            onFilesChange={handleFilesChange}
            className="h-full"
          />
        )}
      </div>
    )
  }

  // 普通场景：显示工具详情面板
  return (
    <div className={cn(
      'ease-in-out overflow-hidden border-l border-border',
      isOpen 
        ? 'w-2/3 opacity-100 transition-all duration-300'
        : 'w-0 opacity-0 transition-all duration-500',
      className
    )}>
      <ToolDetailsPanel
        messageId={selectedToolMessageId || null}
        messages={messages}
        isOpen={isOpen}
        onClose={onClose}
        className="w-full"
      />
    </div>
  )
}