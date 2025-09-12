import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ToolDetailsPanel } from '@/components/chat/tool-details-panel'
import type { Message, ToolCallDetails } from '@/types/chat'

// 示例消息和工具详情
const sampleMessages: Message[] = [
  {
    id: '1',
    sender: 'user',
    type: 'text',
    content: { text: '请帮我运行一个命令' },
    timestamp: new Date(Date.now() - 5000),
    status: 'sent'
  },
  {
    id: '2',
    sender: 'assistant',
    type: 'text',
    content: { text: '好的，我来为您执行命令。' },
    timestamp: new Date(Date.now() - 3000),
    status: 'sent'
  },
  {
    id: '3',
    sender: 'assistant',
    type: 'tool_call',
    content: { 
      tool_call: {
        id: 'tool_1',
        name: 'run_command',
        type: 'terminal_command',
        status: 'success',
        parameters: {
          command: 'npm --version',
          workingDirectory: '/project/root'
        },
        result: '$ npm --version\n10.2.4\n\nCommand executed successfully.\nExit code: 0\nDuration: 1.234s',
        startTime: new Date(Date.now() - 2000),
        endTime: new Date(Date.now() - 1000),
        duration: 1234
      }
    },
    timestamp: new Date(Date.now() - 1000),
    status: 'sent'
  }
]

const sampleToolDetails: ToolCallDetails = {
  id: 'tool_1',
  name: 'run_command',
  type: 'terminal_command',
  status: 'success',
  parameters: {
    command: 'npm --version',
    workingDirectory: '/project/root'
  },
  result: '$ npm --version\n10.2.4\n\nCommand executed successfully.\nExit code: 0\nDuration: 1.234s',
  startTime: new Date(Date.now() - 2000),
  endTime: new Date(Date.now() - 1000),
  duration: 1234,
  description: '执行终端命令'
}

// 简单的布局演示组件
export const LayoutDemo: React.FC = () => {
  const [showPanel, setShowPanel] = React.useState(false)

  const handleToolDetailsClick = (_toolDetails: ToolCallDetails) => {
    setShowPanel(true)
  }

  const handleClosePanel = () => {
    setShowPanel(false)
  }

  return (
    <div className="h-screen w-full bg-background">
      {/* 头部控制 */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">工具详情布局演示</h2>
          <Button 
            onClick={() => setShowPanel(!showPanel)}
            variant={showPanel ? "destructive" : "default"}
          >
            {showPanel ? "关闭详情面板" : "打开详情面板"}
          </Button>
        </div>
      </div>

      {/* 主要布局区域 */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* 对话区域 - 次要区域 */}
        <div className={`
          transition-all duration-300 border-r border-border
          ${showPanel 
            ? 'w-1/3 min-w-0' // 展开时：1/3宽度，左侧
            : 'w-full max-w-4xl mx-auto' // 收起时：固定宽度居中
          }
        `}>
          <ChatInterface
            messages={sampleMessages}
            onToolDetailsClick={handleToolDetailsClick}
            placeholder="输入消息..."
            enableMarkdown={true}
            className="h-full"
          />
        </div>

        {/* 工具详情面板 - 主要区域 */}
        {showPanel && (
          <div className="w-2/3 flex-shrink-0 border-l border-border">
            <ToolDetailsPanel
              toolDetails={sampleToolDetails}
              isOpen={showPanel}
              onClose={handleClosePanel}
            />
          </div>
        )}
      </div>
    </div>
  )
}