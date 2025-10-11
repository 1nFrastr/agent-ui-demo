import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChatMessage } from '@/components/chat/chat-message'
import { ChatLayout } from '@/components/chat/chat-layout'
import { ApiChatExample } from '@/components/chat/api-chat-example'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useMockStreamingChat } from '@/hooks'
import { MessageCircle, Sparkles, Code2, Zap, Wrench } from 'lucide-react'
import type { Message } from '@/types/chat'

// 真正的AICoderPanel组件
import { AICoderPanel } from './components/chat/ai-coder-panel/AICoderPanel'
import { sampleFileSystem } from './components/chat/ai-coder-panel/sampleData'

// AICoderPanel演示组件
const ToolPanelDemo = () => {
  return (
    <div className="h-screen p-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">AI编程工具面板演示</h1>
        <p className="text-gray-600">文件浏览器 + HTML预览功能</p>
      </div>
      <div className="h-5/6">
        <AICoderPanel 
          files={sampleFileSystem}
          defaultTab="files"
          readOnly={false}
          onFileSelect={(file) => {
            console.log('选择文件:', file.name)
          }}
          onFileEdit={(file, content) => {
            console.log('编辑文件:', file.name, '内容长度:', content.length)
          }}
        />
      </div>
    </div>
  )
}

function App() {
  const [showChat, setShowChat] = useState(false)
  const [showApiChat, setShowApiChat] = useState(false)
  const [showToolPanel, setShowToolPanel] = useState(false)
  const [showAIDeveloper, setShowAIDeveloper] = useState(false)
  
  // 使用流式聊天Hook
  const {
    messages,
    isLoading,
    sendMessage,
    stopStreaming,
    clearChat,
  } = useMockStreamingChat()

  // 示例消息数据
  const sampleMessages: Message[] = [
    {
      id: '1',
      sender: 'assistant',
      type: 'text',
      content: { text: '你好！我是AI助手，有什么可以帮助你的吗？' },
      timestamp: new Date(Date.now() - 60000),
      status: 'delivered',
    },
    {
      id: '2',
      sender: 'user',
      type: 'text',
      content: { text: '请帮我创建一个React组件' },
      timestamp: new Date(Date.now() - 30000),
      status: 'delivered',
      editable: true,
      deletable: true,
    },
    {
      id: '3',
      sender: 'assistant',
      type: 'text',
      content: {
        text: `## 代码示例
这是一个React Hook的示例：

\`\`\`typescript
import { useState, useEffect } from 'react'

export const useCounter = (initialValue: number = 0) => {
  const [count, setCount] = useState(initialValue)
  
  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)
  const reset = () => setCount(initialValue)
  
  return { count, increment, decrement, reset }
}
\`\`\`
`},
      timestamp: new Date(),
      status: 'delivered',
    }
  ]

  if (showApiChat) {
    return (
      <div className="h-screen relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <ApiChatExample 
          apiBaseUrl="http://localhost:8000"
          className="h-full"
        />
      </div>
    )
  }

  if (showAIDeveloper) {
    return (
      <div className="h-screen relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <ApiChatExample 
          apiBaseUrl="http://localhost:8000"
          className="h-full"
          agentType="ai_developer"
          placeholder="描述您想要生成的前端页面..."
        />
      </div>
    )
  }

  if (showToolPanel) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <ToolPanelDemo />
      </div>
    )
  }

  if (showChat) {
    return (
      <div className="h-screen relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <ChatLayout
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onStop={stopStreaming}
          onClearChat={clearChat}
          placeholder="发送消息开始对话..."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Agent对话UI库</h1>
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <p className="text-xl text-muted-foreground">
            基于 React + Vite + TailwindCSS + Radix UI 构建
          </p>
        </header>

        {/* 流式对话演示入口 */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* 纯前端MOCK卡片 */}
            <div className="border border-border rounded-lg bg-card p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">纯前端演示</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  无需后端，体验前端流式对话和工具面板功能
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  size="lg" 
                  onClick={() => setShowChat(true)}
                  className="w-full py-3"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  基础对话演示
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => setShowToolPanel(true)}
                  className="w-full py-3"
                >
                  <Code2 className="mr-2 h-5 w-5" />
                  编程工具面板
                </Button>
              </div>
            </div>

            {/* 真实后端交互卡片 */}
            <div className="border border-border rounded-lg bg-card p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">AI智能代理</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  连接后端API，体验真实的AI代理功能
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  size="lg" 
                  onClick={() => setShowApiChat(true)}
                  className="w-full py-3"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  深度研究Agent
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => setShowAIDeveloper(true)}
                  className="w-full py-3"
                >
                  <Wrench className="mr-2 h-5 w-5" />
                  AI开发者Agent
                </Button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  💡 需要先启动 FastAPI 后端服务
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 对话消息演示 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">静态消息演示</h2>
          <div className="border border-border rounded-lg bg-card max-w-3xl mx-auto">
            {sampleMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                enableMarkdown={true}
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground">
            🚀 Agent对话UI库 - 支持流式对话、Markdown渲染、代码高亮
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            使用 React + Vite + TailwindCSS + Radix UI 构建
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
