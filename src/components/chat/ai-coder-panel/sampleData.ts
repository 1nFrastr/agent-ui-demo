import type { SimpleFileSystem, SimpleFile } from './types'

// 导入demo文件内容
import indexHtmlContent from './demo-files/index.html?raw'
import styleCssContent from './demo-files/style.css?raw'
import scriptJsContent from './demo-files/script.js?raw'
import readmeContent from './demo-files/README.md?raw'

/**
 * 创建示例文件系统数据
 * 从demo目录加载实际文件内容
 */
export function createSampleFileSystem(): SimpleFileSystem {
  const files: SimpleFile[] = [
    {
      id: '1',
      name: 'index.html',
      path: '/index.html',
      type: 'file',
      extension: 'html',
      content: indexHtmlContent,
      modified: new Date('2024-01-15T10:30:00'),
      isReadOnly: false
    },
    {
      id: '2',
      name: 'style.css',
      path: '/style.css',
      type: 'file',
      extension: 'css',
      content: styleCssContent,
      modified: new Date('2024-01-15T10:25:00'),
      isReadOnly: false
    },
    {
      id: '3',
      name: 'script.js',
      path: '/script.js',
      type: 'file',
      extension: 'js',
      content: scriptJsContent,
      modified: new Date('2024-01-15T10:20:00'),
      isReadOnly: false
    },
    {
      id: '4',
      name: 'README.md',
      path: '/README.md',
      type: 'file',
      extension: 'md',
      content: readmeContent,
      modified: new Date('2024-01-15T10:15:00'),
      isReadOnly: false
    }
  ]

  return {
    files,
    selectedPath: '/index.html'
  }
}

// 保持向后兼容性的导出
export const sampleFileSystem: SimpleFileSystem = createSampleFileSystem()