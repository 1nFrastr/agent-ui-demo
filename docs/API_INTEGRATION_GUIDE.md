# API 流式聊天集成指南

本文档描述了如何使用新的 `useApiStreamingChat` Hook 来真实调用后端流式API接口。

## 概述

已完成了前后端数据结构的统一，并创建了一个新的Hook来处理真实的API调用，支持：

- ✅ 统一的 camelCase 字段命名
- ✅ Server-Sent Events (SSE) 流式数据传输
- ✅ 工具调用状态跟踪
- ✅ 错误处理和重试机制
- ✅ 连接状态管理

## 主要变更

### 1. 后端数据结构统一

#### 统一前的字段命名（snake_case）：
```python
# 旧版本
{
  "search_time": 890,
  "total_results": 1280000,
  "start_time": "2024-01-01T00:00:00",
  "end_time": "2024-01-01T00:00:10"
}
```

#### 统一后的字段命名（camelCase）：
```python
# 新版本
{
  "searchTime": 890,
  "totalResults": 1280000,
  "startTime": "2024-01-01T00:00:00",
  "endTime": "2024-01-01T00:00:10"
}
```

### 2. 新增 useApiStreamingChat Hook

这个新的Hook提供了完整的API集成功能：

```typescript
import { useApiStreamingChat } from '@/hooks/useApiStreamingChat'

const {
  messages,
  isLoading,
  isConnecting,
  connectionError,
  sendMessage,
  stopStreaming,
  clearChat,
  retryLastMessage,
  sessionId
} = useApiStreamingChat({
  baseUrl: 'http://localhost:8000',
  defaultSessionId: 'my-session',
  maxRetries: 3
})
```

## 使用方式

### 基础用法

```typescript
import React from 'react'
import { useApiStreamingChat } from '@/hooks'
import { ChatInterface } from '@/components/chat'

export const MyApiChat: React.FC = () => {
  const { messages, isLoading, sendMessage } = useApiStreamingChat({
    baseUrl: 'http://localhost:8000'
  })

  return (
    <ChatInterface
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
    />
  )
}
```

### 高级用法（含错误处理）

```typescript
import React from 'react'
import { useApiStreamingChat } from '@/hooks'
import { ChatInterface } from '@/components/chat'

export const AdvancedApiChat: React.FC = () => {
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
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    maxRetries: 3
  })

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="chat-container">
      {/* 连接状态指示器 */}
      {isConnecting && <div>连接中...</div>}
      {connectionError && (
        <div className="error-banner">
          连接错误: {connectionError}
          <button onClick={retryLastMessage}>重试</button>
        </div>
      )}
      
      {/* 聊天界面 */}
      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onStop={stopStreaming}
        onClearChat={clearChat}
      />
    </div>
  )
}
```

### 使用示例组件

我们提供了一个完整的示例组件 `ApiChatExample`：

```typescript
import { ApiChatExample } from '@/components/chat'

export const App: React.FC = () => {
  return (
    <div className="h-screen">
      <ApiChatExample
        apiBaseUrl="http://localhost:8000"
        className="h-full"
      />
    </div>
  )
}
```

## 流式事件处理

### 事件类型

新的Hook处理以下流式事件：

1. **tool_call_start** - 工具调用开始
2. **tool_call_end** - 工具调用结束  
3. **text_chunk** - 文本块（流式文本）
4. **message_complete** - 消息完成
5. **error** - 错误事件

### 事件格式示例

```typescript
// 工具调用开始
{
  "type": "tool_call_start",
  "data": {
    "toolName": "web_search",
    "toolId": "uuid-1234",
    "message": "搜索关键信息..."
  }
}

// 文本块
{
  "type": "text_chunk", 
  "data": {
    "content": "根据搜索结果",
    "messageId": "msg-5678"
  }
}

// 工具调用结束
{
  "type": "tool_call_end",
  "data": {
    "toolId": "uuid-1234",
    "status": "success",
    "result": "找到3个相关结果",
    "metadata": {
      "searchData": {
        "query": "大冰 他们最幸福",
        "results": [...],
        "searchTime": 890
      }
    }
  }
}
```

## API 配置选项

### useApiStreamingChat 选项

```typescript
interface UseApiStreamingChatOptions {
  /** API基础URL，默认: http://localhost:8000 */
  baseUrl?: string
  /** 默认session ID，为空时自动生成 */
  defaultSessionId?: string
  /** 是否自动生成消息ID，默认: true */
  autoGenerateId?: boolean
  /** 错误重试次数，默认: 3 */
  maxRetries?: number
}
```

### 返回值

```typescript
interface UseApiStreamingChatReturn {
  /** 消息列表 */
  messages: Message[]
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否连接中 */
  isConnecting: boolean
  /** 连接错误 */
  connectionError: string | null
  /** 发送消息 */
  sendMessage: (content: string, type?: MessageType) => Promise<void>
  /** 停止当前流 */
  stopStreaming: () => void
  /** 清空聊天 */
  clearChat: () => void
  /** 重试最后一条消息 */
  retryLastMessage: () => Promise<void>
  /** 当前会话ID */
  sessionId: string
}
```

## 工具调用支持

Hook 自动处理工具调用的完整生命周期：

### 支持的工具类型
- `web_search` - 网页搜索
- `web_content` - 网页内容读取
- `analysis` - 智能分析
- `code_generation` - 代码生成
- `api_request` - API请求
- `other` - 其他工具

### 工具状态
- `running` - 运行中
- `success` - 成功完成
- `error` - 执行失败

## 错误处理

### 自动重试机制
- 网络连接失败时自动重试
- 可配置重试次数 (maxRetries)
- 递增延迟重试策略

### 错误状态管理
- `connectionError` - 连接错误信息
- `isConnecting` - 连接状态指示
- `retryLastMessage()` - 手动重试方法

## 兼容性

### 与现有组件兼容
- ✅ `ChatInterface` 组件
- ✅ `ChatMessage` 组件  
- ✅ `MessageInput` 组件
- ✅ 所有现有工具面板组件

### 保持现有API
现有的 `useStreamingChat` Hook 仍然可用，新的 `useApiStreamingChat` 是额外的选择。

## 部署注意事项

### 后端服务器配置
确保后端服务器正确配置 CORS：

```python
# FastAPI CORS 配置
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 前端地址
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
```

### 环境变量
推荐使用环境变量配置API地址：

```bash
# .env
REACT_APP_API_URL=http://localhost:8000
```

```typescript
// 使用
const { messages } = useApiStreamingChat({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000'
})
```

## 示例项目结构

```
src/
├── hooks/
│   ├── useStreamingChat.ts      # 原有的模拟Hook
│   ├── useApiStreamingChat.ts   # 新的API Hook
│   └── index.ts
├── components/
│   └── chat/
│       ├── api-chat-example/    # API聊天示例组件
│       ├── chat-interface/      # 聊天界面组件
│       └── ...
└── types/
    └── chat.ts                  # 统一的类型定义
```

这个集成方案确保了前后端数据结构的一致性，提供了完整的流式聊天功能，同时保持了与现有代码的兼容性。