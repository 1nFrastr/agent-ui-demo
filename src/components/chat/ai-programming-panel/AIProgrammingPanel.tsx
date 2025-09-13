import * as React from 'react'
import { ToolPanel } from '@/components/tool-panel'
import { cn } from '@/utils/cn'
import type { SimpleFileSystem } from '@/components/tool-panel/types'

export interface AIProgrammingPanelProps {
  /** 文件系统数据 */
  files: SimpleFileSystem
  /** 文件更改回调 */
  onFilesChange?: (newFiles: SimpleFileSystem) => void
  /** 自定义类名 */
  className?: string
}

/**
 * AI编程面板组件
 * 专门用于AI编程场景，提供文件浏览器和代码预览功能
 */
export const AIProgrammingPanel: React.FC<AIProgrammingPanelProps> = ({
  files,
  onFilesChange,
  className,
}) => {
  return (
    <div className={cn('h-full', className)}>
      <ToolPanel
        files={files}
        defaultTab="files"
        onFilesChange={onFilesChange}
        className="h-full"
      />
    </div>
  )
}