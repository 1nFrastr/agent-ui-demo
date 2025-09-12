import * as React from 'react'
import { ExternalLink, Search, Clock, Globe } from 'lucide-react'
import type { ToolCallDetails, WebSearchData } from '@/types/chat'

interface WebSearchDetailsProps {
  details: ToolCallDetails
}

// 获取域名信息
const getDomainInfo = (url: string) => {
  try {
    const urlObj = new URL(url)
    return {
      domain: urlObj.hostname,
      favicon: `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`
    }
  } catch {
    return {
      domain: url,
      favicon: undefined
    }
  }
}

export const WebSearchDetails: React.FC<WebSearchDetailsProps> = ({ details }) => {
  const searchData = details.metadata?.searchData as WebSearchData | undefined
  const query = searchData?.query || (details.parameters?.query as string) || ''
  const results = searchData?.results || []
  const searchTime = searchData?.searchTime
  const totalResults = searchData?.totalResults

  return (
    <div className="space-y-4">
      {/* 搜索信息 */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Search className="h-4 w-4" />
          搜索详情
        </h4>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground block mb-1">搜索关键词:</span>
            <div className="flex items-center gap-2 p-2 bg-background rounded border">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{query}</span>
            </div>
          </div>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            {totalResults && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span>约 {totalResults.toLocaleString()} 条结果</span>
              </div>
            )}
            {searchTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{searchTime}ms</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 搜索结果 */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            搜索结果 ({results.length})
          </h4>
          
          <div className="space-y-3">
            {results.map((result, index) => {
              const domainInfo = getDomainInfo(result.url)
              
              return (
                <div
                  key={index}
                  className="p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* 网站信息和标题 */}
                  <div className="flex items-start gap-3 mb-2">
                    {/* 网站图标 */}
                    <div className="flex-shrink-0 mt-1">
                      {result.favicon || domainInfo.favicon ? (
                        <img
                          src={result.favicon || domainInfo.favicon}
                          alt={`${domainInfo.domain} favicon`}
                          className="w-4 h-4 rounded-sm"
                          onError={(e) => {
                            // 如果图标加载失败，显示默认图标
                            e.currentTarget.style.display = 'none'
                            if (e.currentTarget.nextSibling) {
                              (e.currentTarget.nextSibling as HTMLElement).style.display = 'block'
                            }
                          }}
                        />
                      ) : null}
                      <Globe 
                        className="w-4 h-4 text-muted-foreground" 
                        style={{ display: result.favicon || domainInfo.favicon ? 'none' : 'block' }}
                      />
                    </div>
                    
                    {/* 标题和链接 */}
                    <div className="flex-1 min-w-0">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-primary hover:underline group-hover:underline line-clamp-1">
                            {result.title}
                          </h5>
                          <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {result.domain || domainInfo.domain}
                        </div>
                      </a>
                      
                      {/* 网页概述 */}
                      {result.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {result.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 原始结果（如果没有结构化数据） */}
      {results.length === 0 && details.result && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">搜索结果</h4>
          <pre className="text-xs bg-background p-3 rounded border overflow-x-auto max-h-64 whitespace-pre-wrap">
            {details.result}
          </pre>
        </div>
      )}
    </div>
  )
}