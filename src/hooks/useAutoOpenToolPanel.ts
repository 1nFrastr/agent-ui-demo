import * as React from 'react'
import type { Message } from '@/types/chat'

export interface UseAutoOpenToolPanelOptions {
  /** 是否启用自动打开功能 */
  enabled?: boolean
  /** 需要自动打开的工具名称列表 */
  autoOpenTools?: string[]
  /** 自动打开面板的回调 */
  onAutoOpen?: (messageId: string, toolName: string) => void
}

export interface UseAutoOpenToolPanelReturn {
  /** 已处理的消息ID集合（用于调试或状态查看） */
  processedMessageIds: Set<string>
  /** 重置已处理的消息记录 */
  resetProcessedMessages: () => void
}

/**
 * 自动打开工具面板的自定义 Hook
 * 
 * 负责监听消息变化，当检测到指定的工具调用完成时自动触发打开面板
 * 
 * @param messages 消息列表
 * @param options 配置选项
 * @returns Hook 返回值
 */
export const useAutoOpenToolPanel = (
  messages: Message[],
  options: UseAutoOpenToolPanelOptions = {}
): UseAutoOpenToolPanelReturn => {
  const {
    enabled = true,
    autoOpenTools = ['file_browser'], // 默认只对 file_browser 自动打开
    onAutoOpen
  } = options

  // 使用 ref 记录已处理的消息ID，避免重复触发
  const processedMessageIdsRef = React.useRef<Set<string>>(new Set())

  // 重置已处理消息记录的函数
  const resetProcessedMessages = React.useCallback(() => {
    processedMessageIdsRef.current.clear()
  }, [])

  // 监听消息变化，检测需要自动打开的工具调用
  React.useEffect(() => {
    // 如果未启用自动打开功能，直接返回
    if (!enabled || !onAutoOpen) {
      return
    }

    // 查找所有已完成且需要自动打开的工具调用消息
    const targetMessages = messages.filter(msg => {
      // 必须是工具调用消息
      if (msg.type !== 'tool_call' || !msg.content.tool_call) {
        return false
      }

      const toolCall = msg.content.tool_call
      
      // 必须是指定的工具类型
      if (!autoOpenTools.includes(toolCall.name)) {
        return false
      }

      // 必须是成功完成状态
      if (toolCall.status !== 'success') {
        return false
      }

      // 必须是未处理过的消息
      if (processedMessageIdsRef.current.has(msg.id)) {
        return false
      }

      return true
    })

    // 处理新的目标消息
    targetMessages.forEach(msg => {
      // 标记为已处理
      processedMessageIdsRef.current.add(msg.id)
      
      // 触发自动打开回调
      const toolName = msg.content.tool_call!.name
      onAutoOpen(msg.id, toolName)
      
      // 可选：添加调试日志
      if (import.meta.env.DEV) {
        console.log(`[useAutoOpenToolPanel] Auto opening panel for ${toolName} tool (message: ${msg.id})`)
      }
    })
  }, [messages, enabled, autoOpenTools, onAutoOpen])

  return {
    processedMessageIds: processedMessageIdsRef.current,
    resetProcessedMessages
  }
}