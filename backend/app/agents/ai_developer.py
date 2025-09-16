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
            self.logger.info(f"Starting project generation for: {message}")
            
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
            
            if project_result["status"] != "success":
                raise AgentExecutionError(f"Project creation failed: {project_result.get('error')}")
            
            project_id = project_result["project_id"]
            
            yield self.create_tool_end_event(
                "plan_1",
                "success",
                "项目规划完成",
                {
                    "project_id": project_id,
                    "plan": f"将按照HTML→CSS→JavaScript的顺序生成文件"
                }
            )
            
            # 承上启下说明
            planning_message_id = self.generate_message_id()
            yield self.create_text_chunk_event(
                f"✅ 项目规划完成！我将为您生成一个包含HTML、CSS、JavaScript的简单前端项目。\n\n" +
                f"项目描述：{message}\n\n" +
                f"现在开始按顺序生成文件...\n\n",
                planning_message_id
            )
            
            # Step 2: 按顺序生成文件
            generated_files = {}
            
            for step in self.generation_order:
                file_type = step["file_type"]
                file_name = step["file_name"]
                status = step["status"]
                
                # 更新项目状态
                await self.project_structure.execute({
                    "action": "update_status",
                    "project_id": project_id,
                    "status": status
                })
                
                # 开始生成文件
                file_tool_id = str(uuid.uuid4())
                yield self.create_tool_start_event(
                    f"code_generator",
                    f"正在生成{file_name}文件...",
                    file_tool_id
                )
                
                # 准备生成参数
                generation_params = {
                    "file_type": file_type,
                    "project_description": message
                }
                
                # 添加上下文信息
                if file_type == "css" and "html" in generated_files:
                    generation_params["html_content"] = generated_files["html"]["content"]
                elif file_type == "js":
                    if "html" in generated_files:
                        generation_params["html_content"] = generated_files["html"]["content"]
                    if "css" in generated_files:
                        generation_params["css_content"] = generated_files["css"]["content"]
                
                # 生成文件内容
                file_result = await self.code_generator.execute(generation_params)
                
                if file_result["status"] == "success":
                    file_content = file_result["content"]
                    generated_files[file_type] = file_result
                    
                    # 更新项目文件
                    await self.project_structure.execute({
                        "action": "update_file",
                        "project_id": project_id,
                        "file_name": file_name,
                        "file_content": file_content
                    })
                    
                    # 流式返回文件内容
                    file_message_id = self.generate_message_id()
                    
                    # 分块返回内容以模拟实时生成
                    chunk_size = 100
                    for i in range(0, len(file_content), chunk_size):
                        chunk = file_content[i:i + chunk_size]
                        yield self.create_text_chunk_event(chunk, file_message_id)
                        await asyncio.sleep(0.05)  # 模拟生成延迟
                    
                    yield self.create_tool_end_event(
                        file_tool_id,
                        "success",
                        f"{file_name}文件生成完成",
                        {
                            "file_data": {
                                "name": file_name,
                                "type": file_type,
                                "size": len(file_content),
                                "content": file_content,
                                "status": "ready"
                            },
                            "project_id": project_id
                        }
                    )
                    
                    # 文件间的承上启下说明
                    if file_type == "html":
                        transition_msg = "\n\n🎯 HTML结构已生成完成！接下来生成CSS样式文件，为页面添加美观的外观...\n\n"
                    elif file_type == "css":
                        transition_msg = "\n\n🎨 CSS样式已生成完成！最后生成JavaScript文件，为页面添加交互功能...\n\n"
                    else:
                        transition_msg = "\n\n"
                    
                    if transition_msg.strip():
                        transition_id = self.generate_message_id()
                        yield self.create_text_chunk_event(transition_msg, transition_id)
                    
                else:
                    # 文件生成失败
                    yield self.create_tool_end_event(
                        file_tool_id,
                        "error",
                        f"{file_name}文件生成失败: {file_result.get('error', 'Unknown error')}"
                    )
                    
                    raise AgentExecutionError(f"File generation failed: {file_result.get('error')}")
            
            # Step 3: 项目完成
            await self.project_structure.execute({
                "action": "update_status",
                "project_id": project_id,
                "status": "completed"
            })
            
            # 获取最终项目信息
            final_project = await self.project_structure.execute({
                "action": "get_project",
                "project_id": project_id
            })
            
            # 发送项目完成事件
            completion_message_id = self.generate_message_id()
            completion_message = f"""
🎉 **项目生成完成！**

✅ 已成功生成3个文件：
- **index.html** - 页面结构和内容
- **style.css** - 样式和布局
- **script.js** - 交互逻辑

📁 **项目信息：**
- 项目ID: {project_id}
- 总文件数: 3
- 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

💡 **使用说明：**
您可以在FileBrowser中查看生成的文件，所有文件都已保存在内存中，可以直接在HTML预览中查看效果。

项目已完成，您可以继续编辑文件或提出新的需求！
"""
            
            yield self.create_text_chunk_event(completion_message, completion_message_id)
            
            # 发送项目完成事件
            yield {
                "type": "project_complete",
                "data": {
                    "project_id": project_id,
                    "status": "completed",
                    "files": final_project["project"]["files"],
                    "message": "前端项目生成完成"
                }
            }
            
            yield self.create_message_complete_event(completion_message_id, completion_message)
            
            # 发送流结束事件
            yield {
                "type": "session_end",
                "data": {
                    "sessionId": session_id,
                    "message": "AI开发者代理处理完成"
                }
            }
            
            self.logger.info(f"Project generation completed: {project_id}")
            
        except Exception as e:
            self.logger.error(f"Project generation failed: {e}", exc_info=True)
            
            # 发送错误信息
            error_message_id = self.generate_message_id()
            error_message = f"❌ 项目生成失败: {str(e)}\n\n请检查您的需求描述并重试。"
            yield self.create_text_chunk_event(error_message, error_message_id)
            
            raise AgentExecutionError(
                f"Project generation failed: {str(e)}",
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