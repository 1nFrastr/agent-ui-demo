/**
 * 消息发送者类型
 */
export type MessageSender = 'user' | 'assistant' | 'system'

/**
 * 消息状态
 */
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed'

/**
 * 消息类型
 */
export type MessageType = 'text' | 'code' | 'image' | 'file' | 'system' | 'tool_call'

/**
 * 工具调用状态
 */
export type ToolCallStatus = 'running' | 'success' | 'error'

/**
 * 工具调用类型
 */
export type ToolCallType = 
  | 'file_operation'      // 文件操作
  | 'terminal_command'    // 终端命令
  | 'code_generation'     // 代码生成
  | 'api_request'         // API请求
  | 'search'              // 搜索
  | 'analysis'            // 分析
  | 'web_search'          // 网页搜索
  | 'web_content'         // 网页读取
  | 'other'               // 其他

/**
 * 网页搜索结果项
 */
export interface WebSearchResultItem {
  /** 网页标题 */
  title: string
  /** 网页链接 */
  url: string
  /** 网页概述/摘要 */
  summary: string
  /** 网站LOGO/图标URL */
  favicon?: string
  /** 网站域名 */
  domain?: string
}

/**
 * 网页搜索参数和结果
 */
export interface WebSearchData {
  /** 搜索关键词 */
  query: string
  /** 搜索结果列表 */
  results: WebSearchResultItem[]
  /** 搜索用时 */
  searchTime?: number
  /** 结果总数 */
  totalResults?: number
}

/**
 * 网页内容数据
 */
export interface WebContentData {
  /** 网页链接地址 */
  url: string
  /** 网页标题 */
  title: string
  /** 读取的内容 */
  content: string
  /** 提取的图片列表 */
  images?: Array<{
    url: string
    alt?: string
    width?: number
    height?: number
  }>
  /** 内容摘要 */
  summary?: string
  /** 网页元数据 */
  metadata?: {
    author?: string
    publishDate?: string
    description?: string
    keywords?: string[]
  }
  /** 读取状态 */
  status: 'success' | 'partial' | 'failed'
  /** 错误信息（如果读取失败） */
  error?: string
}

/**
 * 工具调用详细信息
 */
export interface ToolCallDetails {
  /** 工具调用ID */
  id: string
  /** 工具名称 */
  name: string
  /** 工具类型 */
  type: ToolCallType
  /** 工具状态 */
  status: ToolCallStatus
  /** 调用参数 */
  parameters?: Record<string, unknown>
  /** 执行结果 */
  result?: string
  /** 错误信息 */
  error?: string
  /** 执行时间 */
  duration?: number
  /** 开始时间 */
  startTime?: Date
  /** 结束时间 */
  endTime?: Date
  /** 工具描述 */
  description?: string
  /** 工具图标 */
  icon?: string
  /** 额外元数据 */
  metadata?: Record<string, unknown>
}

/**
 * 消息内容接口
 */
export interface MessageContent {
  /** 消息文本内容 */
  text?: string
  /** 代码内容和语言 */
  code?: {
    content: string
    language: string
  }
  /** 图片信息 */
  image?: {
    url: string
    alt?: string
    width?: number
    height?: number
  }
  /** 文件信息 */
  file?: {
    name: string
    url: string
    size: number
    type: string
  }
  /** 工具调用信息 */
  tool_call?: ToolCallDetails
}

/**
 * 消息接口
 */
export interface Message {
  /** 消息唯一标识 */
  id: string
  /** 消息发送者 */
  sender: MessageSender
  /** 消息类型 */
  type: MessageType
  /** 消息内容 */
  content: MessageContent
  /** 消息时间戳 */
  timestamp: Date
  /** 消息状态 */
  status: MessageStatus
  /** 是否可编辑 */
  editable?: boolean
  /** 是否可删除 */
  deletable?: boolean
  /** 消息元数据 */
  metadata?: Record<string, unknown>
}

/**
 * 对话会话接口
 */
export interface ChatSession {
  /** 会话ID */
  id: string
  /** 会话标题 */
  title: string
  /** 消息列表 */
  messages: Message[]
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 会话配置 */
  config?: ChatConfig
}

/**
 * 对话配置接口
 */
export interface ChatConfig {
  /** 是否显示时间戳 */
  showTimestamp?: boolean
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 是否支持代码高亮 */
  enableCodeHighlight?: boolean
  /** 自动滚动到底部 */
  autoScrollToBottom?: boolean
  /** 最大消息数量 */
  maxMessages?: number
  /** 主题模式 */
  theme?: 'light' | 'dark' | 'auto'
}

/**
 * 消息发送回调类型
 */
export type OnSendMessage = (content: string, type?: MessageType) => void | Promise<void>

/**
 * 消息操作回调类型
 */
export type OnMessageAction = (messageId: string, action: 'edit' | 'delete' | 'copy' | 'retry') => void | Promise<void>

/**
 * 打字状态接口
 */
export interface TypingStatus {
  /** 是否正在打字 */
  isTyping: boolean
  /** 打字用户/助手标识 */
  sender: MessageSender
  /** 打字文本预览 */
  preview?: string
}
