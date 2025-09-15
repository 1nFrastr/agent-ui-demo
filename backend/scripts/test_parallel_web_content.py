#!/usr/bin/env python3
"""
测试脚本：对比串行vs并行网页内容提取
目的：找到真正并行读取网页的最佳方案
"""

import asyncio
import time
import logging
import sys
import os
from typing import List

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.tools.web_content import WebContentTool
from app.config import settings

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# 测试URL列表
TEST_URLS = [
    "https://zh.wikipedia.org/wiki/Python",
    "https://docs.python.org/3/",
    "https://fastapi.tiangolo.com/",
    "https://httpx.encode.io/",
    "https://www.python.org/"
]

class TestRunner:
    def __init__(self):
        self.web_content_tool = WebContentTool()
    
    async def test_serial_execution(self, urls: List[str]) -> tuple:
        """测试串行执行（当前方式）"""
        logger.info("🔄 开始串行执行测试...")
        start_time = time.time()
        results = []
        
        for i, url in enumerate(urls, 1):
            logger.info(f"[串行] 开始处理URL {i}: {url}")
            try:
                # 使用run方法（包含日志和状态管理）
                execution = await self.web_content_tool.run(
                    {"url": url, "extract_images": False},
                    "test_session_serial"
                )
                results.append(execution.result)
                logger.info(f"[串行] 完成URL {i}: {url}")
            except Exception as e:
                logger.error(f"[串行] 失败URL {i}: {e}")
                results.append(None)
        
        total_time = time.time() - start_time
        logger.info(f"🏁 串行执行完成，总耗时: {total_time:.2f}秒")
        return results, total_time
    
    async def test_parallel_execution_v1(self, urls: List[str]) -> tuple:
        """测试并行执行V1：直接调用execute方法"""
        logger.info("🚀 开始并行执行测试V1 (execute方法)...")
        start_time = time.time()
        
        async def extract_single(url: str, index: int):
            logger.info(f"[并行V1] 开始处理URL {index}: {url}")
            try:
                result = await self.web_content_tool.execute(
                    {"url": url, "extract_images": False}
                )
                logger.info(f"[并行V1] 完成URL {index}: {url}")
                return result
            except Exception as e:
                logger.error(f"[并行V1] 失败URL {index}: {e}")
                return None
        
        # 创建并发任务
        tasks = [extract_single(url, i+1) for i, url in enumerate(urls)]
        
        # 并发执行
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        logger.info(f"🏁 并行执行V1完成，总耗时: {total_time:.2f}秒")
        return results, total_time
    
    async def test_parallel_execution_v2(self, urls: List[str]) -> tuple:
        """测试并行执行V2：使用共享客户端"""
        logger.info("🚀 开始并行执行测试V2 (共享客户端)...")
        start_time = time.time()
        
        # 创建共享的WebContentTool实例
        shared_tool = WebContentTool()
        
        async def extract_single_shared(url: str, index: int):
            logger.info(f"[并行V2] 开始处理URL {index}: {url}")
            try:
                result = await shared_tool.execute(
                    {"url": url, "extract_images": False}
                )
                logger.info(f"[并行V2] 完成URL {index}: {url}")
                return result
            except Exception as e:
                logger.error(f"[并行V2] 失败URL {index}: {e}")
                return None
        
        # 创建并发任务
        tasks = [extract_single_shared(url, i+1) for i, url in enumerate(urls)]
        
        # 并发执行
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        logger.info(f"🏁 并行执行V2完成，总耗时: {total_time:.2f}秒")
        return results, total_time
    
    async def test_parallel_execution_v3(self, urls: List[str]) -> tuple:
        """测试并行执行V3：每个任务独立工具实例"""
        logger.info("🚀 开始并行执行测试V3 (独立工具实例)...")
        start_time = time.time()
        
        async def extract_single_independent(url: str, index: int):
            # 每个任务创建独立的工具实例
            tool = WebContentTool()
            logger.info(f"[并行V3] 开始处理URL {index}: {url}")
            try:
                result = await tool.execute(
                    {"url": url, "extract_images": False}
                )
                logger.info(f"[并行V3] 完成URL {index}: {url}")
                return result
            except Exception as e:
                logger.error(f"[并行V3] 失败URL {index}: {e}")
                return None
        
        # 创建并发任务
        tasks = [extract_single_independent(url, i+1) for i, url in enumerate(urls)]
        
        # 并发执行
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        logger.info(f"🏁 并行执行V3完成，总耗时: {total_time:.2f}秒")
        return results, total_time
    
    def print_results_summary(self, test_name: str, results: list, execution_time: float):
        """打印测试结果摘要"""
        success_count = sum(1 for r in results if r and not isinstance(r, Exception))
        failure_count = len(results) - success_count
        
        print(f"\n📊 {test_name} 结果摘要:")
        print(f"   ⏱️  总耗时: {execution_time:.2f}秒")
        print(f"   ✅ 成功: {success_count}/{len(results)}")
        print(f"   ❌ 失败: {failure_count}/{len(results)}")
        print(f"   📈 平均每URL: {execution_time/len(results):.2f}秒")
        
        if success_count > 0:
            avg_content_length = sum(
                len(r.content) for r in results 
                if r and not isinstance(r, Exception) and hasattr(r, 'content')
            ) / success_count
            print(f"   📄 平均内容长度: {avg_content_length:.0f}字符")

async def main():
    """主测试函数"""
    print("🧪 网页内容提取并行化测试")
    print("=" * 50)
    
    runner = TestRunner()
    
    # 使用较少的URL进行快速测试
    test_urls = TEST_URLS[:3]  # 只测试前3个URL
    
    print(f"📋 测试URL列表 ({len(test_urls)}个):")
    for i, url in enumerate(test_urls, 1):
        print(f"   {i}. {url}")
    print()
    
    try:
        # 测试1：串行执行
        serial_results, serial_time = await runner.test_serial_execution(test_urls)
        runner.print_results_summary("串行执行", serial_results, serial_time)
        
        print("\n" + "="*50)
        
        # 测试2：并行执行V1 (execute方法)
        parallel_v1_results, parallel_v1_time = await runner.test_parallel_execution_v1(test_urls)
        runner.print_results_summary("并行执行V1 (execute方法)", parallel_v1_results, parallel_v1_time)
        
        print("\n" + "="*50)
        
        # 测试3：并行执行V2 (共享客户端)
        parallel_v2_results, parallel_v2_time = await runner.test_parallel_execution_v2(test_urls)
        runner.print_results_summary("并行执行V2 (共享客户端)", parallel_v2_results, parallel_v2_time)
        
        print("\n" + "="*50)
        
        # 测试4：并行执行V3 (独立实例)
        parallel_v3_results, parallel_v3_time = await runner.test_parallel_execution_v3(test_urls)
        runner.print_results_summary("并行执行V3 (独立实例)", parallel_v3_results, parallel_v3_time)
        
        # 性能对比总结
        print("\n" + "="*50)
        print("🏆 性能对比总结:")
        print(f"   串行执行:        {serial_time:.2f}秒 (基准)")
        print(f"   并行V1 (execute): {parallel_v1_time:.2f}秒 (提升 {((serial_time - parallel_v1_time) / serial_time * 100):.1f}%)")
        print(f"   并行V2 (共享):    {parallel_v2_time:.2f}秒 (提升 {((serial_time - parallel_v2_time) / serial_time * 100):.1f}%)")
        print(f"   并行V3 (独立):    {parallel_v3_time:.2f}秒 (提升 {((serial_time - parallel_v3_time) / serial_time * 100):.1f}%)")
        
        # 推荐方案
        times = {
            "并行V1 (execute)": parallel_v1_time,
            "并行V2 (共享)": parallel_v2_time,
            "并行V3 (独立)": parallel_v3_time
        }
        best_method = min(times, key=times.get)
        print(f"\n🥇 推荐方案: {best_method} ({times[best_method]:.2f}秒)")
        
    except Exception as e:
        logger.error(f"测试执行失败: {e}", exc_info=True)

if __name__ == "__main__":
    # 运行测试
    asyncio.run(main())