#!/usr/bin/env python3
"""Simple API test using real Tavily search."""

import asyncio
import httpx
import json
import time

API_BASE = "http://localhost:8000"

async def test_health():
    """Test health endpoint."""
    print("🏥 Testing Health Endpoint...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE}/health/")
            print(f"✅ Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"📊 Status: {data['status']}")
                print(f"🕐 Version: {data['version']}")
                return True
            else:
                print(f"❌ Unexpected status: {response.status_code}")
                print(f"Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error: {e}")
            return False

async def test_chat_stream():
    """Test streaming chat with Tavily search."""
    print("🌊 Testing Streaming Chat with Tavily...")
    
    payload = {
        "message": "大冰《他们最幸福》这本书的主要内容是什么？",
        "sessionId": "test_tavily_stream_001", 
        "agentType": "deepresearch"
    }
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            print(f"📤 发送请求: {payload['message']}")
            
            async with client.stream(
                "POST",
                f"{API_BASE}/api/chat/stream",
                json=payload,
                headers={"Accept": "text/event-stream"}
            ) as response:
                
                print(f"📡 连接状态: {response.status_code}")
                
                if response.status_code != 200:
                    error_text = await response.aread()
                    print(f"❌ 错误响应: {error_text.decode()}")
                    return False
                
                event_count = 0
                tool_calls = 0
                text_length = 0
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        event_data = line[6:]  # Remove "data: " prefix
                        
                        if event_data == "[DONE]":
                            print("✅ 流式传输完成")
                            break
                        
                        try:
                            event = json.loads(event_data)
                            event_count += 1
                            event_type = event.get("type", "unknown")
                            
                            if event_type == "tool_call_start":
                                tool_calls += 1
                                tool_name = event.get("data", {}).get("tool_name", "unknown")
                                print(f"🔧 开始工具调用 #{tool_calls}: {tool_name}")
                                
                            elif event_type == "tool_call_end":
                                status = event.get("data", {}).get("status", "unknown")
                                print(f"✅ 工具完成: {status}")
                                
                            elif event_type == "text_chunk":
                                chunk = event.get("data", {}).get("content", "")
                                text_length += len(chunk)
                                if len(chunk) > 40:
                                    print(f"📄 生成内容: {chunk[:40]}...")
                                else:
                                    print(f"📄 生成内容: {chunk}")
                                    
                            elif event_type == "message_complete":
                                content_len = len(event.get("data", {}).get("content", ""))
                                print(f"✅ 消息完成: {content_len} 个字符")
                                
                            elif event_type == "error":
                                error_msg = event.get("error", {}).get("message", "Unknown error")
                                print(f"❌ 错误: {error_msg}")
                                return False
                            
                            # 限制输出
                            if event_count > 40:
                                print("... (输出截断)")
                                break
                                
                        except json.JSONDecodeError:
                            print(f"⚠️  无效JSON: {event_data[:50]}...")
                
                print(f"\n📊 统计:")
                print(f"   总事件数: {event_count}")
                print(f"   工具调用数: {tool_calls}")
                print(f"   文本长度: {text_length} 字符")
                return True
                
        except Exception as e:
            print(f"❌ 流式测试失败: {e}")
            return False

async def main():
    """Run simple API tests."""
    print("🧪 简化 API 测试 (使用 Tavily)\n")
    
    # Test health
    health_ok = await test_health()
    print("-" * 50)
    
    if not health_ok:
        print("❌ 健康检查失败，退出测试")
        return
    
    # Test streaming with Tavily
    stream_ok = await test_chat_stream()
    print("-" * 50)
    
    print("📋 测试结果:")
    print(f"   健康检查: {'✅' if health_ok else '❌'}")
    print(f"   流式聊天: {'✅' if stream_ok else '❌'}")
    
    if health_ok and stream_ok:
        print("\n🎉 所有测试通过!")
    else:
        print("\n⚠️  部分测试失败")

if __name__ == "__main__":
    asyncio.run(main())