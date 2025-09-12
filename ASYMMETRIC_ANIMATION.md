# 不对称动画优化

## 🎬 动画时长调整

### 优化策略
- **展开动画**：快速响应（300ms）
- **收起动画**：舒缓过渡（500ms）

## 🚀 实现方式

### 条件动画类
```tsx
// 对话区域
className={cn(
  'flex flex-col ease-in-out',
  isToolDetailsPanelOpen 
    ? 'w-1/3 min-w-0 ml-0 transition-all duration-300' // 展开：快
    : 'w-full max-w-4xl mx-auto transition-all duration-500' // 收起：慢
)}

// 详情面板
className={cn(
  'ease-in-out overflow-hidden border-l border-border',
  isToolDetailsPanelOpen 
    ? 'w-2/3 opacity-100 transition-all duration-300' // 展开：快
    : 'w-0 opacity-0 transition-all duration-500' // 收起：慢
)}
```

## 🎯 用户体验优化

### 展开时（300ms）- 快速响应
✅ **即时反馈**：用户点击后立即看到变化
✅ **高效感**：快速展示工具详情信息
✅ **响应式**：符合用户对点击操作的期待

### 收起时（500ms）- 舒缓过渡
✅ **优雅退出**：给用户时间适应布局变化
✅ **视觉连续性**：平滑回到原始状态
✅ **防误操作**：较慢的收起避免意外触发

## 🧠 心理学原理

### 展开快的原因
- 用户主动请求信息，期望快速得到响应
- 信息展示操作应该是即时的
- 符合"点击-立即反馈"的交互模式

### 收起慢的原因
- 收起通常是结束操作，不需要急迫感
- 给用户充分时间确认操作结果
- 较慢的动画更优雅，体验更舒适

## ⚡ 性能考虑

- 两种动画时长都在用户感知的合理范围内
- 300ms: 快速但不突兀
- 500ms: 舒缓但不拖沓
- 使用CSS transitions，性能优秀

## 🎮 实际效果

**用户操作流程**：
1. 点击"查看详情" → 300ms快速展开
2. 查看工具信息 → 获得即时反馈
3. 点击关闭按钮 → 500ms优雅收起
4. 回到对话界面 → 平滑的视觉过渡

这种不对称的动画设计让界面既响应迅速又优雅舒适！