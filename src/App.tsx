import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChatMessage } from '@/components/chat/chat-message'
import { ChatLayout } from '@/components/chat/chat-layout'
import { useStreamingChat } from '@/hooks'
import { Send, MessageCircle, Sparkles } from 'lucide-react'
import type { Message } from '@/types/chat'

function App() {
  const [count, setCount] = useState(0)
  const [showChat, setShowChat] = useState(false)
  
  // 使用流式聊天Hook
  const {
    messages,
    isLoading,
    sendMessage,
    stopStreaming,
    clearChat,
  } = useStreamingChat()

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

  if (showChat) {
    return (
      <div className="h-screen">
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
    <div className="min-h-screen bg-background text-foreground p-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="space-y-4 p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold">基础按钮</h3>
            <div className="space-y-3">
              <Button onClick={() => setCount(count + 1)}>
                计数: {count}
              </Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
            </div>
          </div>

          <div className="space-y-4 p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold">带图标按钮</h3>
            <div className="space-y-3">
              <Button>
                <Send className="mr-2 h-4 w-4" />
                发送消息
              </Button>
              <Button variant="ghost" onClick={() => setShowChat(true)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                开始对话
              </Button>
              <Button variant="destructive">
                <Sparkles className="mr-2 h-4 w-4" />
                清空对话
              </Button>
            </div>
          </div>

          <div className="space-y-4 p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold">按钮状态</h3>
            <div className="space-y-3">
              <Button loading>加载中...</Button>
              <Button disabled>禁用状态</Button>
              <Button size="sm">小尺寸</Button>
              <Button size="lg">大尺寸</Button>
            </div>
          </div>
        </div>

        {/* 流式对话演示入口 */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">🚀 对话功能演示</h2>
            <p className="text-muted-foreground">体验实时AI对话，支持Markdown渲染和代码高亮</p>
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => setShowChat(true)}
              className="px-8 py-4 text-lg"
            >
              <MessageCircle className="mr-3 h-6 w-6" />
              基础对话演示
            </Button>
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
