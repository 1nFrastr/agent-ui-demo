#!/usr/bin/env python3
"""Test tools and basic functionality."""

import asyncio
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.tools.web_search import WebSearchTool
from app.tools.web_content import WebContentTool
from app.agents.deepresearch import DeepResearchAgent
from app.core.logging import logger

async def test_web_search():
    """Test web search tool."""
    print("🔍 Testing Web Search Tool...")
    
    tool = WebSearchTool()
    session_id = "test_session_001"
    
    try:
        execution = await tool.run(
            {"query": "大冰 他们最幸福", "max_results": 3},
            session_id
        )
        
        print(f"✅ Search completed: {execution.status}")
        print(f"📊 Found {len(execution.result.results)} results")
        
        for i, result in enumerate(execution.result.results, 1):
            print(f"  {i}. {result.title}")
            print(f"     🔗 {result.url}")
            print(f"     📝 {result.summary[:100]}...")
            print()
            
    except Exception as e:
        print(f"❌ Search failed: {e}")

async def test_web_content():
    """Test web content extraction tool."""
    print("📖 Testing Web Content Tool...")
    
    tool = WebContentTool()
    session_id = "test_session_002"
    
    try:
        execution = await tool.run(
            {"url": "https://baike.baidu.com", "extract_images": True},
            session_id
        )
        
        print(f"✅ Content extraction completed: {execution.status}")
        print(f"📄 Title: {execution.result.title}")
        print(f"📝 Content length: {len(execution.result.content)} characters")
        print(f"🖼️  Images found: {len(execution.result.images or [])}")
        print()
        
    except Exception as e:
        print(f"❌ Content extraction failed: {e}")

async def test_deepresearch_agent():
    """Test DeepResearch agent."""
    print("🤖 Testing DeepResearch Agent...")
    
    agent = DeepResearchAgent()
    session_id = "test_session_003"
    
    try:
        print("📋 Agent capabilities:", await agent.get_capabilities())
        
        print("🚀 Starting research for: '大冰的《他们最幸福》这本书'")
        
        event_count = 0
        async for event in agent.process_message(
            "大冰的《他们最幸福》这本书", 
            session_id
        ):
            event_count += 1
            event_type = event.get("type", "unknown")
            print(f"📨 Event #{event_count}: {event_type}")
            
            if event_type == "tool_start":
                print(f"   🔧 Tool: {event['data']['tool']['name']}")
                print(f"   📝 Description: {event['data']['description']}")
            elif event_type == "tool_end":
                print(f"   ✅ Tool completed: {event['data']['status']}")
            elif event_type == "text_chunk":
                chunk = event['data']['content']
                if len(chunk) > 50:
                    print(f"   📄 Text chunk: {chunk[:50]}...")
                else:
                    print(f"   📄 Text chunk: {chunk}")
            elif event_type == "message_complete":
                print(f"   ✅ Message completed with {len(event['data']['content'])} characters")
            
            # Limit output for testing
            if event_count > 20:
                print("   ... (truncated for testing)")
                break
        
        print("✅ Agent test completed")
        
    except Exception as e:
        print(f"❌ Agent test failed: {e}")
        import traceback
        traceback.print_exc()

async def main():
    """Run all tests."""
    print("🧪 Running Backend Component Tests\n")
    
    await test_web_search()
    print("-" * 50)
    
    await test_web_content()
    print("-" * 50)
    
    await test_deepresearch_agent()
    print("-" * 50)
    
    print("🎉 All tests completed!")

if __name__ == "__main__":
    asyncio.run(main())