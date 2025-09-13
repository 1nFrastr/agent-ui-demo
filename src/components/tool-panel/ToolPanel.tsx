import React, { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { cn } from '@/utils'
import type { ToolPanelProps, TabType, SimpleFileSystem, SimpleFile } from './types'
import { FileBrowser } from './file-browser/FileBrowser'
import { HtmlPreview } from './html-preview/HtmlPreview'
import { Files, Eye } from 'lucide-react'

export const ToolPanel: React.FC<ToolPanelProps> = ({
  className,
  defaultTab = 'files',
  files: initialFiles,
  readOnly = false,
  onFilesChange,
  onFileSelect,
  onFileEdit,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab)
  const [files, setFiles] = useState<SimpleFileSystem>(
    initialFiles || { files: [], selectedPath: undefined }
  )

  const handleFilesChange = (newFiles: SimpleFileSystem) => {
    setFiles(newFiles)
    onFilesChange?.(newFiles)
  }

  const handleFileEdit = (path: string, content: string) => {
    // 更新文件内容
    const updateFileContent = (fileList: typeof files.files): typeof files.files => {
      return fileList.map(file => {
        if (file.path === path) {
          return { ...file, content, modified: new Date() }
        }
        if (file.children) {
          return { ...file, children: updateFileContent(file.children) }
        }
        return file
      })
    }

    const updatedFiles = {
      ...files,
      files: updateFileContent(files.files)
    }
    
    handleFilesChange(updatedFiles)
    
    // 找到编辑的文件并触发回调
    const findFile = (fileList: typeof files.files, targetPath: string): SimpleFile | null => {
      for (const file of fileList) {
        if (file.path === targetPath) return file
        if (file.children) {
          const found = findFile(file.children, targetPath)
          if (found) return found
        }
      }
      return null
    }
    
    const editedFile = findFile(updatedFiles.files, path)
    if (editedFile) {
      onFileEdit?.(editedFile, content)
    }
  }

  // 获取当前选中文件的内容用于预览
  const getPreviewContent = () => {
    if (!files.selectedPath) return {}
    
    const findFile = (fileList: typeof files.files, targetPath: string): SimpleFile | null => {
      for (const file of fileList) {
        if (file.path === targetPath) return file
        if (file.children) {
          const found = findFile(file.children, targetPath)
          if (found) return found
        }
      }
      return null
    }

    // 查找所有相关文件
    const findAllFiles = () => {
      const result: { htmlContent?: string; cssContent?: string; jsContent?: string } = {}
      
      for (const file of files.files) {
        if (file.type === 'file') {
          const extension = file.extension?.toLowerCase()
          const content = file.content || ''
          
          switch (extension) {
            case 'html': {
              // 如果HTML文件包含外部引用，清理它们，因为我们会直接嵌入CSS和JS
              const cleanHtmlContent = content
                .replace(/<link[^>]*rel\s*=\s*["']stylesheet["'][^>]*>/gi, '')
                .replace(/<script[^>]*src\s*=\s*["'][^"']*["'][^>]*><\/script>/gi, '')
              
              result.htmlContent = cleanHtmlContent
              break
            }
            case 'css':
              result.cssContent = content
              break
            case 'js':
            case 'javascript':
              result.jsContent = content
              break
          }
        }
      }
      return result
    }
    
    const selectedFile = findFile(files.files, files.selectedPath)
    if (!selectedFile || selectedFile.type !== 'file') return {}
    
    const extension = selectedFile.extension?.toLowerCase()
    
    // 检查文件系统中是否有HTML文件
    const hasHtmlFile = files.files.some(file => 
      file.type === 'file' && file.extension?.toLowerCase() === 'html'
    )
    
    // 如果有HTML文件，总是组合所有相关文件（无论当前选中什么文件）
    if (hasHtmlFile) {
      return findAllFiles()
    }
    
    // 如果没有HTML文件，根据选中文件类型返回内容
    const content = selectedFile.content || ''
    switch (extension) {
      case 'css':
        return { cssContent: content }
      case 'js':
      case 'javascript':
        return { jsContent: content }
      default:
        // 如果是其他类型，尝试作为HTML显示
        return { htmlContent: content }
    }
  }

  const previewContent = getPreviewContent()

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      <Tabs.Root 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as TabType)}
        className="flex flex-col h-full"
      >
        {/* Tab导航 */}
        <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Tabs.Trigger
            value="files"
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500',
              'data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400',
              'text-gray-600 dark:text-gray-300'
            )}
          >
            <Files className="w-4 h-4" />
            文件浏览器
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="preview"
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500',
              'data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400',
              'text-gray-600 dark:text-gray-300'
            )}
          >
            <Eye className="w-4 h-4" />
            HTML预览
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab内容 */}
        <div className="flex-1 overflow-hidden">
          <Tabs.Content value="files" className="h-full">
            <FileBrowser
              files={files}
              readOnly={readOnly}
              selectedFile={files.selectedPath}
              onFileSelect={(file: SimpleFile) => {
                const updatedFiles = { ...files, selectedPath: file.path }
                handleFilesChange(updatedFiles)
                onFileSelect?.(file)
              }}
              onFileEdit={handleFileEdit}
            />
          </Tabs.Content>

          <Tabs.Content value="preview" className="h-full">
            <HtmlPreview
              {...previewContent}
              sandboxed={true}
              onError={(error: Error) => {
                console.error('Preview error:', error)
              }}
            />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  )
}