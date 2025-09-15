#!/usr/bin/env python3
"""
验证真正并行化的快速测试
"""

import asyncio
import time
import logging
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.agents.deepresearch import DeepResearchAgent

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# 模拟搜索结果
class MockSearchResult:
    def __init__(self, url):
        self.url = url

async def test_true_parallel():
    """测试真正的并行执行"""
    logger.info("🧪 开始测试真正的并行执行...")
    
    # 测试URL
    test_urls = [
        "https://zh.wikipedia.org/wiki/Python",
        "https://docs.python.org/3/",
        "https://fastapi.tiangolo.com/"
    ]
    
    mock_results = [MockSearchResult(url) for url in test_urls]
    
    agent = DeepResearchAgent()
    
    try:
        start_time = time.time()
        
        # 使用新的并行方法
        contents = await agent._extract_web_contents(mock_results)
        
        total_time = time.time() - start_time
        
        logger.info(f"🏁 测试完成！总耗时: {total_time:.2f}秒")
        logger.info(f"📊 成功提取: {len([c for c in contents if c])}个网页")
        
        # 清理资源
        if agent._shared_client and not agent._shared_client.is_closed:
            await agent._shared_client.aclose()
        
        return total_time
        
    except Exception as e:
        logger.error(f"测试失败: {e}", exc_info=True)
        return None

if __name__ == "__main__":
    result = asyncio.run(test_true_parallel())
    if result:
        print(f"\n🎯 真并行测试结果: {result:.2f}秒")
    else:
        print("\n❌ 测试失败")