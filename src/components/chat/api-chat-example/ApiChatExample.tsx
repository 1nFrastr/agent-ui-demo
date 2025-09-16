/**
 * API 聊天示例组件
 * 使用 ChatLayout 组件和真实的后端API集成
 */

import React from 'react'
import { useApiStreamingChat } from '../../../hooks/useApiStreamingChat'
import { ChatLayout } from '../chat-layout'

interface ApiChatExampleProps {
  /** API服务器地址 */
  apiBaseUrl?: string
  /** 会话ID */
  sessionId?: string
  /** 自定义样式类名 */
  className?: string
  /** 代理类型 */
  agentType?: string
  /** 输入框占位符 */
  placeholder?: string
}

export const ApiChatExample: React.FC<ApiChatExampleProps> = ({
  apiBaseUrl = 'http://localhost:8000',
  sessionId,
  className,
  agentType = 'deepresearch',
  placeholder = '输入消息开始对话...'
}) => {
  const {
    messages,
    isLoading,
    isConnecting,
    connectionError,
    sendMessage,
    stopStreaming,
    clearChat,
    retryLastMessage
  } = useApiStreamingChat({
    baseUrl: apiBaseUrl,
    defaultSessionId: sessionId,
    maxRetries: 3,
    agentType: agentType
  })

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, 'text')
  }

  const handleStop = () => {
    stopStreaming()
  }

  const handleClearChat = () => {
    clearChat()
  }

  // 如果有连接错误，显示错误信息和重试选项
  if (connectionError) {
    return (
      <div className={`flex flex-col h-full ${className || ''}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-red-600 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              连接失败
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {connectionError}
            </p>
            <div className="space-y-2">
              <button
                onClick={retryLastMessage}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                重试连接
              </button>
              <button
                onClick={handleClearChat}
                className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                重新开始
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              请确保后端服务器运行在 {apiBaseUrl}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 如果正在连接，显示连接状态
  if (isConnecting) {
    return (
      <div className={`flex flex-col h-full ${className || ''}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">
              正在连接到 AI 服务器...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full ${className || ''}`}>
      <ChatLayout
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onStop={handleStop}
        onClearChat={handleClearChat}
        enableMarkdown={true}
        placeholder={placeholder}
        theme="light"
      />
    </div>
  )
}

export default ApiChatExample