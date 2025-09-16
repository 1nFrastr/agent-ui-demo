"""Code generator tool for AI Developer Agent."""

import asyncio
import logging
from typing import Any, Dict, List, Optional, AsyncGenerator
from datetime import datetime

from app.tools.base import BaseTool
from app.models.tool import ToolParameter
from app.services.llm_service import get_llm_service
from app.config import settings


logger = logging.getLogger(__name__)


class CodeGeneratorTool(BaseTool):
    """Tool for generating code files (HTML, CSS, JavaScript)."""
    
    def __init__(self):
        super().__init__()
        self.llm_service = get_llm_service()
        
        # 提示词模板
        self.html_prompt_template = """作为一个专业的前端开发工程师，请根据以下项目需求生成HTML文件：

项目描述：{project_description}

要求：
1. 使用语义化HTML5标签
2. 包含完整的DOCTYPE和meta标签
3. 结构清晰，便于CSS样式化
4. 预留JavaScript交互元素的ID和class
5. 确保无障碍访问性
6. 包含必要的表单或交互元素
7. 使用合适的标题层级

请生成完整的HTML代码，文件名为index.html：
"""

        self.css_prompt_template = """作为一个专业的CSS开发工程师，请为以下HTML结构生成对应的CSS样式：

HTML结构：
{html_content}

项目描述：{project_description}

要求：
1. 现代化的视觉设计
2. 响应式布局（支持移动端和桌面端）
3. 良好的用户体验和视觉层次
4. 使用CSS3特性（如flexbox、grid、transitions等）
5. 包含悬停效果和过渡动画
6. 确保浏览器兼容性
7. 使用合理的颜色方案和字体搭配
8. 添加适当的阴影和圆角效果

请生成完整的CSS代码，文件名为style.css：
"""

        self.js_prompt_template = """作为一个专业的JavaScript开发工程师，请为以下项目生成交互逻辑：

HTML结构：
{html_content}

CSS样式：
{css_content}

项目描述：{project_description}

要求：
1. 使用现代JavaScript语法（ES6+）
2. 良好的代码组织和注释
3. 完整的错误处理和边界情况考虑
4. 性能优化和内存管理
5. 用户友好的交互体验
6. 表单验证和数据处理
7. 动态内容更新和DOM操作
8. 响应式交互支持

请生成完整的JavaScript代码，文件名为script.js：
"""
    
    @property
    def name(self) -> str:
        return "code_generator"
    
    @property
    def description(self) -> str:
        return "根据项目需求生成HTML、CSS、JavaScript代码文件"
    
    @property
    def parameters(self) -> List[ToolParameter]:
        return [
            ToolParameter(
                name="file_type",
                type="string",
                description="要生成的文件类型：html/css/js",
                required=True
            ),
            ToolParameter(
                name="project_description",
                type="string",
                description="项目描述和需求",
                required=True
            ),
            ToolParameter(
                name="html_content",
                type="string",
                description="HTML内容（生成CSS/JS时需要）",
                required=False
            ),
            ToolParameter(
                name="css_content",
                type="string",
                description="CSS内容（生成JS时需要）",
                required=False
            ),
            ToolParameter(
                name="style_preferences",
                type="object",
                description="样式偏好设置（主题、颜色等）",
                required=False
            )
        ]
    
    @property
    def category(self) -> str:
        return "development"
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute code generation."""
        file_type = parameters["file_type"].lower()
        project_description = parameters["project_description"]
        html_content = parameters.get("html_content", "")
        css_content = parameters.get("css_content", "")
        style_preferences = parameters.get("style_preferences", {})
        
        self.logger.info(f"Generating {file_type} code for project: {project_description[:100]}...")
        
        try:
            if file_type == "html":
                return await self._generate_html(project_description, style_preferences)
            elif file_type == "css":
                return await self._generate_css(project_description, html_content, style_preferences)
            elif file_type == "js":
                return await self._generate_js(project_description, html_content, css_content)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
                
        except Exception as e:
            self.logger.error(f"Code generation failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "message": f"代码生成失败: {str(e)}"
            }
    
    async def _generate_html(self, project_description: str, style_preferences: Dict) -> Dict[str, Any]:
        """Generate HTML file."""
        self.logger.info("Generating HTML file...")
        
        # 构建提示词
        prompt = self.html_prompt_template.format(
            project_description=project_description
        )
        
        # 添加样式偏好
        if style_preferences:
            prompt += f"\n样式偏好：{style_preferences}\n"
        
        try:
            # 调用LLM生成HTML
            html_content = await self.llm_service.generate_completion(
                prompt=prompt,
                max_tokens=2000,
                temperature=0.7
            )
            
            # 清理和验证生成的HTML
            cleaned_html = self._clean_generated_code(html_content, "html")
            
            return {
                "status": "success",
                "file_type": "html",
                "file_name": "index.html",
                "content": cleaned_html,
                "size": len(cleaned_html),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"HTML generation failed: {e}")
            raise
    
    async def _generate_css(self, project_description: str, html_content: str, style_preferences: Dict) -> Dict[str, Any]:
        """Generate CSS file."""
        self.logger.info("Generating CSS file...")
        
        if not html_content:
            raise ValueError("HTML content is required for CSS generation")
        
        # 构建提示词
        prompt = self.css_prompt_template.format(
            project_description=project_description,
            html_content=html_content
        )
        
        # 添加样式偏好
        if style_preferences:
            prompt += f"\n样式偏好：{style_preferences}\n"
        
        try:
            # 调用LLM生成CSS
            css_content = await self.llm_service.generate_completion(
                prompt=prompt,
                max_tokens=2500,
                temperature=0.7
            )
            
            # 清理和验证生成的CSS
            cleaned_css = self._clean_generated_code(css_content, "css")
            
            return {
                "status": "success",
                "file_type": "css",
                "file_name": "style.css",
                "content": cleaned_css,
                "size": len(cleaned_css),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"CSS generation failed: {e}")
            raise
    
    async def _generate_js(self, project_description: str, html_content: str, css_content: str) -> Dict[str, Any]:
        """Generate JavaScript file."""
        self.logger.info("Generating JavaScript file...")
        
        if not html_content:
            raise ValueError("HTML content is required for JavaScript generation")
        
        # 构建提示词
        prompt = self.js_prompt_template.format(
            project_description=project_description,
            html_content=html_content,
            css_content=css_content or "/* CSS样式将在style.css中定义 */"
        )
        
        try:
            # 调用LLM生成JavaScript
            js_content = await self.llm_service.generate_completion(
                prompt=prompt,
                max_tokens=2500,
                temperature=0.7
            )
            
            # 清理和验证生成的JavaScript
            cleaned_js = self._clean_generated_code(js_content, "js")
            
            return {
                "status": "success",
                "file_type": "js", 
                "file_name": "script.js",
                "content": cleaned_js,
                "size": len(cleaned_js),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"JavaScript generation failed: {e}")
            raise
    
    def _clean_generated_code(self, content: str, file_type: str) -> str:
        """Clean and validate generated code."""
        if not content:
            return ""
        
        # 移除可能的markdown代码块标记
        if content.startswith("```"):
            lines = content.split('\n')
            # 找到第一个非```行作为开始
            start_idx = 0
            for i, line in enumerate(lines):
                if not line.startswith("```") and line.strip():
                    start_idx = i
                    break
            
            # 找到最后一个非```行作为结束
            end_idx = len(lines) - 1
            for i in range(len(lines) - 1, -1, -1):
                if not lines[i].startswith("```") and lines[i].strip():
                    end_idx = i
                    break
            
            content = '\n'.join(lines[start_idx:end_idx + 1])
        
        # 移除首尾空白
        content = content.strip()
        
        # 特定类型的清理
        if file_type == "html":
            # 确保HTML有基本结构
            if not content.startswith("<!DOCTYPE"):
                self.logger.warning("Generated HTML missing DOCTYPE, adding basic structure")
                content = f"<!DOCTYPE html>\n{content}"
        
        elif file_type == "css":
            # 移除可能的CSS注释中的提示词残留
            content = content.replace("CSS代码：", "").replace("css", "").strip()
            if content.startswith("```"):
                content = content[3:].strip()
            if content.endswith("```"):
                content = content[:-3].strip()
        
        elif file_type == "js":
            # 移除可能的JS注释中的提示词残留
            content = content.replace("JavaScript代码：", "").replace("javascript", "").strip()
            if content.startswith("```"):
                content = content[3:].strip()
            if content.endswith("```"):
                content = content[:-3].strip()
        
        return content
    
    async def generate_file_stream(self, file_type: str, project_description: str, 
                                 context: Dict[str, Any] = None) -> AsyncGenerator[str, None]:
        """Generate file with streaming response."""
        context = context or {}
        
        # 准备参数
        parameters = {
            "file_type": file_type,
            "project_description": project_description,
            **context
        }
        
        # 调用执行方法
        result = await self.execute(parameters)
        
        if result["status"] == "success":
            content = result["content"]
            
            # 模拟流式返回（将内容分块）
            chunk_size = 50  # 每次返回50个字符
            for i in range(0, len(content), chunk_size):
                chunk = content[i:i + chunk_size]
                yield chunk
                await asyncio.sleep(0.1)  # 模拟生成延迟
        else:
            yield f"// 生成失败: {result.get('error', 'Unknown error')}"