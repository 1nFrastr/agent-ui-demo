#!/usr/bin/env python3
"""Test Tavily search functionality."""

import asyncio
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.tools.web_search import WebSearchTool
from app.agents.deepresearch import DeepResearchAgent
from app.core.logging import logger

async def test_tavily_search():
    """Test Tavily search tool specifically."""
    print("🔍 Testing Tavily Search Tool...")
    
    tool = WebSearchTool()
    session_id = "test_tavily_001"
    
    try:
        execution = await tool.run(
            {"query": "大冰 他们最幸福 书评", "max_results": 5},
            session_id
        )
        
        print(f"✅ Tavily搜索完成: {execution.status}")
        print(f"📊 找到 {len(execution.result.results)} 个结果")
        print(f"⏱️  搜索耗时: {execution.result.search_time:.1f}ms")
        print()
        
        for i, result in enumerate(execution.result.results, 1):
            print(f"  {i}. {result.title}")
            print(f"     🔗 {result.url}")
            print(f"     🌐 {result.domain}")
            if hasattr(result, 'score') and result.score:
                print(f"     ⭐ 相关度: {result.score:.2f}")
            print(f"     📝 {result.summary[:100]}...")
            print()
            
    except Exception as e:
        print(f"❌ Tavily搜索失败: {e}")
        import traceback
        traceback.print_exc()

async def test_deepresearch_with_tavily():
    """Test DeepResearch agent with Tavily."""
    print("🤖 Testing DeepResearch Agent with Tavily...")
    
    agent = DeepResearchAgent()
    session_id = "test_tavily_deepresearch_001"
    
    try:
        print("📋 Agent capabilities:", await agent.get_capabilities())
        print("🚀 开始研究主题: '大冰《他们最幸福》书评分析'")
        print()
        
        event_count = 0
        text_chunks = []
        
        async for event in agent.process_message(
            "分析大冰《他们最幸福》这本书的读者评价和影响", 
            session_id
        ):
            event_count += 1
            event_type = event.get("type", "unknown")
            
            if event_type == "tool_call_start":
                tool_name = event['data']['tool']['name']
                print(f"🔧 启动工具: {tool_name}")
                if tool_name == "web_search":
                    query = event['data']['tool']['parameters'].get('query', '')
                    print(f"   🔍 搜索查询: {query}")
                    
            elif event_type == "tool_call_end":
                print(f"✅ 工具完成: {event['data']['status']}")
                if 'result' in event['data']:
                    result = event['data']['result']
                    if hasattr(result, 'results'):
                        print(f"   📊 搜索结果数: {len(result.results)}")
                    elif hasattr(result, 'search_time'):
                        print(f"   ⏱️  搜索耗时: {result.search_time:.1f}ms")
                        
            elif event_type == "text_chunk":
                chunk = event['data']['content']
                text_chunks.append(chunk)
                if len(chunk) > 50:
                    print(f"📄 生成内容: {chunk[:50]}...")
                else:
                    print(f"📄 生成内容: {chunk}")
                    
            elif event_type == "message_complete":
                content_len = len(event['data']['content'])
                print(f"✅ 分析完成: 总计 {content_len} 个字符")
                print(f"📝 事件总数: {event_count}")
                
            # 限制输出以便测试
            if event_count > 50:
                print("   ... (为了测试目的，输出被截断)")
                break
        
        # 显示最终结果的一部分
        if text_chunks:
            full_text = ''.join(text_chunks)
            print("\n" + "="*60)
            print("📋 研究报告摘要:")
            print("="*60)
            print(full_text[:500] + "..." if len(full_text) > 500 else full_text)
        
        print("\n✅ DeepResearch Agent 测试完成")
        
    except Exception as e:
        print(f"❌ Agent 测试失败: {e}")
        import traceback
        traceback.print_exc()

async def main():
    """Run Tavily tests."""
    print("🧪 Tavily API 集成测试\n")
    
    await test_tavily_search()
    print("-" * 60)
    
    await test_deepresearch_with_tavily()
    print("-" * 60)
    
    print("🎉 所有 Tavily 测试完成!")

if __name__ == "__main__":
    asyncio.run(main())