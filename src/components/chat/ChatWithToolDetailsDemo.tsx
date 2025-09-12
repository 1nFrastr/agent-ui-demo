import * as React from 'react'
import { ChatLayout } from '@/components/chat/chat-layout'
import type { Message, ToolCallDetails } from '@/types/chat'

// 示例工具调用数据
const createSampleToolCall = (
  id: string,
  name: string,
  type: ToolCallDetails['type'],
  status: ToolCallDetails['status']
): ToolCallDetails => ({
  id,
  name,
  type,
  status,
  startTime: new Date(Date.now() - 5000),
  endTime: status !== 'running' ? new Date() : undefined,
  duration: status !== 'running' ? 1234 : undefined,
  description: `${name} 工具调用示例`,
  parameters: {
    command: 'npm install @radix-ui/react-dialog',
    filePath: 'src/components/ui/dialog.tsx',
    language: 'typescript',
    workingDirectory: '/project/root'
  },
  result: status === 'success' ? `Successfully executed ${name}` : undefined,
  error: status === 'error' ? `Failed to execute ${name}: Permission denied` : undefined
})

// 示例消息数据
const sampleMessages: Message[] = [
  {
    id: '1',
    sender: 'user',
    type: 'text',
    content: { text: '请帮我安装 Radix UI 的 Dialog 组件' },
    timestamp: new Date(Date.now() - 10000),
    status: 'sent'
  },
  {
    id: '2',
    sender: 'assistant',
    type: 'text',
    content: { text: '好的，我来帮您安装 Radix UI 的 Dialog 组件。首先我需要运行安装命令。' },
    timestamp: new Date(Date.now() - 8000),
    status: 'sent'
  },
  {
    id: '3',
    sender: 'assistant',
    type: 'tool_call',
    content: { 
      tool_call: createSampleToolCall('tool_1', 'run_terminal_command', 'terminal_command', 'success')
    },
    timestamp: new Date(Date.now() - 6000),
    status: 'sent'
  },
  {
    id: '4',
    sender: 'assistant',
    type: 'text',
    content: { text: '安装完成！现在我来为您创建一个基础的 Dialog 组件文件。' },
    timestamp: new Date(Date.now() - 4000),
    status: 'sent'
  },
  {
    id: '5',
    sender: 'assistant',
    type: 'tool_call',
    content: { 
      tool_call: createSampleToolCall('tool_2', 'create_file', 'file_operation', 'success')
    },
    timestamp: new Date(Date.now() - 2000),
    status: 'sent'
  },
  {
    id: '6',
    sender: 'assistant',
    type: 'tool_call',
    content: { 
      tool_call: createSampleToolCall('tool_3', 'generate_typescript_component', 'code_generation', 'running')
    },
    timestamp: new Date(),
    status: 'sent'
  },
]

export const ChatWithToolDetailsDemo: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>(sampleMessages)

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'text',
      content: { text: message },
      timestamp: new Date(),
      status: 'sent'
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleClearChat = () => {
    setMessages([])
  }

  return (
    <div className="h-screen w-full">
      <ChatLayout
        messages={messages}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        placeholder="输入消息..."
        enableMarkdown={true}
      />
    </div>
  )
}