import * as React from 'react'
import { MarkdownRenderer } from '@/components/chat/markdown-renderer'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { Wrench, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react'
import type { Message } from '@/types/chat'

export interface ChatMessageProps {
  message: Message
  enableMarkdown?: boolean
  theme?: 'light' | 'dark'
  onToolDetailsClick?: (messageId: string) => void
  className?: string
}

export const ChatMessage = React.memo(React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message, enableMarkdown = true, theme = 'light', onToolDetailsClick, className }, ref) => {
    const isUser = message.sender === 'user'
    const isSystem = message.sender === 'system'

    if (isSystem) {
      return (
        <div
          ref={ref}
          className={cn('flex justify-center my-4', className)}
        >
          <div className="bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground">
            {message.content.text}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-3 group',
          isUser 
            ? 'flex-row-reverse max-w-4xl mx-auto px-4 py-4' 
            : 'flex-row max-w-none px-4 py-1', // AI消息减少垂直间距
          className
        )}
      >
                
        <div className={cn(
          'flex flex-col gap-1 flex-1', 
          isUser 
            ? 'items-end' 
            : 'items-start'
        )}>
          {/* 消息内容 */}
          <div
            className={cn(
              'break-words',
              isUser
                ? 'bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-2xl'
                : 'text-foreground w-full', // AI消息占满宽度
              message.status === 'failed' && 'border-destructive border'
            )}
          >
            {message.type === 'text' && message.content.text && (
              enableMarkdown ? (
                <MarkdownRenderer 
                  content={message.content.text} 
                  theme={theme}
                  className={cn(
                    "text-sm",
                    isUser ? "" : "prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted/50 prose-pre:border prose-blockquote:text-muted-foreground"
                  )}
                />
              ) : (
                <p className={cn(
                  "text-sm leading-relaxed whitespace-pre-wrap",
                  isUser ? "" : "text-foreground"
                )}>
                  {message.content.text}
                </p>
              )
            )}

            {message.type === 'tool_call' && message.content.tool_call && (
              <div className="flex items-center gap-1 p-1 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800 my-1">
                <div className="flex items-center gap-2 flex-1">
                  {message.content.tool_call.status === 'running' && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  {message.content.tool_call.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {message.content.tool_call.status === 'error' && (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Wrench className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {message.content.tool_call.status === 'running' && `正在调用 ${message.content.tool_call.name}...`}
                    {message.content.tool_call.status === 'success' && `已完成 ${message.content.tool_call.name}`}
                    {message.content.tool_call.status === 'error' && `调用 ${message.content.tool_call.name} 失败`}
                  </span>
                </div>
                
                {/* 查看详情按钮 */}
                {onToolDetailsClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToolDetailsClick(message.id)}
                    className="h-8 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/20"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    查看详情
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
))
