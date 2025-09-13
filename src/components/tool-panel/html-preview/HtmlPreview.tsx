import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils'
import type { HtmlPreviewProps } from '../types'
import { RefreshCw, AlertCircle, Monitor } from 'lucide-react'

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({
  htmlContent = '',
  cssContent = '',
  jsContent = '',
  sandboxed = true,
  onRefresh,
  onError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // 生成完整的HTML文档
  const generateCompleteHtml = () => {
    // 始终组合HTML、CSS、JS内容，除非HTML内容已经是完整的文档且没有额外的CSS/JS
    const isCompleteDocument = htmlContent.trim() && 
      (htmlContent.toLowerCase().includes('<!doctype') || htmlContent.toLowerCase().includes('<html'))
    
    // 如果HTML是完整文档且没有额外的CSS/JS内容，直接使用
    if (isCompleteDocument && !cssContent.trim() && !jsContent.trim()) {
      return htmlContent
    }

    // 提取HTML body内容（如果有完整文档结构）
    let bodyContent = htmlContent
    if (isCompleteDocument) {
      const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) {
        bodyContent = bodyMatch[1]
      }
    }

    // 组合HTML、CSS、JS内容
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>预览</title>
    <style>
        /* 基础样式重置 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
        }
        
        /* 用户CSS */
        ${cssContent || ''}
    </style>
</head>
<body>
    ${bodyContent || '<p>没有HTML内容可显示</p>'}
    
    <script>
        // 错误处理
        window.addEventListener('error', function(e) {
            console.error('JavaScript错误:', e.error);
            // 向父窗口发送错误信息
            if (window.parent) {
                window.parent.postMessage({
                    type: 'preview-error',
                    error: e.error ? e.error.toString() : e.message
                }, '*');
            }
        });
        
        // 控制台代理，将日志发送到父窗口
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = function(...args) {
            originalLog.apply(console, args);
            if (window.parent) {
                window.parent.postMessage({
                    type: 'console-log',
                    data: args
                }, '*');
            }
        };
        
        console.error = function(...args) {
            originalError.apply(console, args);
            if (window.parent) {
                window.parent.postMessage({
                    type: 'console-error',
                    data: args
                }, '*');
            }
        };
        
        // 用户JavaScript - 使用setTimeout确保DOM完全准备好
        setTimeout(function() {
            try {
                ${jsContent || ''}
            } catch (error) {
                console.error('用户代码执行错误:', error);
            }
        }, 0);
    </script>
</body>
</html>
    `.trim()
  }

  // 更新iframe内容
  const updatePreview = () => {
    if (!iframeRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      const html = generateCompleteHtml()
      const iframe = iframeRef.current
      
      // 使用srcdoc属性更可靠
      iframe.srcdoc = html
      
      // 监听iframe加载完成
      const handleLoad = () => {
        setLastUpdate(new Date())
        setIsLoading(false)
        iframe.removeEventListener('load', handleLoad)
      }
      
      iframe.addEventListener('load', handleLoad)
      
      // 备用超时处理
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false)
        }
      }, 1000)
      
    } catch (err) {
      console.error('Preview generation error:', err)
      setError(err instanceof Error ? err.message : '预览生成失败')
      onError?.(err instanceof Error ? err : new Error('Preview generation failed'))
      setIsLoading(false)
    }
  }

  // 手动刷新
  const handleRefresh = () => {
    updatePreview()
    onRefresh?.()
  }

  // 监听来自iframe的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'preview-error') {
        setError(event.data.error)
        onError?.(new Error(event.data.error))
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onError])

  // 内容变化时自动更新预览
  useEffect(() => {
    updatePreview()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlContent, cssContent, jsContent])

  // 生成沙箱属性
  const sandboxProps = sandboxed ? {
    sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
  } : {}

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 预览工具栏 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            HTML预览
          </span>
          {sandboxed && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
              沙箱模式
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            最后更新: {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors',
              'bg-blue-500 text-white hover:bg-blue-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isLoading && 'animate-pulse'
            )}
          >
            <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
            刷新
          </button>
        </div>
      </div>

      {/* 错误显示 */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">预览错误</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 预览区域 */}
      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              加载中...
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="HTML预览"
          {...sandboxProps}
        />
      </div>

      {/* 状态栏 */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>HTML: {htmlContent ? `${htmlContent.length} 字符` : '无'}</span>
            <span>CSS: {cssContent ? `${cssContent.length} 字符` : '无'}</span>
            <span>JS: {jsContent ? `${jsContent.length} 字符` : '无'}</span>
          </div>
          {error && (
            <span className="text-red-500">预览异常</span>
          )}
        </div>
      </div>
    </div>
  )
}