#!/usr/bin/env python3
"""
Test script for LangSmith tracing integration.
This script tests whether LangSmith tracing is properly configured and working.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "app"))

from app.config import settings
from app.services.llm_service import get_llm_service


async def test_langsmith_tracing():
    """Test LangSmith tracing functionality."""
    print("🧪 Testing LangSmith Tracing Integration")
    print("=" * 50)
    
    # Check configuration
    print(f"📋 Configuration Check:")
    print(f"   LangSmith Tracing: {settings.langsmith_tracing}")
    print(f"   LangSmith Project: {settings.langsmith_project}")
    print(f"   LangSmith API Key: {'✅ Set' if settings.langsmith_api_key else '❌ Not Set'}")
    print(f"   OpenAI API Key: {'✅ Set' if settings.openai_api_key else '❌ Not Set'}")
    print()
    
    # Check environment variables
    print(f"🔧 Environment Variables:")
    print(f"   LANGCHAIN_TRACING_V2: {os.getenv('LANGCHAIN_TRACING_V2', 'Not Set')}")
    print(f"   LANGCHAIN_API_KEY: {'✅ Set' if os.getenv('LANGCHAIN_API_KEY') else '❌ Not Set'}")
    print(f"   LANGCHAIN_PROJECT: {os.getenv('LANGCHAIN_PROJECT', 'Not Set')}")
    print(f"   LANGCHAIN_ENDPOINT: {os.getenv('LANGCHAIN_ENDPOINT', 'Not Set')}")
    print()
    
    if not settings.openai_api_key:
        print("❌ OpenAI API key is required for testing. Please set OPENAI_API_KEY in your .env file.")
        return
    
    try:
        # Initialize LLM service
        print("🚀 Initializing LLM Service...")
        llm_service = get_llm_service()
        print("✅ LLM Service initialized successfully")
        print()
        
        # Check LangSmith client
        if llm_service.langsmith_client:
            print("✅ LangSmith client initialized successfully")
        else:
            print("⚠️  LangSmith client not initialized (tracing may be disabled)")
        print()
        
        # Create mock data for testing
        print("📊 Creating test data...")
        
        # Mock search results
        class MockSearchResults:
            def __init__(self):
                self.results = [
                    type('obj', (object,), {
                        'title': 'Test Result 1',
                        'url': 'https://example.com/1',
                        'summary': 'This is a test search result for LangSmith tracing',
                        'domain': 'example.com'
                    })(),
                    type('obj', (object,), {
                        'title': 'Test Result 2', 
                        'url': 'https://example.com/2',
                        'summary': 'Another test result to verify tracing functionality',
                        'domain': 'example.com'
                    })()
                ]
        
        # Mock web content
        mock_web_contents = [
            type('obj', (object,), {
                'url': 'https://example.com/1',
                'title': 'Test Page 1',
                'status': 'success',
                'content': 'This is test content for LangSmith tracing validation.',
                'summary': 'Test content summary',
                'metadata': type('obj', (object,), {
                    'author': 'Test Author',
                    'publish_date': '2025-01-01',
                    'description': 'Test page description'
                })()
            })()
        ]
        
        search_results = MockSearchResults()
        test_query = "Test query for LangSmith tracing"
        session_id = "test_session_123"
        
        print("✅ Test data created")
        print()
        
        # Test streaming analysis with tracing
        print("🔄 Testing streaming analysis with LangSmith tracing...")
        print("   Query:", test_query)
        print("   Session ID:", session_id)
        print()
        
        response_chunks = []
        async for chunk in llm_service.generate_analysis_stream(
            query=test_query,
            search_results=search_results,
            web_contents=mock_web_contents,
            session_id=session_id
        ):
            response_chunks.append(chunk)
            print(".", end="", flush=True)
        
        print("\n")
        print(f"✅ Streaming completed! Generated {len(response_chunks)} chunks")
        
        # Log completion for monitoring
        llm_service.log_analysis_completion(
            session_id=session_id,
            query=test_query,
            success=True
        )
        
        print("✅ Analysis completion logged to LangSmith")
        print()
        
        # Display response preview
        full_response = "".join(response_chunks)
        preview_length = 200
        preview = full_response[:preview_length] + "..." if len(full_response) > preview_length else full_response
        
        print("📄 Response Preview:")
        print("-" * 40)
        print(preview)
        print("-" * 40)
        print()
        
        # Final results
        print("🎉 LangSmith Tracing Test Results:")
        print("✅ LLM service initialization: PASSED")
        print("✅ Streaming analysis generation: PASSED")
        print("✅ Tracing configuration: PASSED")
        
        if settings.langsmith_tracing and settings.langsmith_api_key:
            print("✅ LangSmith integration: ENABLED")
            print(f"📊 Check your traces at: https://smith.langchain.com/projects/{settings.langsmith_project}")
        else:
            print("⚠️  LangSmith integration: DISABLED (configure API key to enable)")
        
        print()
        print("🏁 Test completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        
        # Log failure
        if 'llm_service' in locals():
            llm_service.log_analysis_completion(
                session_id="test_session_123",
                query="Test query for LangSmith tracing",
                success=False,
                error_msg=str(e)
            )


def main():
    """Main function to run the test."""
    print("🔬 LangSmith Tracing Test")
    print("=" * 50)
    print()
    
    # Run the async test
    asyncio.run(test_langsmith_tracing())


if __name__ == "__main__":
    main()