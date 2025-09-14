#!/usr/bin/env python3
"""Test the API endpoints."""

import asyncio
import httpx
import json
import time

API_BASE = "http://localhost:8000"

async def test_health_endpoint():
    """Test health check endpoint."""
    print("🏥 Testing Health Endpoint...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE}/health/")
            print(f"✅ Health check: {response.status_code}")
            print(f"📊 Response: {response.json()}")
            return True
        except Exception as e:
            print(f"❌ Health check failed: {e}")
            return False

async def test_chat_endpoint():
    """Test standard chat endpoint."""
    print("💬 Testing Chat Endpoint...")
    
    payload = {
        "message": "大冰的《他们最幸福》这本书",
        "sessionId": "test_session_api_001",
        "agentType": "deepresearch"
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{API_BASE}/api/chat",
                json=payload
            )
            print(f"✅ Chat response: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"📝 Message ID: {data.get('messageId')}")
                print(f"📄 Content length: {len(data.get('content', ''))}")
                print(f"🔧 Tools used: {len(data.get('toolCalls', []))}")
            else:
                print(f"❌ Error response: {response.text}")
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"❌ Chat test failed: {e}")
            return False

async def test_stream_endpoint():
    """Test streaming chat endpoint."""
    print("🌊 Testing Stream Endpoint...")
    
    payload = {
        "message": "大冰的《他们最幸福》这本书",
        "sessionId": "test_session_stream_001", 
        "agentType": "deepresearch"
    }
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            async with client.stream(
                "POST",
                f"{API_BASE}/api/chat/stream",
                json=payload,
                headers={"Accept": "text/event-stream"}
            ) as response:
                
                print(f"✅ Stream started: {response.status_code}")
                
                if response.status_code != 200:
                    print(f"❌ Stream failed: {await response.aread()}")
                    return False
                
                event_count = 0
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        event_data = line[6:]  # Remove "data: " prefix
                        
                        if event_data == "[DONE]":
                            print("✅ Stream completed")
                            break
                        
                        try:
                            event = json.loads(event_data)
                            event_count += 1
                            event_type = event.get("type", "unknown")
                            
                            print(f"📨 Event #{event_count}: {event_type}")
                            
                            if event_type == "tool_start":
                                tool_name = event.get("data", {}).get("tool", {}).get("name", "unknown")
                                print(f"   🔧 Starting tool: {tool_name}")
                            elif event_type == "tool_end":
                                status = event.get("data", {}).get("status", "unknown")
                                print(f"   ✅ Tool completed: {status}")
                            elif event_type == "text_chunk":
                                chunk = event.get("data", {}).get("content", "")
                                if len(chunk) > 30:
                                    print(f"   📄 Text: {chunk[:30]}...")
                                else:
                                    print(f"   📄 Text: {chunk}")
                            elif event_type == "message_complete":
                                content_len = len(event.get("data", {}).get("content", ""))
                                print(f"   ✅ Message completed: {content_len} chars")
                            elif event_type == "error":
                                error_msg = event.get("error", {}).get("message", "Unknown error")
                                print(f"   ❌ Error: {error_msg}")
                            
                            # Limit output for testing
                            if event_count > 25:
                                print("   ... (output truncated for testing)")
                                break
                                
                        except json.JSONDecodeError:
                            print(f"   ⚠️  Invalid JSON: {event_data[:50]}...")
                
                print(f"📊 Total events received: {event_count}")
                return True
                
        except Exception as e:
            print(f"❌ Stream test failed: {e}")
            return False

async def main():
    """Run all API tests."""
    print("🧪 Running API Tests\n")
    print(f"🎯 Target API: {API_BASE}")
    print("⚠️  Make sure the backend server is running!\n")
    
    # Test health endpoint first
    health_ok = await test_health_endpoint()
    print("-" * 60)
    
    if not health_ok:
        print("❌ Health check failed - server may not be running")
        print("💡 Start server with: python -m uvicorn app.main:app --reload")
        return
    
    # Test standard chat endpoint
    chat_ok = await test_chat_endpoint()
    print("-" * 60)
    
    # Test streaming endpoint
    stream_ok = await test_stream_endpoint()
    print("-" * 60)
    
    # Summary
    print("📋 Test Summary:")
    print(f"   Health: {'✅' if health_ok else '❌'}")
    print(f"   Chat: {'✅' if chat_ok else '❌'}")
    print(f"   Stream: {'✅' if stream_ok else '❌'}")
    
    if all([health_ok, chat_ok, stream_ok]):
        print("\n🎉 All API tests passed!")
    else:
        print("\n⚠️  Some tests failed. Check the logs for details.")

if __name__ == "__main__":
    asyncio.run(main())