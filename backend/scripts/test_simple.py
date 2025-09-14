#!/usr/bin/env python3
"""Simple test for DeepResearch agent events."""

import asyncio
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.agents.deepresearch import DeepResearchAgent

async def test_deepresearch_simple():
    """Simple test of DeepResearch agent with event debugging."""
    print("🤖 Testing DeepResearch Agent - Simple Version...")
    
    agent = DeepResearchAgent()
    session_id = "test_simple_001"
    
    try:
        print("🚀 开始研究: '大冰《他们最幸福》书评'")
        print()
        
        event_count = 0
        
        async for event in agent.process_message(
            "简单分析一下大冰《他们最幸福》这本书", 
            session_id
        ):
            event_count += 1
            event_type = event.get("type", "unknown")
            
            print(f"📨 事件 #{event_count}: {event_type}")
            
            # 打印事件数据结构以便调试
            if event_count <= 5:  # 只显示前几个事件的详细信息
                print(f"   数据结构: {list(event.keys())}")
                if 'data' in event:
                    print(f"   data 字段: {list(event['data'].keys())}")
            
            if event_type == "text_chunk":
                chunk = event.get('data', {}).get('content', '')
                if chunk and len(chunk) > 30:
                    print(f"   📄 内容: {chunk[:30]}...")
                elif chunk:
                    print(f"   📄 内容: {chunk}")
                    
            elif event_type == "message_complete":
                content_len = len(event.get('data', {}).get('content', ''))
                print(f"   ✅ 完成: {content_len} 个字符")
                break
                
            # 限制事件数量
            if event_count > 30:
                print("   ... (限制输出)")
                break
        
        print(f"\n✅ 测试完成，处理了 {event_count} 个事件")
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_deepresearch_simple())