#!/usr/bin/env python3
"""简单测试AI开发者代理的响应"""

import asyncio
import json
import sys

# 添加项目根目录到path
sys.path.append('/d/work/open-agent-ui/backend')

from app.agents.ai_developer import AIDeveloperAgent


async def test_simple_ai_developer():
    """测试简化后的AI开发者代理"""
    
    agent = AIDeveloperAgent()
    session_id = "test_session_123"
    message = "请为我创建一个简单的个人介绍页面"
    
    print(f"🧪 测试AI开发者代理")
    print(f"📝 用户消息: {message}")
    print(f"🆔 会话ID: {session_id}")
    print(f"{'='*50}")
    
    try:
        event_count = 0
        async for event in agent.process_message(message, session_id):
            event_count += 1
            event_type = event.get('type', 'unknown')
            
            print(f"📡 事件 {event_count}: {event_type}")
            
            if event_type == 'tool_call_start':
                tool_name = event.get('data', {}).get('toolName', 'unknown')
                print(f"   🔧 工具启动: {tool_name}")
                
            elif event_type == 'tool_call_end':
                tool_id = event.get('data', {}).get('toolId', 'unknown')
                status = event.get('data', {}).get('status', 'unknown')
                metadata = event.get('data', {}).get('metadata', {})
                
                print(f"   ✅ 工具完成: {tool_id} ({status})")
                
                # 检查是否有fileSystemData
                if 'fileSystemData' in metadata:
                    file_system = metadata['fileSystemData']
                    print(f"   📁 文件系统数据:")
                    for filename, file_info in file_system.items():
                        content_preview = file_info.get('content', '')[:100] + '...' if len(file_info.get('content', '')) > 100 else file_info.get('content', '')
                        print(f"      - {filename}: {len(file_info.get('content', ''))} bytes")
                        print(f"        内容预览: {content_preview.replace(chr(10), ' ')}")
                        
            elif event_type == 'text_chunk':
                content = event.get('data', {}).get('content', '')
                print(f"   💬 文本块: {content[:50]}{'...' if len(content) > 50 else ''}")
                
            elif event_type == 'message_complete':
                content = event.get('data', {}).get('content', '')
                print(f"   🎯 消息完成: {len(content)} 字符")
                
            # 限制输出，避免过多信息
            if event_count > 20:
                print("   ⚠️  达到最大事件数量限制")
                break
                
        print(f"{'='*50}")
        print(f"✅ 测试完成，共处理 {event_count} 个事件")
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("🚀 启动AI开发者代理测试")
    asyncio.run(test_simple_ai_developer())