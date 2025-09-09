import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/utils/cn'

export interface MarkdownRendererProps {
  /** Markdown内容 */
  content: string
  /** 主题模式 */
  theme?: 'light' | 'dark'
  /** 自定义类名 */
  className?: string
}

const MarkdownRenderer = React.forwardRef<HTMLDivElement, MarkdownRendererProps>(
  ({ content, theme = 'light', className }, ref) => {
    const codeStyle = theme === 'dark' ? oneDark : oneLight

    return (
      <div
        ref={ref}
        className={cn('prose prose-sm max-w-none', className)}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '')
              const language = match ? match[1] : ''
              const inline = !node?.position

              if (!inline && language) {
                return (
                  <SyntaxHighlighter
                    style={codeStyle as any}
                    language={language}
                    PreTag="div"
                    className="rounded-md !mt-2 !mb-2"
                    {...props}
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
            pre({ children, ...props }) {
              return (
                <pre className="overflow-x-auto" {...props}>
                  {children}
                </pre>
              )
            },
            blockquote({ children, ...props }) {
              return (
                <blockquote
                  className="border-l-4 border-muted-foreground/25 pl-4 py-2 my-4 italic text-muted-foreground"
                  {...props}
                >
                  {children}
                </blockquote>
              )
            },
            table({ children, ...props }) {
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
            th({ children, ...props }) {
              return (
                <th
                  className="border border-border bg-muted px-3 py-2 text-left font-semibold"
                  {...props}
                >
                  {children}
                </th>
              )
            },
            td({ children, ...props }) {
              return (
                <td className="border border-border px-3 py-2" {...props}>
                  {children}
                </td>
              )
            },
            ul({ children, ...props }) {
              return (
                <ul className="list-disc pl-6 my-2" {...props}>
                  {children}
                </ul>
              )
            },
            ol({ children, ...props }) {
              return (
                <ol className="list-decimal pl-6 my-2" {...props}>
                  {children}
                </ol>
              )
            },
            li({ children, ...props }) {
              return (
                <li className="my-1" {...props}>
                  {children}
                </li>
              )
            },
            h1({ children, ...props }) {
              return (
                <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>
                  {children}
                </h1>
              )
            },
            h2({ children, ...props }) {
              return (
                <h2 className="text-xl font-semibold mt-5 mb-3" {...props}>
                  {children}
                </h2>
              )
            },
            h3({ children, ...props }) {
              return (
                <h3 className="text-lg font-medium mt-4 mb-2" {...props}>
                  {children}
                </h3>
              )
            },
            p({ children, ...props }) {
              return (
                <p className="leading-relaxed my-2" {...props}>
                  {children}
                </p>
              )
            },
            a({ children, href, ...props }) {
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
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }
)

MarkdownRenderer.displayName = 'MarkdownRenderer'

export { MarkdownRenderer }
