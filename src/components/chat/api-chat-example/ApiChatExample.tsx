/**
 * API 聊天示例组件
 * 展示如何使用 useApiStreamingChat Hook
 */

import React from 'react'
import { useApiStreamingChat } from '../../../hooks/useApiStreamingChat'
import { ChatInterface } from '../chat-interface'

interface ApiChatExampleProps {
  /** API服务器地址 */
  apiBaseUrl?: string
  /** 会话ID */
  sessionId?: string
  /** 自定义样式类名 */
  className?: string
}

export const ApiChatExample: React.FC<ApiChatExampleProps> = ({
  apiBaseUrl = 'http://localhost:8000',
  sessionId,
  className
}) => {
  const {
    messages,
    isLoading,
    isConnecting,
    connectionError,
    sendMessage,
    stopStreaming,
    clearChat,
    retryLastMessage,
    sessionId: currentSessionId
  } = useApiStreamingChat({
    baseUrl: apiBaseUrl,
    defaultSessionId: sessionId,
    maxRetries: 3
  })

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, 'text')
  }

  const handleRetry = async () => {
    await retryLastMessage()
  }

  const handleClearChat = () => {
    clearChat()
  }

  return (
    <div className={className}>
      <div className="flex flex-col h-full">
        {/* 聊天标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              AI 深度研究助手
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              会话: {currentSessionId.slice(-8)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 连接状态指示器 */}
            {isConnecting && (
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm">连接中...</span>
              </div>
            )}
            
            {connectionError && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-sm">连接错误</span>
              </div>
            )}
            
            {!isConnecting && !connectionError && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">已连接</span>
              </div>
            )}
            
            {/* 操作按钮 */}
            <button
              onClick={handleClearChat}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              清空对话
            </button>
            
            {connectionError && (
              <button
                onClick={handleRetry}
                className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                重试
              </button>
            )}
            
            {isLoading && (
              <button
                onClick={stopStreaming}
                className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                停止
              </button>
            )}
          </div>
        </div>

        {/* 错误提示 */}
        {connectionError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded-full flex-shrink-0"></div>
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>连接错误:</strong> {connectionError}
              </p>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              请检查网络连接或服务器状态，然后点击重试按钮。
            </p>
          </div>
        )}

        {/* 聊天界面 */}
        <div className="flex-1 min-h-0">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStop={stopStreaming}
            onClearChat={handleClearChat}
            enableMarkdown={true}
            placeholder="请输入您想要研究的问题..."
          />
        </div>
      </div>
    </div>
  )
}

export default ApiChatExample