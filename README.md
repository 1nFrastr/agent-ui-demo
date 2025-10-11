# Agentic 全栈开发模板示例

一个基于 React + FastAPI 构建的 Agentic 全栈应用示例

## 特性

### 前端特性
- **现代UI组件**: 基于 React 18 + TypeScript + TailwindCSS + Radix UI
- **流式对话**: 支持实时流式消息传输和展示
- **工具集成**: 智能工具调用状态跟踪和可视化
- **类型安全**: 完整的 TypeScript 类型定义
- **主题支持**: 支持亮色/暗色主题切换

### 后端特性
- **高性能API**: FastAPI + LangChain 架构
- **流式响应**: Server-Sent Events (SSE) 实时数据传输
- **智能Agent**: DeepResearch Agent 支持多轮对话和工具调用
- **智能搜索**: 集成 Tavily AI 网页搜索和内容提取
- **数据统一**: 前后端 camelCase 字段命名规范
- **错误重试**: 自动重试机制和错误处理

## 快速开始

### 环境配置

在启动后端服务之前，需要配置环境变量。复制 `backend/.env.example` 文件为 `backend/.env`，并配置以下必需参数：

**必需配置：**
- `OPENAI_API_KEY`: OpenAI API 密钥（必需）
- `TAVILY_API_KEY`: Tavily AI 搜索 API 密钥（必需）

**可选配置：**
- `OPENAI_BASE_URL`: OpenAI API 基础URL（默认：https://api.openai.com/v1）
- `OPENAI_MODEL`: 使用的模型（默认：gpt-4）
- `LANGSMITH_API_KEY`: LangSmith 追踪和监控密钥（可选）
- 其他配置项请参考 `backend/.env.example`

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

#### Windows
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

## 技术栈

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

## 核心功能

### 1. 基础对话组件
- `ChatInterface`: 完整的聊天界面组件
- `ChatMessage`: 消息显示组件，支持多种消息类型
- `MessageInput`: 消息输入组件
- `ChatLayout`: 聊天布局容器

### 2. 流式聊天Hook
- `useMockStreamingChat`: 模拟流式对话（用于开发测试）
- `useApiStreamingChat`: 真实API流式对话，支持连接管理、错误处理和重试

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

## API 接口

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
- `tool_call_start`: 工具调用开始
- `tool_call_end`: 工具调用结束
- `text_chunk`: 文本流式响应
- `message_complete`: 消息完成

## 许可证

MIT License
