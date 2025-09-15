#!/usr/bin/env python3
"""
LLM连通性测试脚本

测试内容：
1. OpenAI API连接性
2. LangChain LLM服务初始化
3. 流式响应功能
4. 错误处理机制
5. 完整的分析流程

使用方法：
uv run python scripts/test_llm_connectivity.py
"""

import asyncio
import os
import sys
import time
from typing import List

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.services.llm_service import get_llm_service, LLMService
from app.core.exceptions import AgentExecutionError


class LLMConnectivityTester:
    """LLM连通性测试类"""
    
    def __init__(self):
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
    
    def log_test(self, test_name: str, passed: bool, message: str = "", details: str = ""):
        """记录测试结果"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status} | {test_name}"
        if message:
            result += f" | {message}"
        
        print(result)
        if details:
            print(f"     Details: {details}")
        
        self.test_results.append({
            "name": test_name,
            "passed": passed,
            "message": message,
            "details": details
        })
    
    def test_environment_setup(self):
        """测试环境配置"""
        print("\n🔧 Testing Environment Setup...")
        
        # 测试OpenAI API密钥
        api_key = settings.openai_api_key
        if api_key and api_key != "your_openai_api_key_here" and api_key != "test-key-placeholder":
            self.log_test("OpenAI API Key", True, f"Key configured (length: {len(api_key)})")
        else:
            self.log_test("OpenAI API Key", False, "API key not configured or using placeholder")
        
        # 测试配置参数
        self.log_test("OpenAI Model", True, f"Model: {settings.openai_model}")
        self.log_test("OpenAI Base URL", True, f"URL: {settings.openai_base_url}")
        
        # 测试Tavily配置（可选）
        tavily_key = settings.tavily_api_key
        if tavily_key and tavily_key != "your_tavily_api_key_here":
            self.log_test("Tavily API Key", True, "Tavily key configured")
        else:
            self.log_test("Tavily API Key", False, "Tavily key not configured (optional)")
    
    async def test_llm_service_initialization(self):
        """测试LLM服务初始化"""
        print("\n🚀 Testing LLM Service Initialization...")
        
        try:
            llm_service = get_llm_service()
            self.log_test("LLM Service Creation", True, "Service instance created successfully")
            
            # 检查LLM实例
            if hasattr(llm_service, 'llm') and llm_service.llm:
                self.log_test("LangChain LLM Instance", True, "ChatOpenAI instance created")
            else:
                self.log_test("LangChain LLM Instance", False, "LLM instance not found")
            
            return llm_service
            
        except AgentExecutionError as e:
            if "API key" in str(e):
                self.log_test("LLM Service Creation", False, "API key configuration error", str(e))
            else:
                self.log_test("LLM Service Creation", False, "Agent execution error", str(e))
            return None
        except Exception as e:
            self.log_test("LLM Service Creation", False, "Unexpected error", str(e))
            return None
    
    async def test_simple_llm_call(self, llm_service: LLMService):
        """测试简单的LLM调用"""
        print("\n💬 Testing Simple LLM Call...")
        
        if not llm_service:
            self.log_test("Simple LLM Call", False, "LLM service not available")
            return
        
        try:
            # 创建模拟数据
            mock_search_results = self.create_mock_search_results()
            mock_web_contents = self.create_mock_web_contents()
            
            # 测试流式响应
            start_time = time.time()
            chunks = []
            chunk_count = 0
            
            async for chunk in llm_service.generate_analysis_stream(
                "测试查询：什么是人工智能？", 
                mock_search_results, 
                mock_web_contents, 
                "test_session"
            ):
                chunks.append(chunk)
                chunk_count += 1
                # if chunk_count <= 3:  # 只打印前3个块
                print(f"     Received chunk {chunk_count}: '{chunk[:50]}...'")
                
                # 防止测试时间过长
                if time.time() - start_time > 30:
                    break
            
            duration = time.time() - start_time
            total_content = "".join(chunks)
            
            self.log_test("Streaming Response", True, 
                         f"Received {chunk_count} chunks, {len(total_content)} chars in {duration:.2f}s")
            
            if len(total_content) > 100:
                self.log_test("Content Quality", True, "Generated substantial content")
            else:
                self.log_test("Content Quality", False, "Generated content too short")
                
        except asyncio.TimeoutError:
            self.log_test("Simple LLM Call", False, "Request timeout")
        except Exception as e:
            self.log_test("Simple LLM Call", False, "API call failed", str(e))
    
    async def test_error_handling(self, llm_service: LLMService):
        """测试错误处理机制"""
        print("\n🛡️  Testing Error Handling...")
        
        if not llm_service:
            self.log_test("Error Handling", False, "LLM service not available")
            return
        
        try:
            # 测试空查询
            chunks = []
            async for chunk in llm_service.generate_analysis_stream(
                "", self.create_mock_search_results(), [], "test_session"
            ):
                chunks.append(chunk)
            
            if chunks:
                self.log_test("Empty Query Handling", True, "Handled empty query gracefully")
            else:
                self.log_test("Empty Query Handling", False, "No response for empty query")
                
        except Exception as e:
            self.log_test("Empty Query Handling", True, "Error handled gracefully", str(e))
    
    def create_mock_search_results(self):
        """创建模拟搜索结果"""
        class MockResult:
            def __init__(self, title, url, summary, domain):
                self.title = title
                self.url = url
                self.summary = summary
                self.domain = domain
        
        class MockSearchResults:
            def __init__(self):
                self.results = [
                    MockResult(
                        "什么是人工智能？",
                        "https://example.com/ai-intro",
                        "人工智能(AI)是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。",
                        "example.com"
                    ),
                    MockResult(
                        "人工智能的应用领域",
                        "https://example.com/ai-applications",
                        "AI在医疗、金融、教育、交通等多个领域都有广泛应用。",
                        "example.com"
                    )
                ]
        
        return MockSearchResults()
    
    def create_mock_web_contents(self):
        """创建模拟网页内容"""
        class MockMetadata:
            def __init__(self):
                self.author = "AI研究团队"
                self.publish_date = "2024-01-01"
                self.description = "关于人工智能的介绍性文章"
                self.keywords = ["人工智能", "机器学习", "深度学习"]
        
        class MockContent:
            def __init__(self):
                self.status = "success"
                self.title = "人工智能完全指南"
                self.url = "https://example.com/ai-guide"
                self.summary = "这是一篇关于人工智能基础概念和应用的综合性文章。"
                self.content = """
                人工智能(Artificial Intelligence, AI)是计算机科学的重要分支，
                它试图理解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器。
                
                AI的主要研究领域包括：
                1. 机器学习(Machine Learning)
                2. 深度学习(Deep Learning)  
                3. 自然语言处理(NLP)
                4. 计算机视觉(Computer Vision)
                5. 机器人学(Robotics)
                
                这些技术正在改变我们的生活和工作方式。
                """
                self.metadata = MockMetadata()
                self.images = []
        
        return [MockContent()]
    
    async def run_all_tests(self):
        """运行所有测试"""
        print("🧪 LLM Connectivity Test Suite")
        print("=" * 50)
        
        # 环境配置测试
        self.test_environment_setup()
        
        # LLM服务初始化测试
        llm_service = await self.test_llm_service_initialization()
        
        # 如果有有效的API密钥，进行实际的LLM调用测试
        if llm_service and settings.openai_api_key and settings.openai_api_key not in [
            "your_openai_api_key_here", "test-key-placeholder", "sk-test-placeholder"
        ]:
            await self.test_simple_llm_call(llm_service)
            await self.test_error_handling(llm_service)
        else:
            print("\n⚠️  Skipping LLM API tests - no valid API key configured")
            self.log_test("API Call Tests", False, "Skipped - no valid API key")
        
        # 测试结果汇总
        self.print_summary()
    
    def print_summary(self):
        """打印测试结果汇总"""
        print("\n" + "=" * 50)
        print("📊 Test Results Summary")
        print("=" * 50)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("\n🎉 LLM connectivity looks good!")
        elif success_rate >= 60:
            print("\n⚠️  LLM connectivity has some issues")
        else:
            print("\n❌ LLM connectivity has major issues")
        
        print("\n📝 Configuration Tips:")
        if not settings.openai_api_key or settings.openai_api_key in [
            "your_openai_api_key_here", "test-key-placeholder"
        ]:
            print("- Set OPENAI_API_KEY in your .env file")
        
        print("- Ensure you have sufficient OpenAI API credits")
        print("- Check your internet connection")
        print("- Verify firewall settings allow OpenAI API access")


async def main():
    """主函数"""
    try:
        tester = LLMConnectivityTester()
        await tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Test suite failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())