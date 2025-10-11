"""Code generator tool for AI Developer Agent."""

import re
import logging
from typing import Any, Dict, List, AsyncGenerator
from datetime import datetime

from app.tools.base import BaseTool
from app.models.tool import ToolParameter
from app.services.llm_service import get_llm_service


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

重要：请直接返回纯HTML代码，不要使用 ```html 等 markdown 标记包裹。
直接从 <!DOCTYPE html> 开始输出，到 </html> 结束。
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

重要：请直接返回纯CSS代码，不要使用 ```css 等 markdown 标记包裹。
直接从第一行CSS选择器开始输出，不要包含任何解释文字。
"""

        self.js_prompt_template = """作为一个专业的JavaScript开发工程师，请为以下项目生成交互逻辑：

HTML结构：
{html_content}

CSS样式：
{css_content}

项目描述：{project_description}

特别注意：
- JavaScript代码将在iframe中作为单独文件执行
- 不需要包裹DOMContentLoaded、window.onload等生命周期事件
- iframe通用层已经处理了生命周期，直接编写响应逻辑即可
- 可以直接使用document.querySelector等DOM操作

要求：
1. 使用现代JavaScript语法（ES6+）
2. 良好的代码组织和注释
3. 完整的错误处理和边界情况考虑
4. 性能优化和内存管理
5. 用户友好的交互体验
6. 表单验证和数据处理
7. 动态内容更新和DOM操作
8. 响应式交互支持
9. 直接编写执行代码，无需事件监听器包装

重要：请直接返回纯JavaScript代码，不要使用 ```javascript、```js 等 markdown 标记包裹。
直接从第一行代码开始输出，不要包含任何解释文字。
"""
    
    @staticmethod
    def clean_markdown_code_blocks(content: str) -> str:
        """Remove markdown code block markers from generated code."""
        content = content.strip()
        # 移除开头的 markdown 代码块标记（如 ```html, ```css, ```javascript, ```js 等）
        content = re.sub(r'^```[\w]*\n?', '', content)
        # 移除结尾的 markdown 代码块标记
        content = re.sub(r'\n?```$', '', content)
        return content.strip()

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

        self.logger.info(
            "Generating %s code for project: %s...",
            file_type,
            project_description[:100]
        )

        try:
            if file_type == "html":
                return await self._generate_html(project_description)
            if file_type == "css":
                return await self._generate_css(project_description, html_content)
            if file_type == "js":
                return await self._generate_js(project_description, html_content, css_content)
            raise ValueError(f"Unsupported file type: {file_type}")

        except Exception as e:
            self.logger.error("Code generation failed: %s", e)
            return {
                "status": "error",
                "error": str(e),
                "message": f"代码生成失败: {str(e)}"
            }
    
    async def _generate_html(self, project_description: str) -> Dict[str, Any]:
        """Generate HTML file."""
        self.logger.info("Generating HTML file...")

        # 构建提示词
        prompt = self.html_prompt_template.format(
            project_description=project_description
        )

        try:
            # 调用LLM生成HTML
            html_content = await self.llm_service.generate_completion(
                prompt=prompt,
                max_tokens=2000,
                temperature=0.7
            )

            # 清理 markdown 标记
            html_content = self.clean_markdown_code_blocks(html_content)

            return {
                "status": "success",
                "file_type": "html",
                "file_name": "index.html",
                "content": html_content,
                "size": len(html_content),
                "generated_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            self.logger.error("HTML generation failed: %s", e)
            raise
    
    async def _generate_css(self, project_description: str, html_content: str) -> Dict[str, Any]:
        """Generate CSS file."""
        self.logger.info("Generating CSS file...")

        if not html_content:
            raise ValueError("HTML content is required for CSS generation")

        # 构建提示词
        prompt = self.css_prompt_template.format(
            project_description=project_description,
            html_content=html_content
        )

        try:
            # 调用LLM生成CSS
            css_content = await self.llm_service.generate_completion(
                prompt=prompt,
                max_tokens=2500,
                temperature=0.7
            )

            # 清理 markdown 标记
            css_content = self.clean_markdown_code_blocks(css_content)

            return {
                "status": "success",
                "file_type": "css",
                "file_name": "style.css",
                "content": css_content,
                "size": len(css_content),
                "generated_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            self.logger.error("CSS generation failed: %s", e)
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

            # 清理 markdown 标记
            js_content = self.clean_markdown_code_blocks(js_content)

            return {
                "status": "success",
                "file_type": "js",
                "file_name": "script.js",
                "content": js_content,
                "size": len(js_content),
                "generated_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            self.logger.error("JavaScript generation failed: %s", e)
            raise

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
            yield result["content"]
        else:
            yield f"// 生成失败: {result.get('error', 'Unknown error')}"
