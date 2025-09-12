import React, { useState } from 'react'
import { cn } from '@/utils'
import type { FileBrowserProps, SimpleFile } from '../types'
import { 
  File, 
  Folder, 
  FileText, 
  Code, 
  Image, 
  Edit,
  Eye 
} from 'lucide-react'

// 文件图标映射
const getFileIcon = (file: SimpleFile) => {
  if (file.type === 'folder') {
    return <Folder className="w-4 h-4 text-blue-500" />
  }
  
  const extension = file.extension?.toLowerCase()
  switch (extension) {
    case 'html':
    case 'css':
    case 'js':
    case 'javascript':
    case 'ts':
    case 'typescript':
      return <Code className="w-4 h-4 text-green-500" />
    case 'txt':
    case 'md':
      return <FileText className="w-4 h-4 text-gray-500" />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <Image className="w-4 h-4 text-purple-500" />
    default:
      return <File className="w-4 h-4 text-gray-400" />
  }
}

// 文件项组件
const FileItem: React.FC<{
  file: SimpleFile
  isSelected: boolean
  onSelect: (file: SimpleFile) => void
  level?: number
}> = ({ file, isSelected, onSelect, level = 0 }) => {
  return (
    <div 
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
        isSelected && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        'border-l-2 border-transparent',
        isSelected && 'border-l-blue-500'
      )}
      style={{ paddingLeft: `${12 + level * 16}px` }}
      onClick={() => onSelect(file)}
    >
      {getFileIcon(file)}
      <span className="flex-1 truncate">{file.name}</span>
      {file.modified && (
        <span className="text-xs text-gray-400">
          {file.modified.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}

// 简单的文件编辑器组件
const FileEditor: React.FC<{
  file: SimpleFile
  readOnly: boolean
  onSave: (content: string) => void
  onCancel: () => void
}> = ({ file, readOnly, onSave, onCancel }) => {
  const [content, setContent] = useState(file.content || '')
  const [hasChanges, setHasChanges] = useState(false)

  const handleContentChange = (value: string) => {
    setContent(value)
    setHasChanges(value !== (file.content || ''))
  }

  const handleSave = () => {
    onSave(content)
    setHasChanges(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* 编辑器工具栏 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          {getFileIcon(file)}
          <span className="text-sm font-medium">{file.name}</span>
          {hasChanges && <span className="text-xs text-orange-500">• 未保存</span>}
        </div>
        
        <div className="flex items-center gap-2">
          {!readOnly && hasChanges && (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                保存
              </button>
              <button
                onClick={onCancel}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
            </>
          )}
          {readOnly && (
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              只读
            </span>
          )}
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1 p-3">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          readOnly={readOnly}
          className={cn(
            'w-full h-full resize-none border border-gray-200 dark:border-gray-600 rounded p-3',
            'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'font-mono text-sm leading-relaxed',
            readOnly && 'bg-gray-50 dark:bg-gray-800 cursor-default'
          )}
          placeholder={readOnly ? '文件内容为空' : '开始编辑文件内容...'}
          spellCheck={false}
        />
      </div>
    </div>
  )
}

export const FileBrowser: React.FC<FileBrowserProps> = ({
  files,
  readOnly = false,
  selectedFile,
  onFileSelect,
  onFileEdit,
}) => {
  const [editingFile, setEditingFile] = useState<SimpleFile | null>(null)

  // 扁平化文件列表（简化版本，不支持文件夹展开）
  const flattenFiles = (fileList: SimpleFile[], level = 0): Array<SimpleFile & { level: number }> => {
    const result: Array<SimpleFile & { level: number }> = []
    
    for (const file of fileList) {
      result.push({ ...file, level })
      if (file.type === 'file') {
        // 只显示文件，暂时不支持文件夹嵌套
      }
    }
    
    return result
  }

  const flatFiles = flattenFiles(files.files)
  
  // 找到当前选中的文件
  const selectedFileObj = flatFiles.find(f => f.path === selectedFile)

  const handleFileSelect = (file: SimpleFile) => {
    if (file.type === 'file') {
      onFileSelect?.(file)
      setEditingFile(null) // 切换文件时退出编辑模式
    }
  }

  const handleEdit = () => {
    if (selectedFileObj && !readOnly) {
      setEditingFile(selectedFileObj)
    }
  }

  const handleSaveEdit = (content: string) => {
    if (editingFile) {
      onFileEdit?.(editingFile.path, content)
      setEditingFile(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingFile(null)
  }

  return (
    <div className="flex h-full">
      {/* 文件列表 */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">文件列表</h3>
        </div>
        
        <div className="overflow-y-auto h-full">
          {flatFiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              没有文件
            </div>
          ) : (
            flatFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                isSelected={file.path === selectedFile}
                onSelect={handleFileSelect}
                level={file.level}
              />
            ))
          )}
        </div>
      </div>

      {/* 文件内容区域 */}
      <div className="flex-1 flex flex-col">
        {editingFile ? (
          <FileEditor
            file={editingFile}
            readOnly={readOnly}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        ) : selectedFileObj ? (
          <div className="flex flex-col h-full">
            {/* 文件信息工具栏 */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFileObj)}
                <span className="text-sm font-medium">{selectedFileObj.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {!readOnly && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    编辑
                  </button>
                )}
              </div>
            </div>

            {/* 文件内容预览 */}
            <div className="flex-1 p-3 overflow-auto">
              <pre className="text-sm text-gray-900 dark:text-gray-100 font-mono leading-relaxed whitespace-pre-wrap">
                {selectedFileObj.content || '文件内容为空'}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            <div className="text-center">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>选择一个文件来查看内容</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}