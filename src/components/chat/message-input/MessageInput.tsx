import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { Send, Paperclip, Mic, Square } from 'lucide-react'

export interface MessageInputProps {
  /** 输入框的值 */
  value?: string
  /** 输入框占位符文本 */
  placeholder?: string
  /** 是否禁用输入框 */
  disabled?: boolean
  /** 是否正在发送消息 */
  isLoading?: boolean
  /** 是否多行输入 */
  multiline?: boolean
  /** 最大行数（仅在多行模式下有效） */
  maxRows?: number
  /** 输入框变化回调 */
  onChange?: (value: string) => void
  /** 发送消息回调 */
  onSend?: (message: string) => void
  /** 键盘事件回调 */
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void
  /** 文件上传回调 */
  onFileUpload?: (files: FileList) => void
  /** 语音输入回调 */
  onVoiceInput?: () => void
  /** 停止当前操作回调 */
  onStop?: () => void
  /** 自定义类名 */
  className?: string
}

const MessageInputComponent = React.forwardRef<HTMLDivElement, MessageInputProps>(
  (
    {
      value = '',
      placeholder = '输入消息...',
      disabled = false,
      isLoading = false,
      multiline = true,
      maxRows = 8,
      onChange,
      onSend,
      onKeyDown,
      onFileUpload,
      onVoiceInput,
      onStop,
      className,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const currentValue = value !== undefined ? value : internalValue

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])

    // 自动调整文本框高度 - 优化依赖项
    React.useEffect(() => {
      if (multiline && textareaRef.current) {
        const textarea = textareaRef.current
        textarea.style.height = 'auto'
        const scrollHeight = textarea.scrollHeight
        const maxHeight = parseFloat(getComputedStyle(textarea).lineHeight) * maxRows
        textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
      }
    }, [currentValue, multiline, maxRows])

    const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      onChange?.(newValue)
    }, [onChange])

    const handleSend = React.useCallback(() => {
      const trimmedValue = currentValue.trim()
      if (trimmedValue && !disabled && !isLoading) {
        onSend?.(trimmedValue)
        if (value === undefined) {
          setInternalValue('')
        }
        onChange?.('')
      }
    }, [currentValue, disabled, isLoading, onSend, value, onChange])

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      onKeyDown?.(e)
      
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        handleSend()
      }
    }, [onKeyDown, handleSend])

    const handleFileUpload = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        onFileUpload?.(files)
      }
      // 清空文件input的值，以便可以重复选择同一个文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }, [onFileUpload])

    const canSend = currentValue.trim().length > 0 && !disabled && !isLoading

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-end gap-2 p-4 border-t border-border bg-background',
          className
        )}
      >
        {/* 文件上传按钮 */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          disabled={disabled || isLoading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        {/* 输入框容器 */}
        <div className="flex-1 relative">
          {multiline ? (
            <textarea
              ref={textareaRef}
              value={currentValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'w-full resize-none rounded-lg border border-input bg-background px-3 py-2',
                'text-sm placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'min-h-[40px] max-h-none overflow-y-auto'
              )}
              rows={1}
            />
          ) : (
            <input
              type="text"
              value={currentValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'w-full rounded-lg border border-input bg-background px-3 py-2',
                'text-sm placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
          )}
        </div>

        {/* 语音输入按钮 */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          disabled={disabled || isLoading}
          onClick={onVoiceInput}
        >
          <Mic className="h-4 w-4" />
        </Button>

        {/* 发送/停止按钮 */}
        {isLoading ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={onStop}
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            className="shrink-0"
            disabled={!canSend}
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }
)

MessageInputComponent.displayName = 'MessageInput'

// 使用 React.memo 优化性能
const MessageInput = React.memo(MessageInputComponent)

export { MessageInput }
