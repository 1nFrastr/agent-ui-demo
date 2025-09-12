# AI编程Agent Tool Panel 设计文档 (简化版本)

## 概述

基于参考图片的AI编程界面，设计一个用于AI编程agent的工具面板组件，主要包含HTML Live Preview和File Browser两个核心功能模块。采用Tab切换方式，简化布局和实现复杂度。

## 需求分析

### 核心功能
1. **HTML Live Preview** - 原生前端代码预览
   - 实时预览HTML/CSS/JavaScript代码
   - 仅支持原生HTML/CSS/JS，不支持前端框架
   - 支持代码修改后手动刷新预览
   - 基础的iframe沙箱环境

2. **File Browser** - 文件浏览器
   - 简单的文件列表展示
   - 支持文件选择和内容预览
   - 基础的文件编辑功能
   - 只读/编辑模式切换
   - 基础文件类型识别

### 布局设计
简化的Tab切换布局：
- Tab导航：文件浏览器 | HTML预览
- 一次只显示一个面板
- 不支持面板大小调整
- 响应式布局适配

## 技术选型

### 基础框架
- **React 18+** - 已有依赖
- **TypeScript** - 已有配置
- **TailwindCSS** - 已有样式系统
- **Radix UI** - 已有UI组件基础

### 新增依赖包 (最小化)

#### 1. Tab组件 (可选)
```bash
# 使用已有的Radix UI Tabs
# 无需额外安装，已包含在@radix-ui/react-*中
```

#### 2. 简单文本编辑器 (可选)
```bash
# 轻量级代码编辑器
pnpm add @uiw/react-textarea-code-editor

# 或者直接使用原生textarea + 语法高亮
pnpm add react-syntax-highlighter  # 已有依赖
```

#### 3. 文件图标 (可选)
```bash
# 已有lucide-react，使用内置文件图标即可
# 无需额外安装
```

## 组件架构设计

### 目录结构 (简化版本)
```
src/components/tool-panel/
├── index.ts                     # 导出文件
├── ToolPanel.tsx               # 主容器组件(Tab布局)
├── file-browser/               # 文件浏览器模块
│   ├── index.ts
│   ├── FileBrowser.tsx         # 文件浏览器主组件
│   ├── FileList.tsx            # 简单文件列表组件
│   ├── FileItem.tsx            # 文件项组件
│   └── FileEditor.tsx          # 简单文件编辑器
├── html-preview/               # HTML预览模块
│   ├── index.ts
│   ├── HtmlPreview.tsx         # HTML预览主组件
│   ├── PreviewFrame.tsx        # 预览iframe组件
│   └── PreviewControls.tsx     # 刷新按钮等控制组件
└── types.ts                    # 类型定义
```

### 核心组件设计

#### 1. ToolPanel 主组件 (简化版本)
```typescript
interface ToolPanelProps {
  // 基础配置
  className?: string
  defaultTab?: 'files' | 'preview'
  
  // 文件系统配置
  files?: SimpleFileSystem
  readOnly?: boolean
  onFilesChange?: (files: SimpleFileSystem) => void
  
  // 回调函数
  onFileSelect?: (file: SimpleFile) => void
  onFileEdit?: (file: SimpleFile, content: string) => void
}
```

#### 2. FileBrowser 组件 (简化版本)
```typescript
interface FileBrowserProps {
  files: SimpleFileSystem
  readOnly?: boolean
  selectedFile?: string
  
  // 回调
  onFileSelect?: (file: SimpleFile) => void
  onFileEdit?: (path: string, content: string) => void
}
```

#### 3. HtmlPreview 组件 (简化版本)
```typescript
interface HtmlPreviewProps {
  // 代码内容
  htmlContent?: string
  cssContent?: string
  jsContent?: string
  
  // 预览配置
  sandboxed?: boolean
  
  // 回调
  onRefresh?: () => void
  onError?: (error: Error) => void
}
```

## 数据模型设计 (简化版本)

### 文件系统类型
```typescript
interface SimpleFile {
  id: string
  name: string
  path: string
  type: 'file' | 'folder'
  content?: string
  modified?: Date
  children?: SimpleFile[]
  
  // 简化的元数据
  extension?: string
  isReadOnly?: boolean
}

interface SimpleFileSystem {
  files: SimpleFile[]
  selectedPath?: string
}
```

### 预览状态类型 (简化版本)
```typescript
interface SimplePreviewState {
  isLoading: boolean
  error?: string
  lastUpdate: Date
  
  // 预览内容 (合并的HTML)
  combinedHtml?: string
}
```

## 实现策略 (简化版本)

### Phase 1: 基础Tab布局
1. 创建ToolPanel主组件，使用Radix UI Tabs
2. 实现文件浏览器和HTML预览的Tab切换
3. 创建基础类型定义

### Phase 2: 文件浏览器 (简化)
1. 实现简单的文件列表组件
2. 添加文件选择功能
3. 实现基础文件编辑器（使用textarea）
4. 添加只读/编辑模式切换

### Phase 3: HTML预览 (简化)
1. 实现基础iframe预览
2. 添加手动刷新功能
3. 实现HTML/CSS/JS内容合并
4. 基础错误处理

### Phase 4: 集成
1. 文件编辑与预览的基础联动
2. 基础主题适配
3. 简单的错误处理

## 安全考虑 (简化版本)

### 代码执行安全
1. **基础沙箱**: 使用iframe sandbox属性
2. **内容限制**: 基础的HTML内容过滤
3. **错误捕获**: 简单的JavaScript错误捕获

### 文件系统安全
1. **路径验证**: 基础的文件路径验证
2. **文件类型**: 限制为HTML/CSS/JS/TXT文件类型
3. **大小限制**: 基础的文件大小限制

## 性能优化策略 (简化版本)

### 基础优化
1. **懒加载**: 仅在需要时加载文件内容
2. **防抖处理**: 编辑器输入防抖
3. **缓存**: 简单的文件内容缓存

### 内存管理
1. **组件卸载**: 及时清理事件监听器
2. **文件限制**: 限制同时打开的文件数量

## 可访问性设计 (简化版本)

### 基础可访问性
1. **Tab导航**: 支持键盘Tab导航
2. **ARIA标签**: 基础的ARIA属性支持
3. **语义化HTML**: 使用正确的HTML语义元素

## 主题和定制 (简化版本)

### 基础主题支持
1. **亮色/暗色主题**: 跟随系统主题
2. **基础定制**: 基于TailwindCSS的主题变量

---

这个简化版本的设计文档专注于最小可行产品(MVP)的实现，去除了复杂的功能和依赖，便于快速开发和验证核心功能。