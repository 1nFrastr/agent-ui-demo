import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { 
  X, 
  FileEdit, 
  Terminal, 
  Code, 
  Search, 
  BarChart3, 
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Play
} from 'lucide-react'
import type { ToolCallDetails, ToolCallType } from '@/types/chat'

interface ToolDetailsPanelProps {
  /** 工具调用详情 */
  toolDetails: ToolCallDetails | null
  /** 是否显示面板 */
  isOpen: boolean
  /** 关闭面板回调 */
  onClose: () => void
  /** 自定义类名 */
  className?: string
}

// 安全的值转换函数
const safeStringify = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value === null || value === undefined) return ''
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

// 获取工具类型对应的图标
const getToolIcon = (type: ToolCallType) => {
  switch (type) {
    case 'file_operation':
      return FileEdit
    case 'terminal_command':
      return Terminal
    case 'code_generation':
      return Code
    case 'search':
      return Search
    case 'analysis':
      return BarChart3
    case 'api_request':
      return Globe
    default:
      return Play
  }
}

// 获取状态图标和颜色
const getStatusConfig = (status: ToolCallDetails['status']) => {
  switch (status) {
    case 'running':
      return {
        icon: Loader2,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        label: '运行中'
      }
    case 'success':
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        label: '成功'
      }
    case 'error':
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        label: '失败'
      }
  }
}

// 文件操作详情组件
const FileOperationDetails: React.FC<{ details: ToolCallDetails }> = ({ details }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4">
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <FileEdit className="h-4 w-4" />
          操作详情
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">文件路径:</span>
            <span className="font-mono text-xs">{safeStringify(details.parameters?.filePath)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">操作类型:</span>
            <span>{safeStringify(details.parameters?.operation)}</span>
          </div>
        </div>
      </div>
      
      {details.result && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">执行结果</h4>
          <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
            {details.result}
          </pre>
        </div>
      )}
    </div>
  </div>
)

// 终端命令详情组件
const TerminalCommandDetails: React.FC<{ details: ToolCallDetails }> = ({ details }) => (
  <div className="space-y-4">
    <div className="p-4 bg-muted/50 rounded-lg">
      <h4 className="font-medium mb-2 flex items-center gap-2">
        <Terminal className="h-4 w-4" />
        命令详情
      </h4>
      <div className="space-y-3">
        <div>
          <span className="text-sm text-muted-foreground block mb-1">执行命令:</span>
          <code className="block p-2 bg-background rounded text-sm font-mono">
            {safeStringify(details.parameters?.command)}
          </code>
        </div>
        
        {details.parameters?.workingDirectory ? (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">工作目录:</span>
            <span className="font-mono text-xs">{safeStringify(details.parameters.workingDirectory)}</span>
          </div>
        ) : null}
      </div>
    </div>

    {details.result && (
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">输出结果</h4>
        <pre className="text-xs bg-background p-3 rounded border overflow-x-auto max-h-64">
          {details.result}
        </pre>
      </div>
    )}
  </div>
)

// 代码生成详情组件
const CodeGenerationDetails: React.FC<{ details: ToolCallDetails }> = ({ details }) => (
  <div className="space-y-4">
    <div className="p-4 bg-muted/50 rounded-lg">
      <h4 className="font-medium mb-2 flex items-center gap-2">
        <Code className="h-4 w-4" />
        生成详情
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">语言:</span>
          <span>{safeStringify(details.parameters?.language)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">类型:</span>
          <span>{safeStringify(details.parameters?.type)}</span>
        </div>
      </div>
    </div>

    {details.result && (
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">生成的代码</h4>
        <pre className="text-xs bg-background p-3 rounded border overflow-x-auto max-h-64">
          <code>{details.result}</code>
        </pre>
      </div>
    )}
  </div>
)

// 通用详情组件
const GenericDetails: React.FC<{ details: ToolCallDetails }> = ({ details }) => (
  <div className="space-y-4">
    {details.parameters && Object.keys(details.parameters).length > 0 && (
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">参数</h4>
        <div className="space-y-2">
          {Object.entries(details.parameters).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{key}:</span>
              <span className="font-mono text-xs max-w-48 truncate">
                {safeStringify(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}

    {details.result && (
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">结果</h4>
        <pre className="text-xs bg-background p-3 rounded border overflow-x-auto max-h-64">
          {details.result}
        </pre>
      </div>
    )}
  </div>
)

export const ToolDetailsPanel: React.FC<ToolDetailsPanelProps> = ({
  toolDetails,
  isOpen,
  onClose,
  className
}) => {
  if (!isOpen || !toolDetails) {
    return null
  }

  const ToolIcon = getToolIcon(toolDetails.type)
  const statusConfig = getStatusConfig(toolDetails.status)
  const StatusIcon = statusConfig.icon

  // 渲染详情内容
  const renderDetailsContent = () => {
    switch (toolDetails.type) {
      case 'file_operation':
        return <FileOperationDetails details={toolDetails} />
      case 'terminal_command':
        return <TerminalCommandDetails details={toolDetails} />
      case 'code_generation':
        return <CodeGenerationDetails details={toolDetails} />
      default:
        return <GenericDetails details={toolDetails} />
    }
  }

  return (
    <div className={cn('h-full bg-background', className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ToolIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{toolDetails.name}</h3>
          </div>
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
            statusConfig.bgColor
          )}>
            <StatusIcon className={cn('h-3 w-3', statusConfig.color, {
              'animate-spin': toolDetails.status === 'running'
            })} />
            <span className={statusConfig.color}>{statusConfig.label}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 内容区域 */}
      <div className="p-4 overflow-y-auto">
        {/* 基本信息 */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">基本信息</h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">工具ID:</span>
              <span className="font-mono text-xs">{toolDetails.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">类型:</span>
              <span>{toolDetails.type}</span>
            </div>
            {toolDetails.duration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">执行时间:</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {toolDetails.duration}ms
                </span>
              </div>
            )}
            {toolDetails.startTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">开始时间:</span>
                <span className="text-xs">
                  {toolDetails.startTime.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 详细内容 */}
        {renderDetailsContent()}

        {/* 错误信息 */}
        {toolDetails.error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              错误信息
            </h4>
            <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">
              {toolDetails.error}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}