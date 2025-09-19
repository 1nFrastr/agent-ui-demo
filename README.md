# Agent 对话 UI 库

一个基于现代Web技术栈构建的智能对话界面UI库，包含前端UI组件库和后端API服务。

## ✨ 特性

### 前端特性
- 🎨 **现代UI组件**: 基于 React 18 + TypeScript + TailwindCSS + Radix UI
- 💬 **流式对话**: 支持实时流式消息传输和展示
- 🔧 **工具集成**: 智能工具调用状态跟踪和可视化
- 🎯 **类型安全**: 完整的 TypeScript 类型定义
- 📱 **响应式设计**: 适配各种屏幕尺寸
- 🌙 **主题支持**: 支持亮色/暗色主题切换
- 🔤 **Markdown渲染**: 支持代码高亮和数学公式

### 后端特性
- 🚀 **高性能API**: FastAPI + LangChain 架构
- 🌊 **流式响应**: Server-Sent Events (SSE) 实时数据传输
- 🧠 **智能Agent**: DeepResearch Agent 支持多轮对话和工具调用
- 🔍 **智能搜索**: 集成 Tavily AI 网页搜索和内容提取
- 📊 **数据统一**: 前后端 camelCase 字段命名规范
- 🔄 **错误重试**: 自动重试机制和错误处理

## 🚀 快速开始

### 前端开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

### 后端开发

#### Windows (推荐使用 Git Bash)
```bash
# 使用脚本启动
./start_backend.bat

# 或手动启动
cd backend
uv sync --dev
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Linux/macOS
```bash
# 使用脚本启动
./start_backend.sh

# 或手动启动
cd backend
uv sync --dev
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 📦 技术栈

### 前端
- **React 18**: 现代React功能和Hooks
- **TypeScript**: 严格类型检查
- **Vite**: 快速构建和热更新
- **TailwindCSS**: 实用工具类CSS框架
- **Radix UI**: 无样式组件库，优秀的可访问性
- **Lucide React**: 图标库
- **pnpm**: 包管理器

### 后端
- **FastAPI**: 现代Python Web框架
- **LangChain**: AI应用开发框架
- **uv**: 现代Python包管理器
- **Pydantic**: 数据验证和序列化
- **Tavily AI**: 专业AI搜索API
- **OpenAI API**: GPT模型集成

## 🎯 核心功能

### 1. 基础对话组件
- `ChatInterface`: 完整的聊天界面组件
- `ChatMessage`: 消息显示组件，支持多种消息类型
- `MessageInput`: 消息输入组件
- `ChatLayout`: 聊天布局容器

### 2. 流式聊天Hook

#### useMockStreamingChat (模拟)
```typescript
import { useMockStreamingChat } from '@/hooks'

const { messages, isLoading, sendMessage } = useMockStreamingChat()
```

#### useApiStreamingChat (真实API)
```typescript
import { useApiStreamingChat } from '@/hooks'

const {
  messages,
  isLoading,
  isConnecting,
  connectionError,
  sendMessage,
  stopStreaming,
  retryLastMessage
} = useApiStreamingChat({
  baseUrl: 'http://localhost:8000',
  maxRetries: 3
})
```

### 3. 工具系统
- **Web搜索工具**: 智能网页搜索
- **内容提取工具**: 网页内容解析和分析
- **AI分析工具**: LLM驱动的智能分析
- **工具状态跟踪**: 运行状态、结果展示、错误处理

### 4. AI编程工具面板
- **文件浏览器**: 项目文件管理
- **代码编辑器**: 语法高亮代码编辑
- **HTML预览**: 实时预览HTML效果
- **多标签支持**: 文件、预览切换

## 📖 使用示例

### 基础聊天界面
```typescript
import { ChatInterface } from '@/components/chat'
import { useApiStreamingChat } from '@/hooks'

export const MyChatApp = () => {
  const { messages, isLoading, sendMessage } = useApiStreamingChat({
    baseUrl: 'http://localhost:8000'
  })

  return (
    <ChatInterface
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
      placeholder="请输入您的问题..."
    />
  )
}
```

### 完整示例组件
```typescript
import { ApiChatExample } from '@/components/chat'

export const App = () => {
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

## 🔌 API 接口

### 流式聊天接口
```http
POST /api/chat/stream
Content-Type: application/json

{
  "message": "用户查询内容",
  "sessionId": "session-id",
  "agentType": "deepresearch"
}
```

### 流式事件格式
```typescript
// 工具调用开始
{ "type": "tool_call_start", "data": {...} }

// 工具调用结束
{ "type": "tool_call_end", "data": {...} }

// 文本流式响应
{ "type": "text_chunk", "data": {...} }

// 消息完成
{ "type": "message_complete", "data": {...} }
```

## 📁 项目结构

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
