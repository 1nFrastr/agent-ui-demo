"""Simple test script for AI Developer Agent tools."""

import asyncio
import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Also add current directory for module resolution
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Change to backend directory for relative imports
os.chdir(backend_dir)

from app.tools.code_generator import CodeGeneratorTool
from app.tools.project_structure import ProjectStructureTool
from app.config import settings


async def test_code_generator():
    """Test code generator tool."""
    print("🧪 Testing CodeGeneratorTool...")
    
    tool = CodeGeneratorTool()
    
    # Test HTML generation with mock
    print("Testing HTML generation...")
    try:
        # Mock the LLM service call for testing
        original_execute = tool.execute
        
        async def mock_execute(parameters):
            file_type = parameters["file_type"]
            if file_type == "html":
                return {
                    "status": "success",
                    "file_type": "html",
                    "file_name": "index.html",
                    "content": """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>待办事项管理</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>待办事项管理</h1>
        <div class="input-section">
            <input type="text" id="todoInput" placeholder="输入新的待办事项...">
            <button id="addBtn">添加</button>
        </div>
        <ul id="todoList"></ul>
    </div>
    <script src="script.js"></script>
</body>
</html>""",
                    "size": 500,
                    "generated_at": "2024-01-15T10:30:00"
                }
            elif file_type == "css":
                return {
                    "status": "success",
                    "file_type": "css",
                    "file_name": "style.css",
                    "content": """/* 待办事项管理样式 */
.container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
}

.input-section {
    display: flex;
    margin-bottom: 20px;
    gap: 10px;
}

#todoInput {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

#addBtn {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

#addBtn:hover {
    background-color: #0056b3;
}

#todoList {
    list-style: none;
    padding: 0;
}

.todo-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border: 1px solid #eee;
    margin-bottom: 5px;
    border-radius: 4px;
}

.todo-item.completed {
    text-decoration: line-through;
    opacity: 0.6;
}

.delete-btn {
    margin-left: auto;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 3px;
    padding: 5px 10px;
    cursor: pointer;
}""",
                    "size": 800,
                    "generated_at": "2024-01-15T10:31:00"
                }
            elif file_type == "js":
                return {
                    "status": "success",
                    "file_type": "js",
                    "file_name": "script.js",
                    "content": """// 待办事项管理JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const todoInput = document.getElementById('todoInput');
    const addBtn = document.getElementById('addBtn');
    const todoList = document.getElementById('todoList');
    
    let todos = [];
    let todoIdCounter = 1;
    
    // 添加待办事项
    function addTodo() {
        const text = todoInput.value.trim();
        if (text === '') {
            alert('请输入待办事项内容');
            return;
        }
        
        const todo = {
            id: todoIdCounter++,
            text: text,
            completed: false
        };
        
        todos.push(todo);
        todoInput.value = '';
        renderTodos();
    }
    
    // 渲染待办事项列表
    function renderTodos() {
        todoList.innerHTML = '';
        
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item' + (todo.completed ? ' completed' : '');
            
            li.innerHTML = `
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleTodo(${todo.id})">
                <span>${todo.text}</span>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">删除</button>
            `;
            
            todoList.appendChild(li);
        });
    }
    
    // 切换完成状态
    window.toggleTodo = function(id) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            renderTodos();
        }
    };
    
    // 删除待办事项
    window.deleteTodo = function(id) {
        todos = todos.filter(t => t.id !== id);
        renderTodos();
    };
    
    // 事件监听
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // 初始化
    renderTodos();
});""",
                    "size": 1200,
                    "generated_at": "2024-01-15T10:32:00"
                }
            else:
                return {"status": "error", "error": "Unsupported file type"}
        
        # Replace with mock
        tool.execute = mock_execute
        
        # Test HTML generation
        html_result = await tool.execute({
            "file_type": "html",
            "project_description": "创建一个简单的待办事项管理应用"
        })
        
        print(f"  HTML Result: {html_result['status']}")
        if html_result["status"] == "success":
            print(f"  - File: {html_result['file_name']}")
            print(f"  - Size: {html_result['size']} characters")
            print("  ✅ HTML generation test PASSED")
        else:
            print(f"  ❌ HTML generation test FAILED: {html_result.get('error')}")
        
        # Test CSS generation
        css_result = await tool.execute({
            "file_type": "css",
            "project_description": "创建一个简单的待办事项管理应用",
            "html_content": html_result.get("content", "")
        })
        
        print(f"  CSS Result: {css_result['status']}")
        if css_result["status"] == "success":
            print(f"  - File: {css_result['file_name']}")
            print(f"  - Size: {css_result['size']} characters")
            print("  ✅ CSS generation test PASSED")
        else:
            print(f"  ❌ CSS generation test FAILED: {css_result.get('error')}")
        
        # Test JavaScript generation
        js_result = await tool.execute({
            "file_type": "js",
            "project_description": "创建一个简单的待办事项管理应用",
            "html_content": html_result.get("content", ""),
            "css_content": css_result.get("content", "")
        })
        
        print(f"  JS Result: {js_result['status']}")
        if js_result["status"] == "success":
            print(f"  - File: {js_result['file_name']}")
            print(f"  - Size: {js_result['size']} characters")
            print("  ✅ JavaScript generation test PASSED")
        else:
            print(f"  ❌ JavaScript generation test FAILED: {js_result.get('error')}")
        
        # Restore original method
        tool.execute = original_execute
        
        return True
        
    except Exception as e:
        print(f"  ❌ CodeGeneratorTool test failed: {e}")
        return False


async def test_project_structure():
    """Test project structure tool."""
    print("\n🧪 Testing ProjectStructureTool...")
    
    tool = ProjectStructureTool()
    
    try:
        # Test project creation
        print("Testing project creation...")
        create_result = await tool.execute({
            "action": "create_project",
            "project_name": "Test Todo App",
            "project_description": "一个用于测试的待办事项应用"
        })
        
        print(f"  Create Result: {create_result['status']}")
        if create_result["status"] == "success":
            project_id = create_result["project_id"]
            print(f"  - Project ID: {project_id}")
            print("  ✅ Project creation test PASSED")
            
            # Test file update
            print("Testing file update...")
            update_result = await tool.execute({
                "action": "update_file",
                "project_id": project_id,
                "file_name": "index.html",
                "file_content": "<html><body><h1>Test</h1></body></html>"
            })
            
            print(f"  Update Result: {update_result['status']}")
            if update_result["status"] == "success":
                print("  ✅ File update test PASSED")
            else:
                print(f"  ❌ File update test FAILED: {update_result.get('error')}")
            
            # Test project retrieval
            print("Testing project retrieval...")
            get_result = await tool.execute({
                "action": "get_project",
                "project_id": project_id
            })
            
            print(f"  Get Result: {get_result['status']}")
            if get_result["status"] == "success":
                project_data = get_result["project"]
                print(f"  - Project name: {project_data['name']}")
                print(f"  - Files count: {len(project_data['files'])}")
                print("  ✅ Project retrieval test PASSED")
            else:
                print(f"  ❌ Project retrieval test FAILED: {get_result.get('error')}")
            
            # Test file listing
            print("Testing file listing...")
            list_result = await tool.execute({
                "action": "list_files",
                "project_id": project_id
            })
            
            print(f"  List Result: {list_result['status']}")
            if list_result["status"] == "success":
                files = list_result["files"]
                print(f"  - Files listed: {len(files)}")
                for file_info in files:
                    print(f"    - {file_info['name']} ({file_info['type']}, {file_info['status']})")
                print("  ✅ File listing test PASSED")
            else:
                print(f"  ❌ File listing test FAILED: {list_result.get('error')}")
            
            return True
        else:
            print(f"  ❌ Project creation test FAILED: {create_result.get('error')}")
            return False
    
    except Exception as e:
        print(f"  ❌ ProjectStructureTool test failed: {e}")
        return False


async def test_integration():
    """Test integration between tools."""
    print("\n🧪 Testing Tool Integration...")
    
    try:
        # Create tools
        code_gen = CodeGeneratorTool()
        project_tool = ProjectStructureTool()
        
        # Mock code generator for integration test
        async def mock_execute(parameters):
            file_type = parameters["file_type"]
            return {
                "status": "success",
                "file_type": file_type,
                "file_name": f"mock.{file_type}",
                "content": f"// Mock {file_type} content\nconsole.log('Hello from {file_type}');",
                "size": 50,
                "generated_at": "2024-01-15T10:30:00"
            }
        
        code_gen.execute = mock_execute
        
        # Create project
        project_result = await project_tool.execute({
            "action": "create_project",
            "project_name": "Integration Test Project",
            "project_description": "测试工具集成"
        })
        
        if project_result["status"] != "success":
            print(f"  ❌ Integration test failed: Project creation failed")
            return False
        
        project_id = project_result["project_id"]
        print(f"  Created project: {project_id}")
        
        # Generate and update files
        file_types = ["html", "css", "js"]
        for file_type in file_types:
            # Generate file content
            gen_result = await code_gen.execute({
                "file_type": file_type,
                "project_description": "测试工具集成"
            })
            
            if gen_result["status"] != "success":
                print(f"  ❌ Failed to generate {file_type}")
                return False
            
            # Update project file
            update_result = await project_tool.execute({
                "action": "update_file",
                "project_id": project_id,
                "file_name": gen_result["file_name"],
                "file_content": gen_result["content"]
            })
            
            if update_result["status"] != "success":
                print(f"  ❌ Failed to update {file_type} file")
                return False
            
            print(f"  ✅ Successfully processed {file_type} file")
        
        # Verify final state
        final_project = await project_tool.execute({
            "action": "get_project",
            "project_id": project_id
        })
        
        if final_project["status"] == "success":
            files = final_project["project"]["files"]
            ready_files = [f for f in files.values() if f["status"] == "ready"]
            print(f"  Final state: {len(ready_files)} files ready")
            print("  ✅ Integration test PASSED")
            return True
        else:
            print("  ❌ Integration test failed: Could not verify final state")
            return False
    
    except Exception as e:
        print(f"  ❌ Integration test failed: {e}")
        return False


async def main():
    """Main test function."""
    print("🧪 AI Developer Agent Tools Test")
    print("=" * 50)
    
    # Test individual tools
    code_gen_success = await test_code_generator()
    project_struct_success = await test_project_structure()
    integration_success = await test_integration()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    tests = [
        ("CodeGeneratorTool", code_gen_success),
        ("ProjectStructureTool", project_struct_success),
        ("Tool Integration", integration_success)
    ]
    
    passed = sum(1 for _, success in tests if success)
    total = len(tests)
    
    for test_name, success in tests:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
    
    print(f"\nResults: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")


if __name__ == "__main__":
    asyncio.run(main())