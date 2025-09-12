import React from 'react'

export const SimpleToolPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold">AI编程工具面板</h2>
        <p className="text-sm text-gray-600">文件浏览器 + HTML预览功能</p>
      </div>
      
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* 文件浏览器区域 */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">📁 文件浏览器</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <span>📄</span>
                <span>index.html</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <span>🎨</span>
                <span>style.css</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <span>⚡</span>
                <span>script.js</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                <span>📖</span>
                <span>README.md</span>
              </div>
            </div>
          </div>
          
          {/* HTML预览区域 */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="font-medium mb-3">👁️ HTML预览</h3>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 h-40">
              <h4 className="text-blue-800 font-medium">示例网页预览</h4>
              <p className="text-blue-600 text-sm mt-2">
                这里会显示HTML/CSS/JS的实时预览效果
              </p>
              <div className="mt-4">
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                  示例按钮
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}