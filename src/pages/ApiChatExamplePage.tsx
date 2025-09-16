/**
 * API聊天示例页面
 * 展示使用ChatLayout的完整对话界面
 */

import React from 'react'
import { ApiChatExample } from '../components/chat/api-chat-example'

const ApiChatExamplePage: React.FC = () => {
  return (
    <div className="h-screen bg-background">
      <div className="h-full max-w-6xl mx-auto">
        <div className="flex flex-col h-full">
          {/* 页面标题 */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI 深度研究助手</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  基于 ChatLayout 的完整API对话界面演示
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>API 实时连接</span>
              </div>
            </div>
          </div>

          {/* 聊天界面 */}
          <div className="flex-1 min-h-0">
            <ApiChatExample 
              apiBaseUrl="http://localhost:8000"
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiChatExamplePage