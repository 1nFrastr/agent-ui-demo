import * as React from 'react'
import { ExternalLink, Globe, Image as ImageIcon, FileText, Calendar, User, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { ToolCallDetails, WebContentData } from '@/types/chat'

interface WebContentDetailsProps {
  details: ToolCallDetails
}

// 格式化日期
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

// 获取状态配置
const getStatusConfig = (status: WebContentData['status']) => {
  switch (status) {
    case 'success':
      return {
        icon: CheckCircle2,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        label: '读取成功'
      }
    case 'partial':
      return {
        icon: AlertTriangle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        label: '部分读取'
      }
    case 'failed':
      return {
        icon: AlertTriangle,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        label: '读取失败'
      }
  }
}

export const WebContentDetails: React.FC<WebContentDetailsProps> = ({ details }) => {
  const contentData = details.metadata?.contentData as WebContentData | undefined
  const url = contentData?.url || (details.parameters?.url as string) || ''
  const title = contentData?.title || ''
  const content = contentData?.content || details.result || ''
  const images = contentData?.images || []
  const metadata = contentData?.metadata
  const status = contentData?.status || 'success'
  const error = contentData?.error

  const statusConfig = getStatusConfig(status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-4">
      {/* 网页基本信息 */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          网页信息
        </h4>
        <div className="space-y-3">
          {/* URL */}
          <div>
            <span className="text-sm text-muted-foreground block mb-1">链接地址:</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 bg-background rounded border hover:bg-muted/50 transition-colors group"
            >
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-primary hover:underline group-hover:underline truncate">
                {url}
              </span>
              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </a>
          </div>
          
          {/* 标题 */}
          {title && (
            <div>
              <span className="text-sm text-muted-foreground block mb-1">页面标题:</span>
              <div className="p-2 bg-background rounded border">
                <span className="font-medium">{title}</span>
              </div>
            </div>
          )}
          
          {/* 读取状态 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">读取状态:</span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig.bgColor}`}>
              <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
              <span className={statusConfig.color}>{statusConfig.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 元数据信息 */}
      {metadata && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            页面元数据
          </h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            {metadata.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">作者:</span>
                <span>{metadata.author}</span>
              </div>
            )}
            {metadata.publishDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">发布日期:</span>
                <span>{formatDate(metadata.publishDate)}</span>
              </div>
            )}
            {metadata.description && (
              <div>
                <span className="text-muted-foreground block mb-1">描述:</span>
                <p className="text-sm leading-relaxed">{metadata.description}</p>
              </div>
            )}
            {metadata.keywords && metadata.keywords.length > 0 && (
              <div>
                <span className="text-muted-foreground block mb-1">关键词:</span>
                <div className="flex flex-wrap gap-1">
                  {metadata.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-muted text-xs rounded-md"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 提取的图片 */}
      {images.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            页面图片 ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((image, index) => (
              <div
                key={index}
                className="group relative aspect-video bg-muted rounded-lg overflow-hidden border"
              >
                <img
                  src={image.url}
                  alt={image.alt || `Image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEySDMiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4K'
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {image.alt && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {image.alt}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 网页内容 */}
      {content && !error && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            读取内容
          </h4>
          <div className="bg-background p-4 rounded border max-h-96 overflow-y-auto">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      )}

      {/* 摘要 */}
      {contentData?.summary && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">内容摘要</h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {contentData.summary}
          </p>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            读取错误
          </h4>
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* 原始内容（兜底） */}
      {!contentData && content && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">读取结果</h4>
          <pre className="text-xs bg-background p-3 rounded border overflow-x-auto max-h-64 whitespace-pre-wrap">
            {content}
          </pre>
        </div>
      )}
    </div>
  )
}