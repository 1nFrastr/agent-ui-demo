# Copilot 全局指令 - Agent对话UI库

## 项目概述
这是一个基于现代Web技术栈构建的Agent对话界面UI库，提供优雅、可复用的对话组件和交互体验。

## 技术栈要求

### 开发环境
- **操作系统**: Windows 10/11
- **终端**: 优先使用Git Bash，确保Linux风格的命令行体验
- **路径格式**: 使用正斜杠(/)的Linux风格路径，避免Windows反斜杠(\)
- **编辑器**: VS Code + 相关扩展

### 核心框架
- **React 18+**: 使用函数组件和Hooks
- **TypeScript**: 严格类型检查，提供完整的类型定义
- **Vite**: 构建工具和开发服务器

### 包管理器
- **pnpm**: 使用pnpm作为包管理器，不使用npm或yarn

### UI组件库
- **Radix UI**: 作为无样式组件基础，提供可访问性支持
  - 优先使用 `@radix-ui/react-*` 组件
  - 确保组件符合WAI-ARIA标准
- **Lucide React**: 图标库，使用 `lucide-react` 包
- **TailwindCSS**: 样式系统
  - 使用工具类优先的方法
  - 配置自定义颜色和间距
  - 支持暗色主题

### 状态管理
- **Zustand**: 轻量级状态管理（如需要）
- **React Context**: 用于主题和全局配置

## 代码规范

### 组件开发
1. **组件结构**:
   ```typescript
   interface ComponentProps {
     // 明确的props类型定义
   }
   
   export const Component: React.FC<ComponentProps> = ({ ...props }) => {
     // 组件逻辑
     return (
       // JSX结构
     );
   };
   ```

2. **文件命名和路径**:
   - 组件文件使用PascalCase: `ChatMessage.tsx`
   - Hook文件使用camelCase: `useChat.ts`
   - 工具函数文件使用camelCase: `formatTime.ts`
   - 所有import路径使用正斜杠: `import { Button } from '@/components/ui/button'`
   - 避免使用Windows风格反斜杠路径

3. **导出规范**:
   - 使用命名导出而非默认导出
   - 在index.ts中统一导出所有公共组件
   - 路径别名配置使用正斜杠格式

### 样式规范
1. **TailwindCSS使用**:
   - 优先使用Tailwind工具类
   - 复杂样式使用 `@apply` 指令
   - 响应式设计使用断点前缀

2. **主题系统**:
   - 支持亮色/暗色主题切换
   - 使用CSS变量定义颜色方案
   - 遵循设计系统的间距和字体规范

3. **动画效果**:
   - 使用Tailwind动画类
   - 适当使用CSS transitions
   - 考虑减弱动画偏好设置

## 组件架构

### 核心组件结构
```
src/
├── components/
│   ├── ui/              # 基础UI组件（基于Radix UI）
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Avatar/
│   │   └── ...
│   ├── chat/            # 对话相关组件
│   │   ├── ChatContainer/
│   │   ├── ChatMessage/
│   │   ├── ChatInput/
│   │   ├── MessageList/
│   │   └── ...
│   └── layout/          # 布局组件
├── hooks/               # 自定义Hooks
├── types/               # TypeScript类型定义
├── utils/               # 工具函数
├── styles/              # 全局样式和主题
└── stories/             # Storybook故事文件
```

### 组件设计原则
1. **可组合性**: 每个组件都应该是可独立使用和组合的
2. **可定制性**: 提供丰富的props来定制外观和行为
3. **可访问性**: 遵循WCAG指南，支持键盘导航和屏幕阅读器
4. **响应式**: 在不同设备和屏幕尺寸下都能良好工作
5. **性能优化**: 使用React.memo、useMemo等优化渲染性能

## 开发要求

### 开发环境配置
- **终端优先级**: Git Bash > PowerShell > CMD
- **路径规范**: 始终使用正斜杠(/)路径格式，如 `src/components/ui/button`
- **脚本执行**: 在Git Bash中执行所有npm/pnpm脚本和构建命令
- **文件操作**: 使用Linux风格的文件操作命令（ls, mkdir, rm等）

### 代码质量
- 使用ESLint和Prettier进行代码格式化
- 编写单元测试（使用Vitest和Testing Library）
- 提供Storybook文档和示例
- 所有路径引用使用正斜杠格式

### 包管理
- 使用pnpm workspace管理依赖
- 遵循语义化版本控制
- 定期更新依赖包到最新稳定版本
- 在Git Bash中执行pnpm命令

### Git规范
- 使用Git Bash作为主要Git操作终端
- 使用Conventional Commits规范提交消息
- 功能分支开发，通过PR合并
- 代码审查和自动化测试通过后才能合并
- 确保.gitignore使用正确的路径分隔符

## 特定功能要求

### 对话功能
1. **消息类型支持**:
   - 文本消息
   - 代码块（支持语法高亮）
   - 图片消息
   - 文件消息
   - 系统通知

2. **交互功能**:
   - 消息发送和接收
   - 消息状态显示（发送中、已送达、失败）
   - 消息重试机制
   - 消息编辑和删除
   - 消息复制和分享

3. **UI特性**:
   - 平滑滚动和自动滚动到底部
   - 消息气泡动画
   - 打字指示器
   - 加载状态
   - 错误处理和重试

### 主题和定制
1. **主题系统**:
   - 预设的亮色和暗色主题
   - 自定义主题配置
   - 主题切换动画

2. **定制选项**:
   - 可配置的颜色方案
   - 可调整的组件尺寸
   - 自定义字体和间距

## 示例用法
```typescript
import { ChatContainer, ChatMessage, ChatInput } from '@your-org/agent-ui';

function App() {
  return (
    <ChatContainer>
      <ChatMessage 
        type="user" 
        content="Hello, how can I help you today?"
        timestamp={new Date()}
      />
      <ChatMessage 
        type="assistant" 
        content="I'm here to help! What would you like to know?"
        timestamp={new Date()}
      />
      <ChatInput 
        onSendMessage={(message) => console.log(message)}
        placeholder="Type your message..."
      />
    </ChatContainer>
  );
}
```

## Windows开发环境特殊要求

### 终端和命令行
1. **首选终端**: Git Bash
   - 提供Linux风格的命令行环境
   - 支持标准的Unix命令（ls, cat, grep等）
   - 更好的pnpm和npm脚本兼容性

2. **备选终端**: PowerShell
   - 如果Git Bash不可用时使用
   - 确保路径使用正斜杠格式

3. **避免使用**: CMD命令提示符
   - 兼容性差，不推荐用于现代Web开发

### 路径处理规范
1. **文件路径格式**:
   ```typescript
   // ✅ 正确 - 使用正斜杠
   import { Button } from '@/components/ui/button'
   import './styles/globals.css'
   
   // ❌ 错误 - 避免反斜杠
   import { Button } from '@\\components\\ui\\button'
   ```

2. **配置文件路径**:
   ```javascript
   // vite.config.ts - 正确示例
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     },
   }
   ```

3. **脚本路径**:
   ```json
   // package.json - 使用正斜杠
   {
     "scripts": {
       "build": "vite build",
       "dev": "vite --host 0.0.0.0"
     }
   }
   ```

### Git配置建议
```bash
# 在Git Bash中设置核心配置
git config --global core.autocrlf false
git config --global core.eol lf
git config --global init.defaultBranch main
```

## 注意事项
- 始终考虑组件的可访问性
- 保持API设计的一致性
- 优先考虑性能和用户体验
- 编写清晰的文档和示例
- 遵循语义化HTML结构
- 支持国际化（i18n）预留接口
- **Windows开发**: 统一使用Git Bash和正斜杠路径格式

---
*此指令文件定义了Agent对话UI库的开发标准和要求，请在开发过程中严格遵循。*
