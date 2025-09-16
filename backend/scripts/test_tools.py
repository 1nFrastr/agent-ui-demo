"""Tool testing script."""

import asyncio
import sys
import os

# Add the app directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.tools.web_search import WebSearchTool
from app.tools.web_content import WebContentTool
from app.config import settings


async def test_web_search():
    """Test web search tool."""
    print("Testing Web Search Tool...")
    print("=" * 50)
    
    tool = WebSearchTool()
    
    try:
        result = await tool.execute({
            "query": "大冰 他们最幸福",
            "max_results": 3
        })
        
        print(f"Query: {result.query}")
        print(f"Results found: {len(result.results)}")
        print(f"Search time: {result.searchTime}ms")
        print()
        
        for i, item in enumerate(result.results, 1):
            print(f"{i}. {item.title}")
            print(f"   URL: {item.url}")
            print(f"   Summary: {item.summary}")
            print(f"   Domain: {item.domain}")
            print()
            
    except Exception as e:
        print(f"Search test failed: {e}")


async def test_web_content():
    """Test web content tool."""
    print("Testing Web Content Tool...")
    print("=" * 50)
    
    tool = WebContentTool()
    
    # Test with a well-known URL
    test_url = "https://book.douban.com/subject/25723870/"
    
    try:
        result = await tool.execute({
            "url": test_url,
            "extract_images": True
        })
        
        print(f"URL: {result.url}")
        print(f"Title: {result.title}")
        print(f"Status: {result.status}")
        print(f"Content length: {len(result.content)} characters")
        print(f"Images found: {len(result.images or [])}")
        print()
        
        if result.summary:
            print(f"Summary: {result.summary}")
            print()
        
        if result.metadata:
            print("Metadata:")
            if result.metadata.author:
                print(f"  Author: {result.metadata.author}")
            if result.metadata.description:
                print(f"  Description: {result.metadata.description}")
            print()
        
        # Show first 300 characters of content
        if result.content:
            print("Content preview:")
            print(result.content[:300] + "..." if len(result.content) > 300 else result.content)
            print()
            
    except Exception as e:
        print(f"Content test failed: {e}")


async def test_full_workflow():
    """Test full research workflow."""
    print("Testing Full Research Workflow...")
    print("=" * 50)
    
    from app.agents.deepresearch import DeepResearchAgent
    
    agent = DeepResearchAgent()
    query = "大冰《他们最幸福》"
    session_id = "test_session_123"
    
    try:
        print(f"Starting research for: {query}")
        print()
        
        async for event in agent.process_message(query, session_id):
            event_type = event.get("type")
            
            if event_type == "tool_call_start":
                data = event["data"]
                print(f"🔧 Tool Start: {data['tool_name']} - {data['message']}")
                
            elif event_type == "tool_call_end":
                data = event["data"]
                print(f"✅ Tool End: {data['tool_id']} - {data['status']}")
                if data.get("result"):
                    print(f"   Result: {data['result']}")
                print()
                
            elif event_type == "text_chunk":
                print(event["data"]["content"], end="", flush=True)
                
            elif event_type == "message_complete":
                print("\n\n🎉 Research completed!")
                break
                
    except Exception as e:
        print(f"Workflow test failed: {e}")
        import traceback
        traceback.print_exc()


async def main():
    """Main test function."""
    print(f"Agent UI Backend Tool Testing")
    print(f"Python version: {sys.version}")
    print(f"OpenAI configured: {bool(settings.openai_api_key)}")
    print(f"Google Search configured: {bool(settings.google_api_key)}")
    print(f"SerpAPI configured: {bool(settings.serpapi_api_key)}")
    print("=" * 60)
    print()
    
    # Test individual tools
    await test_web_search()
    await test_web_content()
    
    # Test full workflow if OpenAI is configured
    if settings.openai_api_key:
        await test_full_workflow()
    else:
        print("⚠️ OpenAI API key not configured. Skipping full workflow test.")
        print("Please set OPENAI_API_KEY in your .env file to test the complete functionality.")


if __name__ == "__main__":
    asyncio.run(main())