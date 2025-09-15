# Agent UI Backend

基于 FastAPI + LangChain 构建的智能对话后端系统，支持多轮对话、工具调用协调和实时流式响应。

## 依赖管理

本项目使用 **uv** 作为现代 Python 包管理器，配合 `pyproject.toml` 进行依赖管理：

- `pyproject.toml`: 定义项目依赖和开发依赖
- `uv.lock`: 锁定确切的依赖版本（类似 package-lock.json）

### 常用命令

```bash
# 安装所有依赖
uv sync

# 安装包含开发依赖
uv sync --dev

# 添加新依赖
uv add package-name

# 添加开发依赖
uv add --dev package-name

# 更新依赖
uv lock --upgrade
```

## 快速开始

### 环境要求

- Python 3.11+
- uv (推荐) 或 pip

### 安装依赖

#### 使用 uv (推荐)

```bash
# 安装 uv
# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
# Linux/macOS
curl -LsSf https://astral.sh/uv/install.sh | sh

# 创建虚拟环境
uv venv --python 3.11

# 安装依赖（会自动从 pyproject.toml 读取）
uv sync

# 激活虚拟环境
source .venv/Scripts/activate  # Windows (Git Bash)
# source .venv/bin/activate    # Linux/macOS
```

#### 使用 pip

```bash
# 创建虚拟环境
python -m venv .venv
source .venv/Scripts/activate  # Windows (Git Bash)
# source .venv/bin/activate    # Linux/macOS

# 安装依赖（推荐升级到 uv 进行依赖管理）
pip install -e .
```

### 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入必要的 API 密钥
# 必需配置：
# - OPENAI_API_KEY: OpenAI API 密钥
# - TAVILY_API_KEY: Tavily AI 搜索 API 密钥
```

### 启动开发服务器

```bash
# 使用 uv
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 或激活虚拟环境后直接运行
source .venv/Scripts/activate  # Windows (Git Bash)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 或使用启动脚本
uv run python scripts/start_dev.py
```

### 访问 API

- API 文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health
- WebSocket 测试: http://localhost:8000/test-ws

## 项目结构

```
backend/
├── app/                    # 主应用目录
│   ├── main.py            # FastAPI 应用入口
│   ├── config.py          # 配置管理
│   ├── api/               # API 路由
│   ├── agents/            # LangChain Agent 实现
│   ├── tools/             # 工具实现
│   ├── models/            # 数据模型
│   ├── services/          # 业务逻辑服务
│   ├── core/              # 核心功能
│   └── utils/             # 工具函数
├── tests/                 # 测试代码
├── scripts/               # 脚本文件
└── docs/                  # 文档
```

## 核心功能

### 1. DeepResearch Agent

实现智能研究功能，支持：
- 网页搜索
- 内容提取和分析
- 多轮对话协调
- 结果综合总结

### 2. 工具系统

- **WebSearchTool**: 基于 Tavily AI 的智能网页搜索工具
- **WebContentTool**: 网页内容提取和分析工具
- 可扩展的工具注册系统

### 3. EventStream API

- 实时流式响应
- 工具调用状态推送
- 前端兼容的数据格式

## API 接口

### 流式对话接口

```http
POST /api/chat/stream
Content-Type: application/json

{
  "message": "帮我搜索大冰《他们最幸福》的相关信息",
  "session_id": "optional-session-id",
  "config": {
    "stream": true,
    "tools_enabled": true
  }
}
```

### 响应格式

```javascript
// 工具调用开始
data: {"type": "tool_call_start", "data": {...}}

// 工具调用完成
data: {"type": "tool_call_end", "data": {...}}

// 文本流式响应
data: {"type": "text_chunk", "data": {...}}

// 完整消息
data: {"type": "message_complete", "data": {...}}
```

## 开发

### 运行测试

```bash
# 运行所有测试
uv run pytest

# 运行特定测试
uv run pytest tests/test_agents/

# 测试覆盖率
uv run pytest --cov=app

# 或安装开发依赖后运行
uv sync --dev
source .venv/Scripts/activate
pytest
```

### 代码格式化

```bash
# 格式化代码
uv run black .
uv run isort .

# 类型检查
uv run mypy app/

# 代码质量检查
uv run flake8 app/
```

### 工具测试

```bash
# 测试工具功能
uv run python scripts/test_tools.py

# 测试搜索功能
uv run python -c "
from app.tools.web_search import WebSearchTool
import asyncio

async def test():
    tool = WebSearchTool()
    result = await tool.search('大冰 他们最幸福')
    print(result)

asyncio.run(test())
"
```

## 部署

### 环境配置

- **开发环境**: 启用调试模式，详细日志
- **测试环境**: 模拟工具调用，快速响应
- **生产环境**: 优化性能，安全配置

## 配置说明

### 必需配置

- `OPENAI_API_KEY`: OpenAI API 密钥
- `TAVILY_API_KEY`: Tavily AI 搜索 API 密钥

### 可选配置

- `DEBUG`: 调试模式 (默认: True)
- `LOG_LEVEL`: 日志级别 (默认: INFO)
- `CORS_ORIGINS`: 允许的跨域来源
- `RATE_LIMIT_REQUESTS`: 请求频率限制

