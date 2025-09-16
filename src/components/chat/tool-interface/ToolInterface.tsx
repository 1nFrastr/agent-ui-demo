import * as React from 'react'
import { ToolDetailsPanel } from '@/components/chat/tool-details-panel'
import { AICoderPanel } from '@/components/chat/ai-coder-panel'
import { cn } from '@/utils/cn'
import type { Message } from '@/types/chat'
import type { SimpleFileSystem } from '@/components/chat/ai-coder-panel/types'

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
  // 获取当前选中的工具消息
  const selectedToolMessage = React.useMemo(() => {
    if (!selectedToolMessageId) return null
    return messages.find(message => message.id === selectedToolMessageId) || null
  }, [messages, selectedToolMessageId])

  // 检查选中的消息是否是AI编程场景（file_browser工具调用）
  const isSelectedMessageAICoder = React.useMemo(() => {
    return selectedToolMessage?.type === 'tool_call' && 
           selectedToolMessage.content.tool_call?.name === 'file_browser'
  }, [selectedToolMessage])

  // 获取文件浏览器工具的文件系统数据（仅当选中的消息是file_browser时）
  const fileSystemData = React.useMemo((): SimpleFileSystem | undefined => {
    if (!isSelectedMessageAICoder || !selectedToolMessage) return undefined
    
    const toolCall = selectedToolMessage.content.tool_call
    const fileSystemMetadata = toolCall?.metadata?.fileSystemData as SimpleFileSystem | undefined
    
    // 转换ISO字符串为Date对象
    if (fileSystemMetadata?.files) {
      const processedFileSystem = {
        ...fileSystemMetadata,
        files: fileSystemMetadata.files.map(file => ({
          ...file,
          modified: typeof file.modified === 'string' ? new Date(file.modified) : file.modified
        }))
      }
      return processedFileSystem
    }
    
    return fileSystemMetadata
  }, [selectedToolMessage, isSelectedMessageAICoder])

  const handleFilesChange = (newFiles: SimpleFileSystem) => {
    // 在实际应用中，这里可以将文件更改同步到后端或状态管理器
    console.log('Files changed:', newFiles)
  }

  // 根据选中的消息类型决定显示哪种面板
  if (isSelectedMessageAICoder && fileSystemData) {
    // AI编程场景：显示文件浏览器和预览器（仅当用户点击了file_browser工具调用时）
    return (
      <div className={cn(
        'ease-in-out border-l border-border',
        isOpen 
          ? 'w-2/3 opacity-100 transition-all duration-300'
          : 'w-0 opacity-0 transition-all duration-500 overflow-hidden',
        className
      )}>
        {isOpen && (
          <AICoderPanel
            files={fileSystemData}
            onFilesChange={handleFilesChange}
            onClose={onClose}
            className="h-full"
          />
        )}
      </div>
    )
  }

  // 普通场景：显示工具详情面板
  return (
    <div className={cn(
      'ease-in-out overflow-hidden border-l border-border h-full',
      isOpen 
        ? 'w-2/3 opacity-100 transition-all duration-300'
        : 'w-0 opacity-0 transition-all duration-500',
      className
    )}>
      {isOpen && (
        <ToolDetailsPanel
          messageId={selectedToolMessageId || null}
          messages={messages}
          isOpen={isOpen}
          onClose={onClose}
          className="w-full h-full"
        />
      )}
    </div>
  )
}