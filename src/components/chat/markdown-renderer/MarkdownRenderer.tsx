import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/utils/cn'
import type { Components } from 'react-markdown'

export interface MarkdownRendererProps {
  /** Markdown内容 */
  content: string
  /** 主题模式 */
  theme?: 'light' | 'dark'
  /** 自定义类名 */
  className?: string
}

// 将 remarkPlugins 提取到组件外部，避免每次渲染时重新创建
const remarkPlugins = [remarkGfm]

// 创建缓存的组件配置函数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMarkdownComponents = (codeStyle: any): Components => ({
  code: ({ node, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    const inline = !node?.position

    if (!inline && language) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ref, ...restProps } = props
      return (
        <SyntaxHighlighter
          style={codeStyle}
          language={language}
          PreTag="div"
          className="rounded-md !mt-2 !mb-2"
          {...restProps}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    }

    return (
      <code
        className={cn(
          'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
          className
        )}
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }) => {
    return (
      <pre className="overflow-x-auto" {...props}>
        {children}
      </pre>
    )
  },
  blockquote: ({ children, ...props }) => {
    return (
      <blockquote
        className="border-l-4 border-muted-foreground/25 pl-4 py-2 my-4 italic text-muted-foreground"
        {...props}
      >
        {children}
      </blockquote>
    )
  },
  table: ({ children, ...props }) => {
    return (
      <div className="overflow-x-auto">
        <table
          className="min-w-full border-collapse border border-border"
          {...props}
        >
          {children}
        </table>
      </div>
    )
  },
  th: ({ children, ...props }) => {
    return (
      <th
        className="border border-border bg-muted px-3 py-2 text-left font-semibold"
        {...props}
      >
        {children}
      </th>
    )
  },
  td: ({ children, ...props }) => {
    return (
      <td className="border border-border px-3 py-2" {...props}>
        {children}
      </td>
    )
  },
  ul: ({ children, ...props }) => {
    return (
      <ul className="list-disc pl-6 my-2" {...props}>
        {children}
      </ul>
    )
  },
  ol: ({ children, ...props }) => {
    return (
      <ol className="list-decimal pl-6 my-2" {...props}>
        {children}
      </ol>
    )
  },
  li: ({ children, ...props }) => {
    return (
      <li className="my-1" {...props}>
        {children}
      </li>
    )
  },
  h1: ({ children, ...props }) => {
    return (
      <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>
        {children}
      </h1>
    )
  },
  h2: ({ children, ...props }) => {
    return (
      <h2 className="text-xl font-semibold mt-5 mb-3" {...props}>
        {children}
      </h2>
    )
  },
  h3: ({ children, ...props }) => {
    return (
      <h3 className="text-lg font-medium mt-4 mb-2" {...props}>
        {children}
      </h3>
    )
  },
  p: ({ children, ...props }) => {
    return (
      <p className="leading-relaxed my-2" {...props}>
        {children}
      </p>
    )
  },
  a: ({ children, href, ...props }) => {
    return (
      <a
        href={href}
        className="text-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    )
  },
})

// 缓存亮色和暗色主题的组件配置
const lightComponents = createMarkdownComponents(oneLight)
const darkComponents = createMarkdownComponents(oneDark)

const MarkdownRenderer = React.memo(React.forwardRef<HTMLDivElement, MarkdownRendererProps>(
  ({ content, theme = 'light', className }, ref) => {
    // 使用缓存的组件配置，避免每次渲染时重新创建
    const components = theme === 'dark' ? darkComponents : lightComponents

    return (
      <div
        ref={ref}
        className={cn('prose prose-sm max-w-none', className)}
      >
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }
))

MarkdownRenderer.displayName = 'MarkdownRenderer'

export { MarkdownRenderer }
