import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChatMessage } from '@/components/chat/chat-message'
import { Send, MessageCircle, Sparkles } from 'lucide-react'
import type { Message } from '@/types/chat'

function App() {
  const [count, setCount] = useState(0)

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
      type: 'code',
      content: {
        text: '这是一个简单的React组件示例：',
        code: {
          content: `import React from 'react'

export const MyComponent = () => {
  return (
    <div className="p-4">
      <h1>Hello World!</h1>
    </div>
  )
}`,
          language: 'typescript'
        }
      },
      timestamp: new Date(),
      status: 'delivered',
    }
  ]

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
              <Button variant="ghost">
                <MessageCircle className="mr-2 h-4 w-4" />
                新对话
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

        {/* 对话消息演示 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">对话消息演示</h2>
          <div className="border border-border rounded-lg bg-card max-w-3xl mx-auto">
            {sampleMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onAction={(messageId, action) => {
                  console.log(`消息 ${messageId} 执行操作: ${action}`)
                }}
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground">
            🚀 Agent对话UI库开发中... 
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            使用 Git Bash 和 Linux 风格路径开发
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
