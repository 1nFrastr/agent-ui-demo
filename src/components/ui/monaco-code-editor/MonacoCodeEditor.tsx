import React, { useRef, useEffect, useState } from 'react'
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { cn } from '@/utils'
import { initializeMonacoEditor, defaultEditorOptions } from './monaco-config'

// Monaco Editor语言映射
const getMonacoLanguage = (filename: string, language?: string): string => {
  if (language) return language

  const extension = filename.split('.').pop()?.toLowerCase()
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'scss',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'md': 'markdown',
    'markdown': 'markdown',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'ps1': 'powershell',
    'yml': 'yaml',
    'yaml': 'yaml',
    'toml': 'toml',
    'sql': 'sql',
    'dockerfile': 'dockerfile',
    'vue': 'vue',
    'svelte': 'svelte',
    'r': 'r',
    'R': 'r',
    'scala': 'scala',
    'kt': 'kotlin',
    'swift': 'swift',
    'dart': 'dart',
    'lua': 'lua',
    'pl': 'perl',
    'pm': 'perl',
    'tex': 'latex',
    'latex': 'latex',
    'ini': 'ini',
    'cfg': 'ini',
    'conf': 'ini',
    'log': 'log'
  }
  
  return languageMap[extension || ''] || 'plaintext'
}

export interface MonacoCodeEditorProps {
  value: string
  onChange: (value: string) => void
  filename?: string
  language?: string
  readOnly?: boolean
  theme?: 'light' | 'dark' | 'high-contrast'
  height?: string | number
  width?: string | number
  className?: string
  showMinimap?: boolean
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded'
  fontSize?: number
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval'
  folding?: boolean
  autoIndent?: 'none' | 'keep' | 'brackets' | 'advanced' | 'full'
  formatOnPaste?: boolean
  formatOnType?: boolean
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => void
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  value,
  onChange,
  filename = '',
  language,
  readOnly = false,
  theme = 'light',
  height = '400px',
  width = '100%',
  className,
  showMinimap = true,
  wordWrap = 'on',
  fontSize = 14,
  lineNumbers = 'on',
  folding = true,
  autoIndent = 'advanced',
  formatOnPaste = true,
  formatOnType = true,
  onMount
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [isMonacoInitialized, setIsMonacoInitialized] = useState(false)
  
  // 确定使用的语言
  const detectedLanguage = getMonacoLanguage(filename, language)
  
  // 获取Monaco主题名称
  const getThemeName = (theme: string): string => {
    switch (theme) {
      case 'dark':
        return 'custom-dark'
      case 'high-contrast':
        return 'hc-black'
      case 'light':
      default:
        return 'custom-light'
    }
  }

  // 初始化Monaco配置
  useEffect(() => {
    if (!isMonacoInitialized) {
      initializeMonacoEditor()
      setIsMonacoInitialized(true)
    }
  }, [isMonacoInitialized])

  // 编辑器挂载回调
  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor
    setIsEditorReady(true)
    
    // 合并默认配置和用户配置
    const editorOptions = {
      ...defaultEditorOptions,
      readOnly,
      minimap: { enabled: showMinimap },
      wordWrap,
      fontSize,
      lineNumbers,
      folding,
      autoIndent,
      formatOnPaste,
      formatOnType,
    }
    
    // 配置编辑器选项
    editor.updateOptions(editorOptions)

    // 添加常用快捷键
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      // 格式化代码
      editor.getAction('editor.action.formatDocument')?.run()
    })

    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyD, () => {
      // 复制当前行
      editor.getAction('editor.action.copyLinesDownAction')?.run()
    })

    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Slash, () => {
      // 切换行注释
      editor.getAction('editor.action.commentLine')?.run()
    })

    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyA, () => {
      // 切换块注释
      editor.getAction('editor.action.blockComment')?.run()
    })

    // 调用外部回调
    if (onMount) {
      onMount(editor, monacoInstance)
    }
  }

  // 值变化回调
  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      onChange(value)
    }
  }

  // 当主题改变时更新编辑器主题
  useEffect(() => {
    if (isEditorReady && editorRef.current) {
      monaco.editor.setTheme(getThemeName(theme))
    }
  }, [theme, isEditorReady])

  // 当readOnly状态改变时更新编辑器
  useEffect(() => {
    if (isEditorReady && editorRef.current) {
      editorRef.current.updateOptions({ readOnly })
    }
  }, [readOnly, isEditorReady])

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      <Editor
        height={height}
        width={width}
        language={detectedLanguage}
        value={value}
        theme={getThemeName(theme)}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          ...defaultEditorOptions,
          readOnly,
          minimap: { enabled: showMinimap },
          wordWrap,
          fontSize,
          lineNumbers,
          folding,
          autoIndent,
          formatOnPaste,
          formatOnType,
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">加载编辑器中...</div>
          </div>
        }
      />
    </div>
  )
}