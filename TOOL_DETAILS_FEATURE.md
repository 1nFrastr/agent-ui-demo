# 工具调用详情功能实现

## 功能概述

这次实现了工具调用运行详情功能，主要包括以下特性：

1. **双窗格布局**：点击工具调用详情后，右侧打开详情面板，左侧对话区域自动调整为2/3宽度
2. **工具详情面板**：展示工具调用的完整信息，包括参数、结果、执行时间等
3. **多种工具类型支持**：针对不同工具类型（文件操作、终端命令、代码生成等）提供专门的展示布局

## 主要组件

### 1. ToolDetailsPanel 组件

位置：`src/components/chat/tool-details-panel/ToolDetailsPanel.tsx`

主要功能：
- 展示工具调用的基本信息（ID、类型、状态、执行时间）
- 根据工具类型渲染不同的详情内容
- 支持关闭面板功能
- 状态指示器（运行中、成功、失败）

支持的工具类型：
- `file_operation`: 文件操作（显示文件路径、操作类型）
- `terminal_command`: 终端命令（显示命令、工作目录、输出结果）
- `code_generation`: 代码生成（显示语言、类型、生成的代码）
- 其他类型：通用参数和结果显示

### 2. 扩展的 ChatInterface 组件

主要改进：
- 添加 `onToolDetailsClick` 回调属性
- 实现双窗格布局逻辑
- 左侧对话区域根据详情面板状态自动调整宽度
- 集成工具详情面板

### 3. 改进的 ChatMessage 组件

新增功能：
- 工具调用消息显示"查看详情"按钮
- 点击按钮触发详情面板打开
- 支持 `onToolDetailsClick` 回调

### 4. 扩展的类型定义

新增类型：
- `ToolCallType`: 工具调用类型枚举
- `ToolCallDetails`: 详细的工具调用信息接口
- 更新 `MessageContent.tool_call` 为使用新的详细类型

## 布局设计

### 宽度分配（新设计）
- **无详情面板时**：对话区域固定宽度居中显示 (max-width: 1024px)
- **有详情面板时**：
  - 对话区域：1/3 宽度，紧贴左侧（次要区域）
  - 工具详情面板：2/3 宽度，占据右侧主要空间（主要区域）
- 使用 Tailwind CSS 的 `transition-all duration-300` 实现平滑过渡

### 设计理念
- **工具详情面板为主**：当用户点击查看详情时，工具信息成为关注重点
- **对话区域为辅**：保持对话内容可见但不抢夺注意力
- **空间利用最大化**：工具详情面板获得更多空间展示复杂信息

### 视觉层次
- 详情面板与对话区域用边框分隔
- 工具状态用不同颜色和图标表示
- 参数和结果用代码块或卡片形式展示

## 示例数据

创建了 `ChatWithToolDetailsDemo` 组件，包含多种工具调用示例：

1. **终端命令示例**：
   ```
   工具: run_terminal_command
   命令: npm install @radix-ui/react-dialog
   状态: 成功
   ```

2. **文件操作示例**：
   ```
   工具: create_file
   文件: src/components/ui/dialog.tsx
   状态: 成功
   ```

3. **代码生成示例**：
   ```
   工具: generate_typescript_component
   语言: TypeScript
   状态: 运行中
   ```

## 使用方法

### 基础用法
```tsx
import { ChatInterface } from '@/components/chat'

function App() {
  const handleToolDetailsClick = (toolDetails: ToolCallDetails) => {
    console.log('工具详情:', toolDetails)
  }

  return (
    <ChatInterface
      messages={messages}
      onToolDetailsClick={handleToolDetailsClick}
      // ... 其他属性
    />
  )
}
```

### 完整演示
```tsx
import { ChatWithToolDetailsDemo } from '@/components/chat/ChatWithToolDetailsDemo'

function App() {
  return <ChatWithToolDetailsDemo />
}
```

## 技术亮点

1. **类型安全**：完整的 TypeScript 类型定义，确保类型安全
2. **组件化设计**：每个工具类型有独立的详情展示组件
3. **响应式布局**：自适应的双窗格布局
4. **用户体验**：平滑的过渡动画和直观的状态指示
5. **可扩展性**：易于添加新的工具类型支持

## 样式特性

- 使用 Tailwind CSS 的工具类优先方法
- 支持暗色主题
- 一致的颜色方案和间距
- 可访问性友好的设计

## 启动方式

在根目录运行：
```bash
pnpm dev
```

然后访问演示页面，点击"工具调用演示"按钮查看完整功能。

---

这个实现提供了一个完整的工具调用详情展示系统，用户可以通过点击工具调用消息的"查看详情"按钮来查看完整的执行信息，右侧详情面板会显示参数、结果、执行时间等详细信息。