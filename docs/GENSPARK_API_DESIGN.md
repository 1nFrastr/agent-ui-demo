# Agent对话UI数据结构设计文档

## 概述

本文档详细描述了Agent对话UI系统中的输入输出数据结构设计。该系统采用请求-响应模式，其中请求为完整的JSON配置，响应为Server-Sent Events (SSE)流式数据。

## 输入数据结构 (Input)

### 文件示例
`genspark-agent-input.json`

### 数据结构概览

```typescript
interface AgentRequest {
  // 核心配置
  models: string[];                    // AI模型列表
  type: string;                       // 服务类型
  project_id: string;                 // 项目唯一标识
  
  // 功能开关
  run_with_another_model: boolean;    // 是否使用其他模型
  request_web_knowledge: boolean;     // 是否请求网络知识
  speed_mode: boolean;                // 是否启用速度模式
  use_webpage_capture_screen: boolean; // 是否使用网页截图
  use_browser_use: boolean;           // 是否使用浏览器工具
  use_python_workspace: boolean;      // 是否使用Python工作空间
  use_browser_use_test_mode: boolean; // 浏览器测试模式
  use_terminal_use: boolean;          // 是否使用终端
  dataframe_enhanced: boolean;        // 数据框增强功能
  enable_jupyter: boolean;            // 是否启用Jupyter
  
  // 工具配置
  custom_tools: any[];                // 自定义工具列表
  
  // 内容相关
  writingContent: string | null;      // 写作内容
  
  // 对话历史
  messages: Message[];                // 消息列表
}
```

### 消息结构 (Message)

```typescript
interface Message {
  id: string;                         // 消息唯一标识
  role: "user" | "assistant" | "tool"; // 角色类型
  content: string;                    // 消息内容
  thinking: boolean;                  // 是否为思考过程
  project_id?: string;                // 关联项目ID
  
  // 工具调用相关
  tool_calls?: ToolCall[];            // 工具调用列表
  tool_call_id?: string;              // 工具调用ID
  
  // 元数据
  action?: any;                       // 动作信息
  recommend_actions?: any;            // 推荐动作
  is_prompt?: boolean;                // 是否为提示
  render_template?: any;              // 渲染模板
  session_state?: any;                // 会话状态
  message_type?: string;              // 消息类型
  thinking_blocks?: any;              // 思考块
  response_id?: string;               // 响应ID
  reasoning_id?: string;              // 推理ID
  reasoning_encrypted_content?: any;   // 加密推理内容
  cogen_id?: string;                  // 协同生成ID
  _updatetime?: string;               // 更新时间
}
```

### 工具调用结构 (ToolCall)

```typescript
interface ToolCall {
  id: string;                         // 工具调用唯一标识
  type: "function";                   // 调用类型
  function: {
    name: string;                     // 函数名称
    arguments: string;                // 函数参数（JSON字符串）
  };
}
```

## 输出数据结构 (Output)

### 文件示例
`genspark-agent-resp.json`

### SSE流式响应格式

输出采用Server-Sent Events格式，每行以`data:`开头，包含一个JSON对象。

### 事件类型 (Event Types)

#### 1. message_field - 字段更新事件
更新消息的特定字段值。

```typescript
interface MessageFieldEvent {
  message_id: string;                 // 目标消息ID
  field_name: string;                 // 字段名称（如"_updatetime", "content"）
  field_value: any;                   // 字段值
  type: "message_field";              // 事件类型
  project_id?: string;                // 项目ID
}
```

**示例：**
```json
data: {"message_id": "4287308d-1a23-413e-841a-acee433b495c", "field_name": "_updatetime", "field_value": "2025-09-14T09:58:10.009635", "type": "message_field"}
```

#### 2. message_start - 消息开始事件
标志新消息的开始。

```typescript
interface MessageStartEvent {
  message_id: string;                 // 新消息ID
  tool_call_id?: string;              // 工具调用ID（如果是工具响应）
  role: "user" | "assistant" | "tool"; // 消息角色
  project_id: string;                 // 项目ID
  type: "message_start";              // 事件类型
}
```

**示例：**
```json
data: {"message_id": "2483e3ee-7019-4433-920a-f0ab124af36c", "tool_call_id": null, "role": "assistant", "project_id": "4287308d-1a23-413e-841a-acee433b495c", "type": "message_start"}
```

#### 3. message_field_delta - 增量更新事件
用于流式构建字段内容，特别是文本内容的逐步生成。

```typescript
interface MessageFieldDeltaEvent {
  message_id: string;                 // 目标消息ID
  field_name: string;                 // 字段名称
  delta: string;                      // 增量内容
  project_id: string;                 // 项目ID
  type: "message_field_delta";        // 事件类型
}
```

**示例：**
```json
data: {"message_id": "aa8bc340-8ed7-434f-b34c-b9e3242532fd", "field_name": "content", "delta": "您说得非常对", "project_id": "4287308d-1a23-413e-841a-acee433b495c", "type": "message_field_delta"}
```

#### 4. message_result - 消息结果事件
包含完整的消息对象，标志消息构建完成。

```typescript
interface MessageResultEvent {
  message_id: string;                 // 消息ID
  message: Message;                   // 完整消息对象
  project_id: string;                 // 项目ID
  type: "message_result";             // 事件类型
}
```

### 流式处理模式

#### 工具调用构建流程
1. **创建工具调用结构**：
   ```json
   data: {"message_id": "xxx", "field_name": "tool_calls[0]", "field_value": {"function": {"name": "web_search", "arguments": null}, "type": "function", "id": "tooluse_xxx"}, "type": "message_field"}
   ```

2. **逐步构建参数**：
   ```json
   data: {"message_id": "xxx", "field_name": "tool_calls[0].function.arguments", "delta": "{\"q\":", "type": "message_field_delta"}
   data: {"message_id": "xxx", "field_name": "tool_calls[0].function.arguments", "delta": " \"OpenAI API\"}", "type": "message_field_delta"}
   ```

3. **完成工具调用**：
   ```json
   data: {"message_id": "xxx", "message": {完整消息对象}, "type": "message_result"}
   ```

#### 内容流式生成流程
```json
data: {"message_id": "xxx", "field_name": "content", "delta": "您", "type": "message_field_delta"}
data: {"message_id": "xxx", "field_name": "content", "delta": "说得", "type": "message_field_delta"}
data: {"message_id": "xxx", "field_name": "content", "delta": "很对", "type": "message_field_delta"}
```

## 工具系统设计

### 支持的工具类型

系统支持多种工具调用，包括但不限于：

- **web_search**: 网络搜索
- **crawler**: 网页爬虫
- **think**: 思考过程
- **terminal**: 终端操作
- **python**: Python代码执行
- **browser**: 浏览器操作

### 工具调用示例

```json
{
  "id": "tooluse_xGb2ATaiSHO0HFL_Oe3wrg",
  "type": "function",
  "function": {
    "name": "web_search",
    "arguments": "{\"q\": \"OpenAI API key 购买 中国用户 官方渠道 2024\"}"
  }
}
```

## 数据流处理建议

### 前端处理逻辑

```typescript
// SSE事件处理器
const eventSource = new EventSource('/api/chat/stream');

const messageMap = new Map<string, Message>();

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'message_start':
      // 初始化新消息
      messageMap.set(data.message_id, {
        id: data.message_id,
        role: data.role,
        content: '',
        // ...其他初始字段
      });
      break;
      
    case 'message_field':
      // 更新字段值
      const message = messageMap.get(data.message_id);
      if (message) {
        setNestedProperty(message, data.field_name, data.field_value);
      }
      break;
      
    case 'message_field_delta':
      // 增量更新字段
      const msg = messageMap.get(data.message_id);
      if (msg) {
        const currentValue = getNestedProperty(msg, data.field_name) || '';
        setNestedProperty(msg, data.field_name, currentValue + data.delta);
      }
      break;
      
    case 'message_result':
      // 消息完成
      messageMap.set(data.message_id, data.message);
      // 触发UI更新
      updateUI();
      break;
  }
};
```

### 状态管理建议

1. **消息状态追踪**：使用Map或对象来追踪每个消息的构建状态
2. **增量更新优化**：对于频繁的delta事件，考虑批量更新UI
3. **错误处理**：实现重连机制和错误恢复
4. **内存管理**：定期清理不需要的消息历史

## 设计优势

### 1. 实时性
- SSE流式输出支持实时展示AI思考和响应过程
- 用户可以看到工具调用的实时进展
- 支持打字机效果的文本生成

### 2. 可追溯性
- 每个消息和工具调用都有唯一ID
- 完整的时间戳记录
- 支持历史消息的精确定位

### 3. 模块化设计
- 工具调用与内容生成分离
- 思考过程可独立展示
- 支持多种消息类型并存

### 4. 可扩展性
- 灵活的工具系统
- 支持自定义工具
- 配置驱动的功能开关

### 5. 用户体验
- 流式响应提供更好的交互感
- 透明的AI推理过程
- 丰富的状态反馈

## 实现注意事项

### 1. 性能优化
- 避免过于频繁的UI更新
- 合理使用防抖/节流
- 考虑虚拟滚动处理大量消息

### 2. 错误处理
- SSE连接中断处理
- 消息解析错误处理
- 工具调用失败处理

### 3. 安全考虑
- 工具调用权限控制
- 敏感信息过滤
- 用户输入验证

### 4. 兼容性
- 浏览器SSE支持检测
- 降级方案（如轮询）
- 移动端适配

## 总结

这套数据结构设计通过SSE流式响应和详细的事件类型，实现了高度可定制的AI对话界面。它不仅支持传统的问答对话，还能展示复杂的AI推理过程、工具调用链路和实时状态更新，为构建现代化的AI应用提供了强大的数据基础。

---

*文档版本：1.0*  
*最后更新：2025年9月15日*  
*维护者：Agent UI Team*