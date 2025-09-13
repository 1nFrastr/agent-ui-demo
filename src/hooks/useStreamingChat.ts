import { useState, useCallback, useRef } from 'react'
import type { Message } from '@/types/chat'

interface UseStreamingChatOptions {
  /** 流式回复的延迟时间（毫秒） */
  streamDelay?: number
  /** 每次流式更新的字符数 */
  chunkSize?: number
}

interface UseStreamingChatReturn {
  /** 消息列表 */
  messages: Message[]
  /** 是否正在加载 */
  isLoading: boolean
  /** 发送消息 */
  sendMessage: (content: string) => void
  /** 停止流式回复 */
  stopStreaming: () => void
  /** 清空对话 */
  clearChat: () => void
  /** 删除消息 */
  deleteMessage: (messageId: string) => void
}

// 模拟AI回复的示例内容
const AI_RESPONSES = [
  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'web_search',
        message: '搜索最新的React最佳实践...'
      },
      {
        type: 'text' as const,
        content: `根据搜索结果，我为您整理了 **React 2024年最佳实践**：

## 🚀 核心开发原则

### 1. 组件设计模式
- 使用函数组件 + Hooks
- 遵循单一职责原则
- 合理拆分组件粒度`
      },
      {
        type: 'tool_call' as const,
        tool: 'code_generator',
        message: '生成示例代码...'
      },
      {
        type: 'text' as const,
        content: `## 代码示例

\`\`\`typescript
// ✅ 推荐：函数组件模式
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false))
  }, [userId])
  
  if (loading) return <div>Loading...</div>
  return <div>{user?.name}</div>
}
\`\`\`

这样的设计清晰、易维护！`
      }
    ]
  },

  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'project_analyzer',
        message: '分析项目结构...'
      },
      {
        type: 'text' as const,
        content: `# 项目分析结果 📊

我发现了一些可以优化的地方：

## 架构建议
- 组件目录结构需要优化
- 状态管理可以更加清晰`
      },
      {
        type: 'tool_call' as const,
        tool: 'performance_checker',
        message: '检查性能指标...'
      },
      {
        type: 'text' as const,
        content: `## 性能优化建议

### 1. 组件优化
- ✅ 使用 \`React.memo\` 减少重渲染
- ✅ 合理使用 \`useMemo\` 和 \`useCallback\`
- ✅ 实现虚拟滚动优化长列表

### 2. 打包优化
- 代码分割和懒加载
- 压缩静态资源
- 使用 CDN 加速

这些改进可以显著提升用户体验！`
      }
    ]
  },

  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'api_designer',
        message: '设计API接口...'
      },
      {
        type: 'text' as const,
        content: `# API设计方案 🔧

基于您的需求，我设计了以下API结构：

## RESTful 接口设计
\`\`\`
GET    /api/users           # 获取用户列表
POST   /api/users           # 创建用户
GET    /api/users/:id       # 获取用户详情
PUT    /api/users/:id       # 更新用户
DELETE /api/users/:id       # 删除用户
\`\`\``
      },
      {
        type: 'tool_call' as const,
        tool: 'database_optimizer',
        message: '优化数据库查询...'
      },
      {
        type: 'text' as const,
        content: `## 数据库优化

### 索引策略
\`\`\`sql
-- 用户表索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_created_at ON users(created_at);
CREATE INDEX idx_user_status ON users(status);
\`\`\`

### 查询优化
- 使用预编译语句防止SQL注入
- 合理使用连接查询
- 实现查询缓存机制

这样可以大幅提升数据库性能！`
      }
    ]
  },

  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'web_search',
        message: '搜索大冰《他们最幸福》相关信息...'
      },
      {
        type: 'text' as const,
        content: `# 网页搜索结果 🔍

我找到了关于大冰《他们最幸福》的相关信息：`
      },
      {
        type: 'tool_call' as const,
        tool: 'web_content',
        message: '读取豆瓣读书页面内容...'
      },
      {
        type: 'text' as const,
        content: `# 内容读取完成 📖

## 作品简介

《他们最幸福》是大冰2013年出版的代表作品，记录了十几个真实的传奇故事。这些故事的主人公大多是平凡人，但他们都在以自己的方式诠释着什么是真正的幸福和自由。

## 主要特色

- **真实性强**：每个故事都来源于作者的真实经历和见闻
- **情感真挚**：用温暖的文字记录平凡人的不平凡故事
- **价值观独特**：倡导追求内心真正想要的生活方式

## 文学价值

这部作品以其独特的叙述风格和深刻的人生感悟，触动了无数读者的心。大冰用他的文字告诉我们，幸福其实很简单，就在于做自己真正喜欢的事情。

通过网页搜索和内容读取，我们可以快速获取和整理各种网络资源！ ✨`
      }
    ]
  },

  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'ui_designer',
        message: '设计用户界面布局...'
      },
      {
        type: 'text' as const,
        content: `# UI设计方案 🎨

我为您设计了现代化的用户界面：

## 设计原则
- 简洁明了的布局
- 一致的视觉风格
- 良好的用户体验`
      },
      {
        type: 'tool_call' as const,
        tool: 'component_generator',
        message: '生成组件代码...'
      },
      {
        type: 'text' as const,
        content: `## 组件实现

### 1. 卡片组件
\`\`\`typescript
interface CardProps {
  title: string
  content: string
  actions?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ title, content, actions }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{content}</p>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
\`\`\`

### 2. 按钮组件
\`\`\`typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({ 
  variant, 
  size, 
  children, 
  onClick 
}) => {
  const baseClasses = 'rounded font-medium transition-colors'
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  }
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]}\`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
\`\`\`

### 3. 布局系统
\`\`\`typescript
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">应用标题</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
\`\`\`

这些组件提供了完整的UI基础，可以快速构建现代化应用！ ✨`
      }
    ]
  },

  {
    type: 'with_tools' as const,
    steps: [
      {
        type: 'tool_call' as const,
        tool: 'code_generator',
        message: '生成HTML示例文件...'
      },
      {
        type: 'text' as const,
        content: `# 代码文件生成完成 💻

我为您创建了一个完整的HTML/CSS/JavaScript示例项目：

## 📁 项目结构
- \`index.html\` - 主页面文件
- \`style.css\` - 样式文件  
- \`script.js\` - JavaScript逻辑
- \`README.md\` - 项目说明

## 🎯 功能特性
✅ 响应式设计  
✅ 交互式按钮  
✅ 动态内容生成  
✅ 颜色变化动画  
✅ 无外部依赖`
      },
      {
        type: 'tool_call' as const,
        tool: 'file_browser',
        message: '设置文件浏览器...'
      },
      {
        type: 'text' as const,
        content: `## 📝 代码预览

### HTML结构 (index.html)
\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>示例页面</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>欢迎使用AI编程工具</h1>
        <p>这是一个示例HTML文件。</p>
        <button id="clickBtn">点击我</button>
        <div id="output"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>
\`\`\`

### CSS样式 (style.css)
\`\`\`css
.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

h1 {
    color: #2563eb;
    text-align: center;
    margin-bottom: 20px;
}

button {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background-color: #2563eb;
}
\`\`\`

### JavaScript逻辑 (script.js)
\`\`\`javascript
// 获取页面元素
const button = document.getElementById('clickBtn');
const output = document.getElementById('output');

// 设置按钮点击事件
if (button && output) {
    button.addEventListener('click', function() {
        const now = new Date();
        output.innerHTML = 
            '<h3>按钮被点击了！</h3>' +
            '<p>当前时间: ' + now.toLocaleString() + '</p>';
    });
}

// 动态颜色变化
function generateRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
    return colors[Math.floor(Math.random() * colors.length)];
}

setInterval(() => {
    const h1 = document.querySelector('h1');
    if (h1) {
        h1.style.color = generateRandomColor();
    }
}, 5000);
\`\`\`

现在您可以：
1. 📝 在左侧文件浏览器中查看和编辑代码
2. 🔍 在右侧预览器中查看实时效果
3. ⚡ 修改代码后立即看到变化

这个示例展示了现代Web开发的基础技术栈！ ✨`
      }
    ]
  }
]

export const useStreamingChat = (options: UseStreamingChatOptions = {}): UseStreamingChatReturn => {
  const { streamDelay = 10, chunkSize = 50 } = options
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const streamingTimeoutRef = useRef<number | null>(null)
  const currentStreamRef = useRef<{
    messageId: string
    fullContent: string
    currentIndex: number
  } | null>(null)

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // 根据工具类型获取合适的结果描述
  const getToolResult = (toolName: string): string | undefined => {
    switch (toolName) {
      case 'web_search':
        return '找到3个相关结果'
      case 'web_content':
        return '成功读取页面内容'
      case 'code_generator':
        return '代码生成完成'
      case 'file_browser':
        return '文件浏览器设置完成'
      case 'project_analyzer':
        return '项目分析完成'
      case 'performance_checker':
        return '性能检查完成'
      case 'api_designer':
        return 'API设计完成'
      case 'database_optimizer':
        return '数据库优化完成'
      case 'ui_designer':
        return 'UI设计完成'
      case 'component_generator':
        return '组件生成完成'
      default:
        return undefined // 其他工具不显示结果
    }
  }

  const stopStreaming = useCallback(() => {
    if (streamingTimeoutRef.current) {
      clearTimeout(streamingTimeoutRef.current)
      streamingTimeoutRef.current = null
    }
    
    if (currentStreamRef.current) {
      // 完成当前流式消息
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentStreamRef.current?.messageId
            ? { ...msg, content: { text: currentStreamRef.current.fullContent }, status: 'delivered' as const }
            : msg
        )
      )
      currentStreamRef.current = null
    }
    
    setIsLoading(false)
  }, [])

  const streamContent = useCallback(() => {
    if (!currentStreamRef.current) return
    
    const { messageId, fullContent, currentIndex } = currentStreamRef.current
    
    if (currentIndex >= fullContent.length) {
      // 流式回复完成
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: { text: fullContent }, status: 'delivered' as const }
            : msg
        )
      )
      currentStreamRef.current = null
      setIsLoading(false)
      return
    }
    
    // 计算下一个chunk的结束位置
    const nextIndex = Math.min(currentIndex + chunkSize, fullContent.length)
    const partialContent = fullContent.slice(0, nextIndex)
    
    // 更新消息内容
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: { text: partialContent } }
          : msg
      )
    )
    
    // 更新当前索引
    currentStreamRef.current.currentIndex = nextIndex
    
    // 继续流式回复
    streamingTimeoutRef.current = setTimeout(streamContent, streamDelay)
  }, [streamDelay, chunkSize])

  const simulateAIResponse = useCallback((userMessage: string) => {
    console.log('simulateAIResponse called with:', userMessage)
    setIsLoading(true)
    
    // 检查关键词并选择对应的示例
    let selectedResponse
    if (userMessage.toLowerCase().includes('test')) {
      // 使用包含web_search和web_content的示例（索引为3）
      selectedResponse = AI_RESPONSES[3]
    } else if (userMessage.toLowerCase().includes('code')) {
      // 使用包含代码生成和文件浏览器的示例（索引为5）
      selectedResponse = AI_RESPONSES[5]
    } else {
      // 随机选择其他AI回复（排除test和code专用的示例）
      const availableResponses = AI_RESPONSES.slice(0, 3)
      const responseIndex = Math.floor(Math.random() * availableResponses.length)
      selectedResponse = availableResponses[responseIndex]
    }
    
    // 包含工具调用的回复
    let stepIndex = 0
    
    const processNextStep = () => {
      if (stepIndex >= selectedResponse.steps.length) {
        setIsLoading(false)
        return
      }
      
      const step = selectedResponse.steps[stepIndex]
      
      if (step.type === 'tool_call') {
        // 创建工具调用消息
        const toolMessageId = generateId()
        
        // 根据工具类型设置适当的类型和元数据
        let toolType: 'web_search' | 'web_content' | 'code_generation' | 'analysis' | 'api_request' | 'other' = 'other'
        let toolMetadata: Record<string, unknown> = {}
        let toolParameters: Record<string, unknown> = {}
        
        // 根据工具名称设置类型和参数
        switch (step.tool) {
          case 'web_search':
            toolType = 'web_search'
            toolParameters = { query: '大冰 他们最幸福' }
            toolMetadata = {
              searchData: {
                query: '大冰 他们最幸福',
                results: [
                  {
                    title: '他们最幸福-大冰-电子书-在线阅读-网易云阅读',
                    url: 'https://yuedu.163.com/source/8d4ad3d0f7d6409bad45a3a6e90de2f4_4',
                    summary: '《他们最幸福》是大冰2013年出版的代表作品，书中记录了十几个真实的传奇故事。这些故事的主人公大多是平凡人，有流浪歌手、酒吧老板、小镇青年、北漂艺术家...',
                    favicon: 'https://yuedu.163.com/favicon.ico',
                    domain: 'yuedu.163.com'
                  },
                  {
                    title: '他们最幸福 (豆瓣)',
                    url: 'https://book.douban.com/subject/25723870/',
                    summary: '大冰 / 2013-09 / 湖南文艺出版社 / 32.00元。十几个故事，十几种善意的人生。每个人都在以自己的方式诠释着什么是真正的幸福和自由。愿你我都能像他们一样，勇敢做自己。',
                    favicon: 'https://img1.doubanio.com/favicon.ico',
                    domain: 'book.douban.com'
                  },
                  {
                    title: '大冰《他们最幸福》经典语录_句子迷',
                    url: 'https://www.juzimi.com/writer/dabing',
                    summary: '大冰《他们最幸福》经典语录：1、愿你我都有能力爱自己，有余力爱别人。2、请相信，这个世界上真的有人在过着你想要的生活。忽晴忽雨的江湖，祝你有梦为马，随处可栖。',
                    favicon: 'https://www.juzimi.com/favicon.ico',
                    domain: 'juzimi.com'
                  }
                ],
                searchTime: 890,
                totalResults: 1280000
              }
            }
            break
          case 'web_content':
            toolType = 'web_content'
            toolParameters = { url: 'https://book.douban.com/subject/25723870/' }
            toolMetadata = {
              contentData: {
                url: 'https://book.douban.com/subject/25723870/',
                title: '他们最幸福 (豆瓣)',
                content: `<div class="content">
                  <h1>他们最幸福</h1>
                  <div class="info">
                    <span>作者: 大冰</span>
                    <span>出版社: 湖南文艺出版社</span>
                    <span>出版年: 2013-9</span>
                    <span>定价: 32.00元</span>
                  </div>
                  <h2>内容简介</h2>
                  <p>十几个故事，十几种善意的人生。每个人都在以自己的方式诠释着什么是真正的幸福和自由。</p>
                  <p>有流浪歌手、有酒吧老板、有小镇青年、有北漂艺术家......他们中的每一个都曾经历过迷茫，但最终都找到了属于自己的生活方式。</p>
                  <h2>作者简介</h2>
                  <p>大冰，原名焦冰，山东烟台人。曾任职于山东卫视、凤凰卫视。现为高原酒吧掌柜、民谣歌手、背包客。</p>
                  <h2>经典语录</h2>
                  <ul>
                    <li>愿你我都有能力爱自己，有余力爱别人。</li>
                    <li>请相信，这个世界上真的有人在过着你想要的生活。</li>
                    <li>忽晴忽雨的江湖，祝你有梦为马，随处可栖。</li>
                  </ul>
                  <h2>读者评价</h2>
                  <p>这本书让我重新思考什么是真正的幸福。每个故事都很真实，很温暖，读完之后内心充满了力量。</p>
                </div>`,
                images: [
                  {
                    url: 'https://img1.doubanio.com/view/subject/l/public/s27237850.jpg',
                    alt: '他们最幸福书籍封面',
                    width: 300,
                    height: 400
                  }
                ],
                summary: '这是一部记录真实人生故事的作品，作者大冰用温暖的文字讲述了十几个平凡人的不平凡故事，每个故事都在诠释着什么是真正的幸福和自由。',
                metadata: {
                  author: '大冰',
                  publishDate: '2013-09-01',
                  description: '十几个故事，十几种善意的人生。愿你我都能像他们一样，勇敢做自己。',
                  keywords: ['大冰', '他们最幸福', '生活哲学', '人生感悟', '真实故事']
                },
                status: 'success' as const
              }
            }
            break
          case 'file_browser':
            toolType = 'other'
            toolParameters = { action: 'setup_workspace' }
            // 从 sampleData 导入文件系统数据
            toolMetadata = {
              fileSystemData: {
                files: [
                  {
                    id: '1',
                    name: 'index.html',
                    path: '/index.html',
                    type: 'file',
                    extension: 'html',
                    content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>示例页面</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>欢迎使用AI编程工具</h1>
        <p>这是一个示例HTML文件。</p>
        <button id="clickBtn">点击我</button>
        <div id="output"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
                    modified: new Date('2024-01-15T10:30:00'),
                    isReadOnly: false
                  },
                  {
                    id: '2',
                    name: 'style.css',
                    path: '/style.css',
                    type: 'file',
                    extension: 'css',
                    content: `.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

h1 {
    color: #2563eb;
    text-align: center;
    margin-bottom: 20px;
}

p {
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 20px;
}

button {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background-color: #2563eb;
}

#output {
    margin-top: 20px;
    padding: 15px;
    background-color: #f3f4f6;
    border-radius: 5px;
    min-height: 50px;
}`,
                    modified: new Date('2024-01-15T10:25:00'),
                    isReadOnly: false
                  },
                  {
                    id: '3',
                    name: 'script.js',
                    path: '/script.js',
                    type: 'file',
                    extension: 'js',
                    content: `// 获取页面元素
const button = document.getElementById('clickBtn');
const output = document.getElementById('output');

// 显示初始消息
if (output) {
    output.innerHTML = '<p>页面已加载完成，点击上方按钮查看效果。</p>';
}

// 设置按钮点击事件
if (button && output) {
    button.addEventListener('click', function() {
        const now = new Date();
        output.innerHTML = 
            '<h3>按钮被点击了！</h3>' +
            '<p>当前时间: ' + now.toLocaleString() + '</p>' +
            '<p>这是由JavaScript动态生成的内容。</p>';
        
        console.log('按钮点击事件触发', now);
    });
}

// 添加一些示例功能
function generateRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 每5秒改变标题颜色
setInterval(() => {
    const h1 = document.querySelector('h1');
    if (h1) {
        h1.style.color = generateRandomColor();
    }
}, 5000);`,
                    modified: new Date('2024-01-15T10:20:00'),
                    isReadOnly: false
                  },
                  {
                    id: '4',
                    name: 'README.md',
                    path: '/README.md',
                    type: 'file',
                    extension: 'md',
                    content: `# AI编程工具示例项目

这是一个简单的HTML/CSS/JavaScript项目示例，用于演示AI编程工具的功能。

## 文件说明

- \`index.html\` - 主要的HTML结构文件
- \`style.css\` - 样式文件，定义页面外观
- \`script.js\` - JavaScript逻辑文件，处理交互
- \`README.md\` - 项目说明文档

## 功能特点

1. 响应式设计
2. 交互式按钮
3. 动态内容生成
4. 颜色变化动画

## 使用方法

1. 在文件浏览器中选择任意文件进行查看和编辑
2. 修改文件内容后保存
3. 切换到HTML预览标签查看效果
4. 支持实时预览HTML、CSS、JavaScript的组合效果

## 技术栈

- HTML5
- CSS3
- Vanilla JavaScript
- 无外部依赖`,
                    modified: new Date('2024-01-15T10:15:00'),
                    isReadOnly: false
                  }
                ],
                selectedPath: '/index.html'
              }
            }
            break
          case 'code_generator':
            toolType = 'code_generation'
            toolParameters = { language: 'typescript', type: 'component' }
            break
          case 'project_analyzer':
            toolType = 'analysis'
            toolParameters = { target: 'project_structure' }
            break
          case 'performance_checker':
            toolType = 'analysis'
            toolParameters = { type: 'performance' }
            break
          case 'api_designer':
            toolType = 'api_request'
            toolParameters = { type: 'design' }
            break
          case 'database_optimizer':
            toolType = 'analysis'
            toolParameters = { target: 'database' }
            break
          case 'ui_designer':
            toolType = 'other'
            toolParameters = { type: 'ui_design' }
            break
          case 'component_generator':
            toolType = 'code_generation'
            toolParameters = { language: 'typescript', type: 'component' }
            break
          default:
            toolType = 'other'
            toolParameters = {}
        }
        
        const toolMessage: Message = {
          id: toolMessageId,
          sender: 'assistant',
          type: 'tool_call',
          content: { 
            tool_call: {
              id: generateId(),
              name: step.tool,
              type: toolType,
              status: 'running',
              parameters: toolParameters,
              metadata: toolMetadata
            }
          },
          timestamp: new Date(),
          status: 'delivered',
        }
        
        setMessages(prev => [...prev, toolMessage])
        
        // 模拟工具调用完成
        setTimeout(() => {
          const toolResult = getToolResult(step.tool)
          setMessages(prev => 
            prev.map(msg => 
              msg.id === toolMessageId 
                ? { 
                    ...msg, 
                    content: { 
                      tool_call: {
                        id: generateId(),
                        name: step.tool,
                        type: toolType,
                        status: 'success',
                        parameters: toolParameters,
                        ...(toolResult ? { result: toolResult } : {}),
                        metadata: toolMetadata,
                        duration: 1200 + Math.floor(Math.random() * 800),
                        startTime: new Date(Date.now() - 1500)
                      }
                    }
                  }
                : msg
            )
          )
          
          stepIndex++
          setTimeout(processNextStep, 300)
        }, 1500 + Math.random() * 1000) // 1.5-2.5秒的随机延迟
        
      } else if (step.type === 'text') {
        // 创建文本消息并开始流式回复
        const textMessageId = generateId()
        const textMessage: Message = {
          id: textMessageId,
          sender: 'assistant',
          type: 'text',
          content: { text: '' },
          timestamp: new Date(),
          status: 'pending',
        }
        
        setMessages(prev => [...prev, textMessage])
        
        // 设置流式回复的状态
        currentStreamRef.current = {
          messageId: textMessageId,
          fullContent: step.content,
          currentIndex: 0
        }
        
        // 开始流式回复，完成后继续下一步
        const streamForThisStep = () => {
          if (!currentStreamRef.current) return
          
          const { messageId, fullContent, currentIndex } = currentStreamRef.current
          
          if (currentIndex >= fullContent.length) {
            // 流式回复完成
            setMessages(prev => 
              prev.map(msg => 
                msg.id === messageId 
                  ? { ...msg, content: { text: fullContent }, status: 'delivered' as const }
                  : msg
              )
            )
            currentStreamRef.current = null
            
            // 继续下一步
            stepIndex++
            setTimeout(processNextStep, 800) // 增加间隔时间
            return
          }
          
          // 计算下一个chunk的结束位置
          const nextIndex = Math.min(currentIndex + chunkSize, fullContent.length)
          const partialContent = fullContent.slice(0, nextIndex)
          
          // 更新消息内容
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, content: { text: partialContent } }
                : msg
            )
          )
          
          // 更新当前索引
          currentStreamRef.current.currentIndex = nextIndex
          
          // 继续流式回复
          streamingTimeoutRef.current = setTimeout(streamForThisStep, streamDelay)
        }
        
        setTimeout(streamForThisStep, 500)
      }
    }
    
    processNextStep()
  }, [chunkSize, streamDelay])

  const sendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: generateId(),
      sender: 'user',
      type: 'text',
      content: { text: content },
      timestamp: new Date(),
      status: 'delivered',
      editable: true,
      deletable: true,
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // 模拟AI回复
    setTimeout(() => {
      simulateAIResponse(content)
    }, 300)
  }, [simulateAIResponse])

  const clearChat = useCallback(() => {
    stopStreaming()
    setMessages([])
  }, [stopStreaming])

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    stopStreaming,
    clearChat,
    deleteMessage,
  }
}
