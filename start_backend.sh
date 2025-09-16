#!/bin/bash

# 启动后端开发服务器脚本
# 使用方法: ./start_backend.sh

echo "🚀 启动Agent UI 后端服务器..."
echo "📍 工作目录: $(pwd)"

# 检查是否在正确的目录
if [ ! -f "backend/pyproject.toml" ]; then
    echo "❌ 错误: 未找到 backend/pyproject.toml 文件"
    echo "请确保在项目根目录执行此脚本"
    exit 1
fi

# 进入后端目录
cd backend

echo "📦 同步依赖..."
uv sync --dev

if [ $? -ne 0 ]; then
    echo "❌ 依赖同步失败"
    exit 1
fi

echo "✅ 依赖同步完成"

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到 .env 文件，将使用默认配置"
    echo "如需自定义配置，请创建 .env 文件"
fi

echo "🌟 启动FastAPI开发服务器..."
echo "📡 服务地址: http://localhost:8000"
echo "📚 API文档: http://localhost:8000/docs"
echo "🔄 交互式文档: http://localhost:8000/redoc"
echo ""
echo "按 Ctrl+C 停止服务器"

# 启动开发服务器
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo "🛑 服务器已停止"