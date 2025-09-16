"""Test script for AI Developer Agent."""

import asyncio
import json
import sys
import os
from pathlib import Path

# Add the backend app to the Python path
backend_path = Path(__file__).parent.parent / "app"
sys.path.insert(0, str(backend_path))

from app.agents.ai_developer import AIDeveloperAgent
from app.config import settings
from app.core.logging import setup_logging


class AIDevAgentTester:
    """Test AI Developer Agent functionality."""
    
    def __init__(self):
        self.agent = AIDeveloperAgent()
        self.test_results = []
    
    async def run_all_tests(self):
        """Run all test scenarios."""
        print("🧪 Starting AI Developer Agent Tests...")
        print("=" * 60)
        
        # Test scenarios
        test_scenarios = [
            {
                "name": "Simple Todo App",
                "description": "创建一个简单的待办事项管理应用，支持添加、删除和标记完成状态",
                "expected_files": ["index.html", "style.css", "script.js"]
            },
            {
                "name": "Calculator App",
                "description": "制作一个简单的计算器，支持基本的加减乘除运算",
                "expected_files": ["index.html", "style.css", "script.js"]
            },
            {
                "name": "Weather Display",
                "description": "创建一个天气展示页面，显示当前天气信息和一周预报（使用模拟数据）",
                "expected_files": ["index.html", "style.css", "script.js"]
            }
        ]
        
        # Run each test scenario
        for i, scenario in enumerate(test_scenarios, 1):
            print(f"\n📋 Test {i}: {scenario['name']}")
            print("-" * 40)
            
            try:
                result = await self.test_project_generation(scenario)
                self.test_results.append(result)
                
                if result["success"]:
                    print(f"✅ Test {i} PASSED")
                else:
                    print(f"❌ Test {i} FAILED: {result['error']}")
                    
            except Exception as e:
                print(f"❌ Test {i} FAILED with exception: {e}")
                self.test_results.append({
                    "scenario": scenario["name"],
                    "success": False,
                    "error": str(e)
                })
        
        # Print summary
        self.print_test_summary()
    
    async def test_project_generation(self, scenario):
        """Test project generation for a scenario."""
        session_id = f"test_session_{scenario['name'].lower().replace(' ', '_')}"
        
        print(f"🚀 Generating project: {scenario['description']}")
        
        try:
            # Track generated events
            events = []
            files_generated = {}
            project_id = None
            
            # Process the agent response
            async for event in self.agent.process_message(
                scenario["description"], 
                session_id
            ):
                events.append(event)
                
                # Extract key information
                if event.get("type") == "tool_call_end":
                    tool_data = event.get("data", {})
                    if "file_data" in tool_data:
                        file_info = tool_data["file_data"]
                        files_generated[file_info["name"]] = file_info
                        print(f"  📄 Generated: {file_info['name']} ({file_info['size']} chars)")
                
                elif event.get("type") == "project_complete":
                    project_id = event.get("data", {}).get("project_id")
                    print(f"  🎯 Project completed: {project_id}")
            
            # Validate results
            validation_result = self.validate_project_results(
                scenario, files_generated, project_id, events
            )
            
            return {
                "scenario": scenario["name"],
                "success": validation_result["valid"],
                "project_id": project_id,
                "files_generated": list(files_generated.keys()),
                "events_count": len(events),
                "validation": validation_result,
                "error": validation_result.get("error")
            }
            
        except Exception as e:
            return {
                "scenario": scenario["name"],
                "success": False,
                "error": str(e)
            }
    
    def validate_project_results(self, scenario, files_generated, project_id, events):
        """Validate project generation results."""
        validation = {
            "valid": True,
            "issues": []
        }
        
        # Check if project ID was generated
        if not project_id:
            validation["valid"] = False
            validation["issues"].append("No project ID generated")
        
        # Check if all expected files were generated
        expected_files = scenario["expected_files"]
        for expected_file in expected_files:
            if expected_file not in files_generated:
                validation["valid"] = False
                validation["issues"].append(f"Missing file: {expected_file}")
            else:
                file_info = files_generated[expected_file]
                # Check file content is not empty
                if not file_info.get("content") or len(file_info["content"]) < 50:
                    validation["valid"] = False
                    validation["issues"].append(f"File too small or empty: {expected_file}")
        
        # Check event flow
        tool_events = [e for e in events if e.get("type") in ["tool_call_start", "tool_call_end"]]
        if len(tool_events) < 6:  # At least 3 start + 3 end events
            validation["valid"] = False
            validation["issues"].append(f"Insufficient tool events: {len(tool_events)}")
        
        # Check for project completion event
        completion_events = [e for e in events if e.get("type") == "project_complete"]
        if not completion_events:
            validation["valid"] = False
            validation["issues"].append("No project completion event")
        
        if not validation["valid"]:
            validation["error"] = "; ".join(validation["issues"])
        
        return validation
    
    def print_test_summary(self):
        """Print test results summary."""
        print("\n" + "=" * 60)
        print("🧪 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['scenario']}: {result.get('error', 'Unknown error')}")
        
        print("\n📊 Detailed Results:")
        for result in self.test_results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"  {status} | {result['scenario']}")
            if result["success"] and "files_generated" in result:
                print(f"    Files: {', '.join(result['files_generated'])}")
            if "validation" in result and result["validation"].get("issues"):
                for issue in result["validation"]["issues"]:
                    print(f"    Issue: {issue}")
    
    async def test_individual_tools(self):
        """Test individual tools separately."""
        print("\n🔧 Testing Individual Tools...")
        print("-" * 40)
        
        # Test CodeGeneratorTool
        print("Testing CodeGeneratorTool...")
        try:
            code_gen = self.agent.code_generator
            
            # Test HTML generation
            html_result = await code_gen.execute({
                "file_type": "html",
                "project_description": "一个简单的登录页面"
            })
            
            if html_result["status"] == "success":
                print("  ✅ HTML generation: PASS")
            else:
                print(f"  ❌ HTML generation: FAIL - {html_result.get('error')}")
            
            # Test CSS generation (with HTML context)
            if html_result["status"] == "success":
                css_result = await code_gen.execute({
                    "file_type": "css",
                    "project_description": "一个简单的登录页面",
                    "html_content": html_result["content"]
                })
                
                if css_result["status"] == "success":
                    print("  ✅ CSS generation: PASS")
                else:
                    print(f"  ❌ CSS generation: FAIL - {css_result.get('error')}")
        
        except Exception as e:
            print(f"  ❌ CodeGeneratorTool test failed: {e}")
        
        # Test ProjectStructureTool
        print("\nTesting ProjectStructureTool...")
        try:
            project_tool = self.agent.project_structure
            
            # Test project creation
            create_result = await project_tool.execute({
                "action": "create_project",
                "project_name": "Test Project",
                "project_description": "Test project for validation"
            })
            
            if create_result["status"] == "success":
                print("  ✅ Project creation: PASS")
                
                project_id = create_result["project_id"]
                
                # Test file update
                update_result = await project_tool.execute({
                    "action": "update_file",
                    "project_id": project_id,
                    "file_name": "index.html",
                    "file_content": "<html><body>Test</body></html>"
                })
                
                if update_result["status"] == "success":
                    print("  ✅ File update: PASS")
                else:
                    print(f"  ❌ File update: FAIL - {update_result.get('error')}")
            else:
                print(f"  ❌ Project creation: FAIL - {create_result.get('error')}")
        
        except Exception as e:
            print(f"  ❌ ProjectStructureTool test failed: {e}")


async def main():
    """Main test function."""
    # Setup logging
    setup_logging()
    
    # Verify configuration
    if not settings.openai_api_key:
        print("❌ Error: OPENAI_API_KEY not configured")
        print("Please set your OpenAI API key in the environment variables")
        return
    
    print("🔑 OpenAI API Key configured")
    print(f"🤖 Using model: {settings.openai_model}")
    
    # Create tester and run tests
    tester = AIDevAgentTester()
    
    # Test individual tools first
    await tester.test_individual_tools()
    
    # Run full integration tests
    await tester.run_all_tests()
    
    print("\n🏁 All tests completed!")


if __name__ == "__main__":
    asyncio.run(main())