"""AI Developer Agent implementation."""

import asyncio
import logging
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional
from datetime import datetime

from langsmith import traceable

from app.agents.base import BaseAgent
from app.tools.code_generator import CodeGeneratorTool
from app.tools.project_structure import ProjectStructureTool, ProjectStatus, FileStatus
from app.services.llm_service import get_llm_service
from app.config import settings
from app.core.exceptions import AgentExecutionError


logger = logging.getLogger(__name__)


class AIDeveloperAgent(BaseAgent):
    """AI Developer Agent for generating simple frontend projects."""
    
    def __init__(self):
        super().__init__("AIDeveloperAgent")
        self.code_generator = CodeGeneratorTool()
        self.project_structure = ProjectStructureTool()
        self.llm_service = get_llm_service()
        
        # 文件生成顺序
        self.generation_order = [
            {"file_type": "html", "file_name": "index.html", "status": "generating_html"},
            {"file_type": "css", "file_name": "style.css", "status": "generating_css"},
            {"file_type": "js", "file_name": "script.js", "status": "generating_js"}
        ]
    
    async def get_capabilities(self) -> List[str]:
        """Get agent capabilities."""
        return [
            "frontend_project_generation",
            "html_css_js_creation",
            "project_structure_management",
            "code_analysis",
            "real_time_file_updates"
        ]
    
    @traceable(name="ai_developer_agent")
    async def process_message(
        self, 
        message: str, 
        session_id: str,
        **kwargs
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Process project generation request with streaming response."""
        
        try:
            self.session_id = session_id
            self.logger.info(f"Starting simple project generation for: {message}")
            
            # 简化版本：直接生成HTML文件并返回file_browser工具调用
            await asyncio.sleep(0.3)
            
            # 生成简单的HTML内容
            simple_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成的页面</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        .container {{
            text-align: center;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }}
        h1 {{
            font-size: 2.5em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }}
        p {{
            font-size: 1.2em;
            line-height: 1.6;
            margin-bottom: 30px;
        }}
        .feature {{
            background: rgba(255,255,255,0.2);
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.3);
        }}
        button {{
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1.1em;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255,107,107,0.4);
        }}
        button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255,107,107,0.6);
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 AI开发者Demo</h1>
        <p>欢迎使用AI开发者生成的页面！</p>
        <div class="feature">
            <h3>✨ 用户需求</h3>
            <p>{message}</p>
        </div>
        <div class="feature">
            <h3>🎯 生成时间</h3>
            <p>{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        <button onclick="alert('Hello from AI Developer!')">点击测试</button>
    </div>
    
    <script>
        console.log('AI Developer Demo页面已加载');
        console.log('用户需求:', '{message}');
        
        // 简单的交互效果
        document.addEventListener('DOMContentLoaded', function() {{
            const container = document.querySelector('.container');
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {{
                container.style.transition = 'all 0.6s ease';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }}, 100);
        }});
    </script>
</body>
</html>"""

            # 流式返回简单说明
            planning_message_id = self.generate_message_id()
            yield self.create_text_chunk_event(
                f"🚀 开始生成简单的HTML页面...\n\n" +
                f"需求描述：{message}\n\n",
                planning_message_id
            )
            
            await asyncio.sleep(0.5)
            
            # 模拟file_browser工具调用 - 这是前端期望的格式
            file_browser_tool_id = str(uuid.uuid4())
            yield self.create_tool_start_event(
                "file_browser",
                "创建文件系统并生成HTML文件...",
                file_browser_tool_id
            )
            
            await asyncio.sleep(0.5)
            
            # 创建符合前端期望的文件系统数据结构
            file_system_data = {
                "files": [
                    {
                        "id": "1",
                        "name": "index.html",
                        "path": "index.html", 
                        "type": "file",
                        "content": simple_html,
                        "modified": datetime.now().isoformat(),
                        "extension": "html",
                        "isReadOnly": False
                    }
                ],
                "selectedPath": "index.html"
            }
            
            # 返回file_browser工具调用完成事件
            yield self.create_tool_end_event(
                file_browser_tool_id,
                "success",
                "HTML文件生成完成",
                {
                    "fileSystemData": file_system_data,
                    "activeFile": "index.html",
                    "projectInfo": {
                        "name": "AI Generated Demo",
                        "description": message,
                        "createdAt": datetime.now().isoformat()
                    }
                }
            )
            
            # 发送完成消息
            completion_message_id = self.generate_message_id()
            completion_message = f"""
✅ **HTML页面生成完成！**

📄 已生成文件：
- **index.html** - 包含响应式设计和交互效果的完整页面

🎨 **页面特性：**
- 渐变背景和毛玻璃效果
- 响应式布局设计
- 简单的JavaScript交互
- 现代化的CSS样式

💡 **使用说明：**
右侧的文件浏览器已自动打开，您可以：
1. 查看生成的HTML代码
2. 在预览器中实时查看页面效果
3. 编辑代码并实时预览更改

项目已准备就绪！🎉
"""
            
            yield self.create_text_chunk_event(completion_message, completion_message_id)
            yield self.create_message_complete_event(completion_message_id, completion_message)
            
            self.logger.info(f"Simple project generation completed for: {message}")
            
            # 注释掉的原始复杂逻辑
            """
            # Step 1: 项目规划阶段
            yield self.create_tool_start_event(
                "project_planner",
                "分析项目需求，制定生成计划...",
                "plan_1"
            )
            
            await asyncio.sleep(0.5)
            
            # 创建项目
            project_result = await self.project_structure.execute({
                "action": "create_project",
                "project_name": f"Generated Project {datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "project_description": message
            })
            
            # ... 更多复杂逻辑被注释掉
            """
            
        except Exception as e:
            self.logger.error(f"Simple project generation failed: {e}", exc_info=True)
            
            # 发送错误信息
            error_message_id = self.generate_message_id()
            error_message = f"❌ 页面生成失败: {str(e)}\n\n请检查您的需求描述并重试。"
            yield self.create_text_chunk_event(error_message, error_message_id)
            
            raise AgentExecutionError(
                f"Simple project generation failed: {str(e)}",
                agent_name=self.name,
                details={"description": message, "error": str(e)}
            )
    
    def get_project(self, project_id: str):
        """Get project by ID."""
        return self.project_structure.get_project(project_id)
    
    def list_projects(self):
        """List all projects."""
        return self.project_structure.list_projects()
    
    async def regenerate_file(self, project_id: str, file_type: str, 
                            additional_requirements: str = "") -> Dict[str, Any]:
        """Regenerate a specific file in the project."""
        project = self.project_structure.get_project(project_id)
        if not project:
            raise ValueError(f"Project not found: {project_id}")
        
        # 获取项目描述和已有文件
        project_description = project.description
        if additional_requirements:
            project_description += f"\n\n额外要求: {additional_requirements}"
        
        # 准备生成参数
        generation_params = {
            "file_type": file_type,
            "project_description": project_description
        }
        
        # 添加上下文
        if file_type == "css":
            html_file = project.get_file("index.html")
            if html_file and html_file.content:
                generation_params["html_content"] = html_file.content
        elif file_type == "js":
            html_file = project.get_file("index.html")
            css_file = project.get_file("style.css")
            if html_file and html_file.content:
                generation_params["html_content"] = html_file.content
            if css_file and css_file.content:
                generation_params["css_content"] = css_file.content
        
        # 生成新内容
        result = await self.code_generator.execute(generation_params)
        
        if result["status"] == "success":
            # 更新文件
            file_name = result["file_name"]
            await self.project_structure.execute({
                "action": "update_file",
                "project_id": project_id,
                "file_name": file_name,
                "file_content": result["content"]
            })
        
        return result