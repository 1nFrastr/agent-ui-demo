import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { Copy, RotateCcw, Trash2, Edit3, User, Bot } from 'lucide-react'
import type { Message, OnMessageAction } from '@/types/chat'

export interface ChatMessageProps {
  message: Message
  showAvatar?: boolean
  showTimestamp?: boolean
  onAction?: OnMessageAction
  className?: string
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message, showAvatar = true, showTimestamp = true, onAction, className }, ref) => {
    const isUser = message.sender === 'user'
    const isSystem = message.sender === 'system'

    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    }

    const handleAction = (action: 'edit' | 'delete' | 'copy' | 'retry') => {
      onAction?.(message.id, action)
    }

    const copyToClipboard = async () => {
      if (message.content.text) {
        await navigator.clipboard.writeText(message.content.text)
        handleAction('copy')
      }
    }

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
          'flex gap-3 max-w-4xl mx-auto px-4 py-4 group',
          isUser ? 'flex-row-reverse' : 'flex-row',
          className
        )}
      >
        {showAvatar && (
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={isUser ? undefined : '/bot-avatar.png'} />
            <AvatarFallback>
              {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={cn('flex flex-col gap-1 flex-1', isUser ? 'items-end' : 'items-start')}>
          {/* 消息内容 */}
          <div
            className={cn(
              'rounded-lg px-4 py-2 max-w-2xl break-words',
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground',
              message.status === 'failed' && 'border-destructive border'
            )}
          >
            {message.type === 'text' && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content.text}
              </p>
            )}
            
            {message.type === 'code' && message.content.code && (
              <div className="bg-black/10 dark:bg-white/10 rounded p-3 my-2">
                <div className="text-xs text-muted-foreground mb-2">
                  {message.content.code.language}
                </div>
                <pre className="text-sm overflow-x-auto">
                  <code>{message.content.code.content}</code>
                </pre>
              </div>
            )}
          </div>

          {/* 时间戳和操作按钮 */}
          <div className={cn(
            'flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}>
            {showTimestamp && (
              <span className="text-xs text-muted-foreground">
                {formatTime(message.timestamp)}
              </span>
            )}

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyToClipboard}
              >
                <Copy className="h-3 w-3" />
              </Button>

              {message.status === 'failed' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleAction('retry')}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}

              {message.editable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleAction('edit')}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}

              {message.deletable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => handleAction('delete')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

ChatMessage.displayName = 'ChatMessage'

export { ChatMessage }
