"""AI Developer Agent implementation."""

import asyncio
import logging
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional
from datetime import datetime

from langsmith import traceable

from app.agents.base import BaseAgent
from app.tools.code_generator import CodeGeneratorTool
from app.services.llm_service import get_llm_service
from app.config import settings
from app.core.exceptions import AgentExecutionError


logger = logging.getLogger(__name__)


class AIDeveloperAgent(BaseAgent):
    """AI Developer Agent for generating simple frontend projects."""
    
    def __init__(self):
        super().__init__("AIDeveloperAgent")
        self.code_generator = CodeGeneratorTool()
        self.llm_service = get_llm_service()
    
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
            self.logger.info(f"Starting AI-powered project generation for: {message}")
            
            # 流式返回项目开始说明
            planning_message_id = self.generate_message_id()
            yield self.create_text_chunk_event(
                f"🚀 开始使用AI生成完整的前端项目...\n\n" +
                f"需求描述：{message}\n\n" +
                f"正在调用LLM生成HTML页面结构...\n\n",
                planning_message_id
            )
            
            # Step 1: 生成HTML文件
            html_tool_id = str(uuid.uuid4())
            yield self.create_tool_start_event(
                "code_generator",
                "使用AI生成HTML文件...",
                html_tool_id
            )
            
            # 使用LLM生成HTML内容
            html_result = await self.code_generator.execute({
                "file_type": "html",
                "project_description": message
            })
            
            if html_result["status"] != "success":
                raise AgentExecutionError(f"HTML generation failed: {html_result.get('error')}")
            
            generated_html = html_result["content"]
            
            # 返回HTML文件工具调用完成事件
            yield self.create_tool_end_event(
                html_tool_id,
                "success",
                "HTML文件生成完成",
                {
                    "file": {
                        "id": "1",
                        "name": "index.html",
                        "path": "index.html",
                        "type": "file",
                        "content": generated_html,
                        "modified": datetime.now().isoformat(),
                        "extension": "html",
                        "isReadOnly": False
                    },
                    "generatedBy": "LLM"
                }
            )
            
            # 流式显示生成进度
            progress_message_id = self.generate_message_id()
            yield self.create_text_chunk_event(
                f"✅ HTML结构生成完成！\n\n正在调用LLM生成CSS样式...\n\n",
                progress_message_id
            )
            
            # Step 2: 生成CSS文件
            css_tool_id = str(uuid.uuid4())
            yield self.create_tool_start_event(
                "code_generator",
                "使用AI生成CSS样式文件...",
                css_tool_id
            )
            
            # 使用LLM生成CSS内容
            css_result = await self.code_generator.execute({
                "file_type": "css",
                "project_description": message,
                "html_content": generated_html
            })
            
            if css_result["status"] != "success":
                self.logger.warning(f"CSS generation failed: {css_result.get('error')}, using basic CSS")
                generated_css = "/* CSS generation failed, using basic styles */\nbody { font-family: Arial, sans-serif; }"
            else:
                generated_css = css_result["content"]
            
            # 返回CSS文件工具调用完成事件
            yield self.create_tool_end_event(
                css_tool_id,
                "success",
                "CSS文件生成完成",
                {
                    "file": {
                        "id": "2",
                        "name": "style.css",
                        "path": "style.css",
                        "type": "file",
                        "content": generated_css,
                        "modified": datetime.now().isoformat(),
                        "extension": "css",
                        "isReadOnly": False
                    },
                    "generatedBy": "LLM"
                }
            )
            
            # 流式显示生成进度
            progress_message_id2 = self.generate_message_id()
            yield self.create_text_chunk_event(
                f"✅ CSS样式生成完成！\n\n正在调用LLM生成JavaScript交互...\n\n",
                progress_message_id2
            )
            
            # Step 3: 生成JavaScript文件
            js_tool_id = str(uuid.uuid4())
            yield self.create_tool_start_event(
                "code_generator",
                "使用AI生成JavaScript交互文件...",
                js_tool_id
            )
            
            # 使用LLM生成JavaScript内容
            js_result = await self.code_generator.execute({
                "file_type": "js",
                "project_description": message,
                "html_content": generated_html,
                "css_content": generated_css
            })
            
            if js_result["status"] != "success":
                self.logger.warning(f"JavaScript generation failed: {js_result.get('error')}, using basic JS")
                generated_js = "// JavaScript generation failed\nconsole.log('Page loaded');"
            else:
                generated_js = js_result["content"]
            
            # 返回JavaScript文件工具调用完成事件
            yield self.create_tool_end_event(
                js_tool_id,
                "success",
                "JavaScript文件生成完成",
                {
                    "file": {
                        "id": "3",
                        "name": "script.js",
                        "path": "script.js",
                        "type": "file",
                        "content": generated_js,
                        "modified": datetime.now().isoformat(),
                        "extension": "js",
                        "isReadOnly": False
                    },
                    "generatedBy": "LLM"
                }
            )
            
            # 流式显示所有文件生成完成
            files_complete_message_id = self.generate_message_id()
            yield self.create_text_chunk_event(
                f"✅ 所有文件生成完成！\n\n正在创建文件系统预览...\n\n",
                files_complete_message_id
            )
            
            # Step 4: 最后返回file_browser工具调用以支持预览
            file_browser_tool_id = str(uuid.uuid4())
            yield self.create_tool_start_event(
                "file_browser",
                "创建文件系统预览...",
                file_browser_tool_id
            )
            
            # 创建符合前端期望的文件系统数据结构
            file_system_data = {
                "files": [
                    {
                        "id": "1",
                        "name": "index.html",
                        "path": "index.html", 
                        "type": "file",
                        "content": generated_html,
                        "modified": datetime.now().isoformat(),
                        "extension": "html",
                        "isReadOnly": False
                    },
                    {
                        "id": "2",
                        "name": "style.css",
                        "path": "style.css",
                        "type": "file", 
                        "content": generated_css,
                        "modified": datetime.now().isoformat(),
                        "extension": "css",
                        "isReadOnly": False
                    },
                    {
                        "id": "3",
                        "name": "script.js",
                        "path": "script.js",
                        "type": "file",
                        "content": generated_js,
                        "modified": datetime.now().isoformat(),
                        "extension": "js",
                        "isReadOnly": False
                    }
                ],
                "selectedPath": "index.html"
            }
            
            # 返回file_browser工具调用完成事件
            yield self.create_tool_end_event(
                file_browser_tool_id,
                "success",
                "AI生成的前端项目完成",
                {
                    "fileSystemData": file_system_data,
                    "activeFile": "index.html",
                    "projectInfo": {
                        "name": "AI Generated Project",
                        "description": message,
                        "createdAt": datetime.now().isoformat(),
                        "totalFiles": 3,
                        "generatedBy": "LLM"
                    }
                }
            )
            
            # 发送完成消息
            completion_message_id = self.generate_message_id()
            completion_message = f"""
✅ **AI驱动的前端项目生成完成！**

📄 已使用LLM生成3个文件：
- **index.html** - AI生成的页面结构和内容
- **style.css** - AI生成的样式和布局
- **script.js** - AI生成的交互逻辑

🧠 **AI生成特性：**
- 基于您的需求智能分析
- 专业的前端代码结构
- 现代化的设计和交互
- 完整的项目文件组织

💡 **使用说明：**
右侧的文件浏览器已自动打开，您可以：
1. 查看AI生成的完整代码
2. 在预览器中实时查看页面效果
3. 编辑代码并实时预览更改
4. 根据需要进一步优化代码

项目已准备就绪，享受AI的创造力！🎉
"""
            
            yield self.create_text_chunk_event(completion_message, completion_message_id)
            yield self.create_message_complete_event(completion_message_id, completion_message)
            
            self.logger.info(f"AI-powered project generation completed for: {message}")
            
        except Exception as e:
            self.logger.error(f"AI project generation failed: {e}", exc_info=True)
            
            # 发送错误信息
            error_message_id = self.generate_message_id()
            error_message = f"❌ AI项目生成失败: {str(e)}\n\n请检查您的需求描述并重试。"
            yield self.create_text_chunk_event(error_message, error_message_id)
            
            raise AgentExecutionError(
                f"AI project generation failed: {str(e)}",
                agent_name=self.name,
                details={"description": message, "error": str(e)}
            )