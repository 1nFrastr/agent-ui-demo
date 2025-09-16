#!/usr/bin/env python3
"""
快速测试脚本，验证字段名称修复
"""

import asyncio
import sys
import os

# 添加app到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from tools.web_search import WebSearchTool
from models.chat import WebSearchData


async def test_web_search_fields():
    """测试WebSearchData字段是否正确"""
    
    print("🧪 测试 WebSearchData 字段名称...")
    
    # 创建测试数据
    try:
        test_data = WebSearchData(
            query="test query",
            results=[],
            searchTime=100.0,
            totalResults=1000
        )
        
        print("✅ WebSearchData 模型创建成功")
        print(f"   查询: {test_data.query}")
        print(f"   搜索时间: {test_data.searchTime}ms")
        print(f"   总结果数: {test_data.totalResults}")
        
        # 测试访问字段
        assert hasattr(test_data, 'searchTime'), "缺少 searchTime 字段"
        assert hasattr(test_data, 'totalResults'), "缺少 totalResults 字段"
        
        print("✅ 所有字段访问正常")
        
    except Exception as e:
        print(f"❌ WebSearchData 测试失败: {e}")
        return False
    
    # 测试工具
    try:
        print("\n🔍 测试 WebSearchTool...")
        tool = WebSearchTool()
        
        # 不实际执行搜索，只测试类初始化
        print(f"✅ WebSearchTool 初始化成功: {tool.name}")
        
    except Exception as e:
        print(f"❌ WebSearchTool 测试失败: {e}")
        return False
    
    return True


async def main():
    """主测试函数"""
    print("🚀 开始字段名称修复验证...")
    
    success = await test_web_search_fields()
    
    if success:
        print("\n🎉 所有测试通过！字段名称修复成功。")
        print("💡 现在可以重新启动服务器测试API调用了。")
    else:
        print("\n❌ 测试失败，请检查代码修复。")
    
    return success


if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)