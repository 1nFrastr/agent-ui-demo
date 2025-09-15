#!/usr/bin/env python3
"""
极致并行化测试：真正的同时开始
"""

import asyncio
import time
import logging
import sys
import os
import httpx
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
    "https://fastapi.tiangolo.com/"
]

class ExtremeParallelTest:
    def __init__(self):
        # 预先创建共享客户端
        self.shared_client = None
    
    async def init_shared_client(self):
        """初始化共享HTTP客户端"""
        self.shared_client = httpx.AsyncClient(
            timeout=settings.request_timeout,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
        )
        logger.info("🔧 共享HTTP客户端初始化完成")
    
    async def close_shared_client(self):
        """关闭共享客户端"""
        if self.shared_client:
            await self.shared_client.aclose()
    
    async def test_extreme_parallel_v1(self, urls: List[str]) -> tuple:
        """极致并行V1：预初始化+同时创建任务"""
        logger.info("🚀 开始极致并行测试V1 (预初始化)...")
        
        # 确保共享客户端已初始化
        await self.init_shared_client()
        
        start_time = time.time()
        
        async def extract_with_shared_client(url: str, index: int):
            logger.info(f"[极致V1] 立即开始处理URL {index}: {url}")
            try:
                # 直接使用预初始化的客户端
                response = await self.shared_client.get(url)
                response.raise_for_status()
                content_length = len(response.text)
                logger.info(f"[极致V1] 完成URL {index}: {url} ({content_length}字符)")
                return {"url": url, "content_length": content_length, "status": "success"}
            except Exception as e:
                logger.error(f"[极致V1] 失败URL {index}: {e}")
                return {"url": url, "error": str(e), "status": "failed"}
        
        # 立即创建所有任务
        tasks = [
            extract_with_shared_client(url, i+1) 
            for i, url in enumerate(urls)
        ]
        
        logger.info(f"📋 已创建{len(tasks)}个并发任务，开始执行...")
        
        # 真正的并发执行
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        logger.info(f"🏁 极致并行V1完成，总耗时: {total_time:.2f}秒")
        
        await self.close_shared_client()
        return results, total_time
    
    async def test_extreme_parallel_v2(self, urls: List[str]) -> tuple:
        """极致并行V2：使用asyncio.create_task立即启动"""
        logger.info("🚀 开始极致并行测试V2 (create_task)...")
        
        await self.init_shared_client()
        start_time = time.time()
        
        async def extract_immediate(url: str, index: int):
            # 记录真正的开始时间
            task_start = time.time()
            logger.info(f"[极致V2] 立即开始处理URL {index}: {url} (任务启动时间: {task_start - start_time:.2f}s)")
            
            try:
                response = await self.shared_client.get(url)
                response.raise_for_status()
                content_length = len(response.text)
                task_duration = time.time() - task_start
                logger.info(f"[极致V2] 完成URL {index}: {url} (任务耗时: {task_duration:.2f}s)")
                return {"url": url, "content_length": content_length, "status": "success"}
            except Exception as e:
                task_duration = time.time() - task_start
                logger.error(f"[极致V2] 失败URL {index}: {e} (任务耗时: {task_duration:.2f}s)")
                return {"url": url, "error": str(e), "status": "failed"}
        
        # 使用create_task立即启动所有任务
        tasks = []
        for i, url in enumerate(urls):
            task = asyncio.create_task(extract_immediate(url, i+1))
            tasks.append(task)
            logger.info(f"📤 任务{i+1}已启动")
        
        # 等待所有任务完成
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        logger.info(f"🏁 极致并行V2完成，总耗时: {total_time:.2f}秒")
        
        await self.close_shared_client()
        return results, total_time
    
    async def test_extreme_parallel_v3(self, urls: List[str]) -> tuple:
        """极致并行V3：使用原始httpx直接并发"""
        logger.info("🚀 开始极致并行测试V3 (原始httpx)...")
        
        start_time = time.time()
        
        async def raw_httpx_fetch(url: str, index: int):
            task_start = time.time()
            logger.info(f"[极致V3] 立即开始处理URL {index}: {url} (启动时间: {task_start - start_time:.3f}s)")
            
            async with httpx.AsyncClient(
                timeout=10.0,
                limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
            ) as client:
                try:
                    response = await client.get(url)
                    response.raise_for_status()
                    content_length = len(response.text)
                    task_duration = time.time() - task_start
                    logger.info(f"[极致V3] 完成URL {index}: {url} (耗时: {task_duration:.2f}s)")
                    return {"url": url, "content_length": content_length, "status": "success"}
                except Exception as e:
                    task_duration = time.time() - task_start
                    logger.error(f"[极致V3] 失败URL {index}: {e} (耗时: {task_duration:.2f}s)")
                    return {"url": url, "error": str(e), "status": "failed"}
        
        # 立即创建所有任务
        tasks = [raw_httpx_fetch(url, i+1) for i, url in enumerate(urls)]
        
        # 并发执行
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        logger.info(f"🏁 极致并行V3完成，总耗时: {total_time:.2f}秒")
        
        return results, total_time

async def main():
    """主测试函数"""
    print("🧪 极致并行化测试")
    print("=" * 50)
    
    test_runner = ExtremeParallelTest()
    test_urls = TEST_URLS
    
    print(f"📋 测试URL列表 ({len(test_urls)}个):")
    for i, url in enumerate(test_urls, 1):
        print(f"   {i}. {url}")
    print()
    
    try:
        # 测试1：预初始化共享客户端
        v1_results, v1_time = await test_runner.test_extreme_parallel_v1(test_urls)
        print(f"\n📊 极致并行V1结果: {v1_time:.2f}秒")
        
        print("\n" + "="*30)
        
        # 测试2：create_task立即启动
        v2_results, v2_time = await test_runner.test_extreme_parallel_v2(test_urls)
        print(f"\n📊 极致并行V2结果: {v2_time:.2f}秒")
        
        print("\n" + "="*30)
        
        # 测试3：原始httpx
        v3_results, v3_time = await test_runner.test_extreme_parallel_v3(test_urls)
        print(f"\n📊 极致并行V3结果: {v3_time:.2f}秒")
        
        # 性能对比
        print("\n" + "="*50)
        print("🏆 极致并行性能对比:")
        print(f"   预初始化共享客户端: {v1_time:.2f}秒")
        print(f"   create_task启动:   {v2_time:.2f}秒")
        print(f"   原始httpx并发:     {v3_time:.2f}秒")
        
        best_time = min(v1_time, v2_time, v3_time)
        print(f"\n🥇 最佳性能: {best_time:.2f}秒")
        
    except Exception as e:
        logger.error(f"测试执行失败: {e}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(main())