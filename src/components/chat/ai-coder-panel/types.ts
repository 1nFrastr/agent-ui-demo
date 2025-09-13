/**
 * 简化版本的Tool Panel类型定义
 */

export interface SimpleFile {
  id: string
  name: string
  path: string
  type: 'file' | 'folder'
  content?: string
  modified?: Date
  children?: SimpleFile[]
  
  // 简化的元数据
  extension?: string
  isReadOnly?: boolean
}

export interface SimpleFileSystem {
  files: SimpleFile[]
  selectedPath?: string
}

export interface SimplePreviewState {
  isLoading: boolean
  error?: string
  lastUpdate: Date
  
  // 预览内容 (合并的HTML)
  combinedHtml?: string
}

export type TabType = 'files' | 'preview'

export interface AICoderPanelProps {
  // 基础配置
  className?: string
  defaultTab?: TabType
  
  // 文件系统配置
  files?: SimpleFileSystem
  readOnly?: boolean
  onFilesChange?: (files: SimpleFileSystem) => void
  
  // 回调函数
  onFileSelect?: (file: SimpleFile) => void
  onFileEdit?: (file: SimpleFile, content: string) => void
}

export interface FileBrowserProps {
  files: SimpleFileSystem
  readOnly?: boolean
  selectedFile?: string
  
  // 回调
  onFileSelect?: (file: SimpleFile) => void
  onFileEdit?: (path: string, content: string) => void
}

export interface HtmlPreviewProps {
  // 代码内容
  htmlContent?: string
  cssContent?: string
  jsContent?: string
  
  // 预览配置
  sandboxed?: boolean
  
  // 回调
  onRefresh?: () => void
  onError?: (error: Error) => void
}