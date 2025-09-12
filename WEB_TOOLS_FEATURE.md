# 工具详情面板 - 网页搜索和网页读取功能

## 概述

工具详情面板新增了两种专用的工具类型：网页搜索（`web_search`）和网页读取（`web_content`）。这两个功能提供了更丰富的用户界面来展示网页相关的工具调用结果。

## 新增工具类型

### 1. 网页搜索 (`web_search`)

用于显示网页搜索结果，包含：
- 搜索关键词
- 网站LOGO/图标
- 网页标题（可点击跳转）
- 网页概述/摘要
- 搜索统计信息（结果数量、用时）

### 2. 网页读取 (`web_content`)

用于显示网页内容读取结果，包含：
- 链接地址
- 页面标题
- 页面元数据（作者、发布日期、描述、关键词）
- 提取的图片（网格布局）
- 读取的内容（支持HTML渲染）
- 内容摘要
- 读取状态指示

## 数据结构

### WebSearchData
```typescript
interface WebSearchData {
  query: string                    // 搜索关键词
  results: WebSearchResultItem[]   // 搜索结果列表
  searchTime?: number              // 搜索用时(ms)
  totalResults?: number            // 结果总数
}

interface WebSearchResultItem {
  title: string       // 网页标题
  url: string         // 网页链接
  summary: string     // 网页概述
  favicon?: string    // 网站图标URL
  domain?: string     // 网站域名
}
```

### WebContentData
```typescript
interface WebContentData {
  url: string                      // 网页链接地址
  title: string                    // 网页标题
  content: string                  // 读取的内容
  images?: Array<{                 // 提取的图片列表
    url: string
    alt?: string
    width?: number
    height?: number
  }>
  summary?: string                 // 内容摘要
  metadata?: {                     // 网页元数据
    author?: string
    publishDate?: string
    description?: string
    keywords?: string[]
  }
  status: 'success' | 'partial' | 'failed'  // 读取状态
  error?: string                   // 错误信息
}
```

## 使用示例

### 网页搜索工具调用

```typescript
const webSearchTool: ToolCallDetails = {
  id: 'search-001',
  name: '网页搜索',
  type: 'web_search',
  status: 'success',
  parameters: {
    query: '许三观卖血记'
  },
  metadata: {
    searchData: {
      query: '许三观卖血记',
      results: [
        {
          title: '许三观卖血记_百度百科',
          url: 'https://baike.baidu.com/item/许三观卖血记',
          summary: '《许三观卖血记》是当代作家余华于1995年发表的长篇小说。故事从童话开始...',
          favicon: 'https://baike.baidu.com/favicon.ico',
          domain: 'baike.baidu.com'
        },
        {
          title: '经典小说推荐《许三观卖血记》故事概览 - 知乎专栏',
          url: 'https://zhuanlan.zhihu.com/p/93393509',
          summary: '《许三观卖血记》是当代作家余华的一部长篇小说。故事从20世纪50年代新中国成立后写起...',
          favicon: 'https://static.zhihu.com/favicon.ico',
          domain: 'zhuanlan.zhihu.com'
        }
      ],
      searchTime: 1250,
      totalResults: 2840000
    }
  }
}
```

### 网页内容读取工具调用

```typescript
const webContentTool: ToolCallDetails = {
  id: 'content-001',
  name: '网页读取',
  type: 'web_content',
  status: 'success',
  parameters: {
    url: 'https://baike.baidu.com/item/许三观卖血记'
  },
  metadata: {
    contentData: {
      url: 'https://baike.baidu.com/item/许三观卖血记',
      title: '许三观卖血记_百度百科',
      content: '<p>《许三观卖血记》是当代作家余华于1995年发表的长篇小说...</p>',
      images: [
        {
          url: 'https://example.com/book-cover.jpg',
          alt: '许三观卖血记封面',
          width: 300,
          height: 400
        }
      ],
      summary: '这是一部描写小人物生存困境的现实主义作品...',
      metadata: {
        author: '余华',
        publishDate: '1995-01-01',
        description: '当代文学经典作品',
        keywords: ['余华', '现实主义', '文学作品']
      },
      status: 'success'
    }
  }
}
```

## 组件特性

### WebSearchDetails 组件特性
- ✅ 搜索关键词高亮显示
- ✅ 自动获取网站图标，失败时显示默认图标
- ✅ 支持外链点击跳转
- ✅ 响应式网格布局
- ✅ 搜索统计信息展示
- ✅ 悬停效果和交互反馈

### WebContentDetails 组件特性
- ✅ 完整的页面元数据展示
- ✅ 图片网格预览，支持悬停效果
- ✅ HTML内容安全渲染
- ✅ 读取状态指示器
- ✅ 错误信息友好展示
- ✅ 关键词标签展示
- ✅ 响应式设计

## 样式系统

组件遵循项目的设计系统：
- 使用 Tailwind CSS 工具类
- 支持亮色/暗色主题
- 统一的间距和圆角设计
- 一致的颜色方案
- 平滑的过渡动画

## 注意事项

1. **图标加载失败处理**：网站图标加载失败时会自动降级到默认图标
2. **内容安全**：HTML内容使用 `dangerouslySetInnerHTML` 渲染，需要确保内容安全
3. **性能优化**：图片懒加载和错误处理
4. **响应式设计**：在不同屏幕尺寸下都能良好展示
5. **无障碍访问**：支持键盘导航和屏幕阅读器

## 扩展性

组件设计考虑了未来的扩展需求：
- 支持自定义主题配置
- 可配置的显示选项
- 插件化的内容渲染器
- 国际化支持预留接口