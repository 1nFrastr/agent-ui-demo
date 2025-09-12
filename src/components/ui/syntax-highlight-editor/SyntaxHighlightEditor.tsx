import React, { useState, useRef, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/utils'

// 根据文件扩展名获取语法高亮语言
const getLanguageFromExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'sh': 'bash',
    'bash': 'bash',
    'yml': 'yaml',
    'yaml': 'yaml',
    'toml': 'toml',
    'sql': 'sql',
    'dockerfile': 'dockerfile',
    'vue': 'vue',
    'svelte': 'svelte'
  }
  
  return languageMap[extension || ''] || 'text'
}

export interface SyntaxHighlightEditorProps {
  value: string
  onChange: (value: string) => void
  filename?: string
  language?: string
  readOnly?: boolean
  placeholder?: string
  className?: string
  showLineNumbers?: boolean
}

export const SyntaxHighlightEditor: React.FC<SyntaxHighlightEditorProps> = ({
  value,
  onChange,
  filename = '',
  language,
  readOnly = false,
  placeholder = '开始编辑代码...',
  className,
  showLineNumbers = true
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlighterRef = useRef<HTMLDivElement>(null)
  
  // 确定使用的语言
  const detectedLanguage = language || getLanguageFromExtension(filename)
  
  // 使用亮色主题
  const theme = oneLight
  
  // 同步滚动
  const handleScroll = () => {
    if (textareaRef.current && highlighterRef.current) {
      highlighterRef.current.scrollTop = textareaRef.current.scrollTop
      highlighterRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }
  
  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }
  
  // 处理 Tab 键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return
      
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      
      onChange(newValue)
      
      // 设置光标位置
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }
  
  useEffect(() => {
    // 同步滚动位置
    if (textareaRef.current && highlighterRef.current) {
      const textarea = textareaRef.current
      
      textarea.addEventListener('scroll', handleScroll)
      return () => textarea.removeEventListener('scroll', handleScroll)
    }
  }, [])
  
  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* 语法高亮背景层 */}
      <div
        ref={highlighterRef}
        className={cn(
          'absolute inset-0 overflow-auto',
          'pointer-events-none select-none',
          'bg-white'
        )}
        style={{ 
          fontSize: '14px',
          lineHeight: '1.5',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
        }}
      >
        <SyntaxHighlighter
          language={detectedLanguage}
          style={theme}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          customStyle={{
            margin: 0,
            padding: '12px',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#9ca3af',
            borderRight: '1px solid #e5e7eb',
            marginRight: '1em'
          }}
        >
          {value || ' '}
        </SyntaxHighlighter>
      </div>
      
      {/* 透明的文本输入层 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={cn(
          'absolute inset-0 w-full h-full resize-none border-0 outline-none',
          'bg-transparent text-transparent caret-current',
          'font-mono text-sm leading-relaxed',
          'overflow-auto',
          isFocused && 'ring-2 ring-blue-500 ring-inset',
          readOnly && 'cursor-default'
        )}
        style={{
          fontSize: '14px',
          lineHeight: '1.5',
          padding: showLineNumbers ? '12px 12px 12px 5em' : '12px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          color: 'transparent',
          caretColor: '#000000'
        }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
      
      {/* 占位符 */}
      {!value && !isFocused && (
        <div 
          className={cn(
            'absolute pointer-events-none select-none',
            'font-mono text-sm leading-relaxed',
            'text-gray-400'
          )}
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            padding: showLineNumbers ? '12px 12px 12px 5em' : '12px',
            top: 0,
            left: 0
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}