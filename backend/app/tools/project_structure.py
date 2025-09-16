"""Project structure tool for AI Developer Agent."""

import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from enum import Enum

from app.tools.base import BaseTool
from app.models.tool import ToolParameter


logger = logging.getLogger(__name__)


class FileType(str, Enum):
    """Supported file types."""
    HTML = "html"
    CSS = "css"
    JAVASCRIPT = "js"


class FileStatus(str, Enum):
    """File generation status."""
    PENDING = "pending"
    GENERATING = "generating"
    READY = "ready"
    ERROR = "error"


class ProjectStatus(str, Enum):
    """Project generation status."""
    PLANNING = "planning"
    GENERATING_HTML = "generating_html"
    GENERATING_CSS = "generating_css"
    GENERATING_JS = "generating_js"
    COMPLETED = "completed"
    ERROR = "error"


class SimpleFile:
    """Simple file representation for frontend projects."""
    
    def __init__(self, name: str, file_type: FileType, content: str = "", status: FileStatus = FileStatus.PENDING):
        self.name = name
        self.type = file_type
        self.content = content
        self.status = status
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.size = len(content)
    
    def update_content(self, content: str):
        """Update file content."""
        self.content = content
        self.size = len(content)
        self.updated_at = datetime.utcnow()
        self.status = FileStatus.READY
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "name": self.name,
            "type": self.type.value,
            "content": self.content,
            "status": self.status.value,
            "size": self.size,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class SimpleProject:
    """Simple project representation."""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.status = ProjectStatus.PLANNING
        self.files: Dict[str, SimpleFile] = {}
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
        # 初始化标准文件结构
        self._initialize_files()
    
    def _initialize_files(self):
        """Initialize standard project files."""
        self.files["index.html"] = SimpleFile("index.html", FileType.HTML)
        self.files["style.css"] = SimpleFile("style.css", FileType.CSS)
        self.files["script.js"] = SimpleFile("script.js", FileType.JAVASCRIPT)
    
    def update_file(self, file_name: str, content: str):
        """Update file content."""
        if file_name in self.files:
            self.files[file_name].update_content(content)
            self.updated_at = datetime.utcnow()
    
    def get_file(self, file_name: str) -> Optional[SimpleFile]:
        """Get file by name."""
        return self.files.get(file_name)
    
    def get_files_list(self) -> List[Dict[str, Any]]:
        """Get all files as list."""
        return [file.to_dict() for file in self.files.values()]
    
    def update_status(self, status: ProjectStatus):
        """Update project status."""
        self.status = status
        self.updated_at = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "name": self.name,
            "description": self.description,
            "status": self.status.value,
            "files": {name: file.to_dict() for name, file in self.files.items()},
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class ProjectStructureTool(BaseTool):
    """Tool for managing project structure and files."""
    
    def __init__(self):
        super().__init__()
        self.projects: Dict[str, SimpleProject] = {}
    
    @property
    def name(self) -> str:
        return "project_structure"
    
    @property
    def description(self) -> str:
        return "管理简单前端项目的结构和文件状态"
    
    @property
    def parameters(self) -> List[ToolParameter]:
        return [
            ToolParameter(
                name="action",
                type="string",
                description="操作类型：create_project/update_file/get_project/list_files/update_status",
                required=True
            ),
            ToolParameter(
                name="project_id",
                type="string",
                description="项目ID",
                required=False
            ),
            ToolParameter(
                name="project_name",
                type="string",
                description="项目名称（创建项目时需要）",
                required=False
            ),
            ToolParameter(
                name="project_description",
                type="string",
                description="项目描述（创建项目时需要）",
                required=False
            ),
            ToolParameter(
                name="file_name",
                type="string",
                description="文件名（更新文件时需要）",
                required=False
            ),
            ToolParameter(
                name="file_content",
                type="string",
                description="文件内容（更新文件时需要）",
                required=False
            ),
            ToolParameter(
                name="status",
                type="string",
                description="新状态（更新状态时需要）",
                required=False
            )
        ]
    
    @property
    def category(self) -> str:
        return "development"
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute project structure operation."""
        action = parameters["action"]
        
        self.logger.info(f"Executing project structure action: {action}")
        
        try:
            if action == "create_project":
                return await self._create_project(parameters)
            elif action == "update_file":
                return await self._update_file(parameters)
            elif action == "get_project":
                return await self._get_project(parameters)
            elif action == "list_files":
                return await self._list_files(parameters)
            elif action == "update_status":
                return await self._update_status(parameters)
            else:
                raise ValueError(f"Unsupported action: {action}")
                
        except Exception as e:
            self.logger.error(f"Project structure operation failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "message": f"项目结构操作失败: {str(e)}"
            }
    
    async def _create_project(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new project."""
        project_name = parameters.get("project_name")
        project_description = parameters.get("project_description")
        
        if not project_name or not project_description:
            raise ValueError("Project name and description are required")
        
        # 生成项目ID
        project_id = f"proj_{len(self.projects) + 1}_{int(datetime.utcnow().timestamp())}"
        
        # 创建项目
        project = SimpleProject(project_name, project_description)
        self.projects[project_id] = project
        
        self.logger.info(f"Created project: {project_id}")
        
        return {
            "status": "success",
            "project_id": project_id,
            "project": project.to_dict(),
            "message": f"项目创建成功: {project_name}"
        }
    
    async def _update_file(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Update file content."""
        project_id = parameters.get("project_id")
        file_name = parameters.get("file_name")
        file_content = parameters.get("file_content")
        
        if not all([project_id, file_name, file_content]):
            raise ValueError("Project ID, file name, and content are required")
        
        if project_id not in self.projects:
            raise ValueError(f"Project not found: {project_id}")
        
        project = self.projects[project_id]
        
        # 更新文件
        project.update_file(file_name, file_content)
        
        self.logger.info(f"Updated file {file_name} in project {project_id}")
        
        return {
            "status": "success",
            "project_id": project_id,
            "file_name": file_name,
            "file": project.get_file(file_name).to_dict(),
            "message": f"文件更新成功: {file_name}"
        }
    
    async def _get_project(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Get project information."""
        project_id = parameters.get("project_id")
        
        if not project_id:
            raise ValueError("Project ID is required")
        
        if project_id not in self.projects:
            raise ValueError(f"Project not found: {project_id}")
        
        project = self.projects[project_id]
        
        return {
            "status": "success",
            "project_id": project_id,
            "project": project.to_dict()
        }
    
    async def _list_files(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """List project files."""
        project_id = parameters.get("project_id")
        
        if not project_id:
            raise ValueError("Project ID is required")
        
        if project_id not in self.projects:
            raise ValueError(f"Project not found: {project_id}")
        
        project = self.projects[project_id]
        
        return {
            "status": "success",
            "project_id": project_id,
            "files": project.get_files_list()
        }
    
    async def _update_status(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Update project status."""
        project_id = parameters.get("project_id")
        status = parameters.get("status")
        
        if not all([project_id, status]):
            raise ValueError("Project ID and status are required")
        
        if project_id not in self.projects:
            raise ValueError(f"Project not found: {project_id}")
        
        try:
            project_status = ProjectStatus(status)
        except ValueError:
            raise ValueError(f"Invalid status: {status}")
        
        project = self.projects[project_id]
        project.update_status(project_status)
        
        self.logger.info(f"Updated project {project_id} status to {status}")
        
        return {
            "status": "success",
            "project_id": project_id,
            "new_status": status,
            "message": f"项目状态更新为: {status}"
        }
    
    def get_project(self, project_id: str) -> Optional[SimpleProject]:
        """Get project by ID."""
        return self.projects.get(project_id)
    
    def list_projects(self) -> List[Dict[str, Any]]:
        """List all projects."""
        return [{"id": pid, **project.to_dict()} for pid, project in self.projects.items()]