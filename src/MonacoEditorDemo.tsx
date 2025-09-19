import React, { useState } from 'react'
import { MonacoCodeEditor } from '@/components/ui/monaco-code-editor'

const MonacoEditorDemo: React.FC = () => {
  const [javascriptCode, setJavascriptCode] = useState(`// JavaScript 示例代码
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('斐波那契数列前10项:');
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

// ES6+ 特性示例
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const { length } = doubled;

console.log(\`原数组: \${numbers}\`);
console.log(\`翻倍后: \${doubled}\`);
console.log(\`数组长度: \${length}\`);
`)

  const [typescriptCode, setTypescriptCode] = useState(`// TypeScript 示例代码
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  findUser(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): User[] {
    return [...this.users];
  }
}

// 使用示例
const userService = new UserService();

const newUser: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  age: 25
};

userService.addUser(newUser);
const foundUser = userService.findUser(1);

console.log('找到的用户:', foundUser);
`)

  const [pythonCode, setPythonCode] = useState(`# Python 示例代码
import math
from typing import List, Dict, Optional

class Calculator:
    """一个简单的计算器类"""
    
    def __init__(self):
        self.history: List[str] = []
    
    def add(self, a: float, b: float) -> float:
        """加法运算"""
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def multiply(self, a: float, b: float) -> float:
        """乘法运算"""
        result = a * b
        self.history.append(f"{a} * {b} = {result}")
        return result
    
    def power(self, base: float, exponent: float) -> float:
        """幂运算"""
        result = math.pow(base, exponent)
        self.history.append(f"{base} ^ {exponent} = {result}")
        return result
    
    def get_history(self) -> List[str]:
        """获取计算历史"""
        return self.history.copy()

# 使用示例
calc = Calculator()
print(f"2 + 3 = {calc.add(2, 3)}")
print(f"4 * 5 = {calc.multiply(4, 5)}")
print(f"2 ^ 8 = {calc.power(2, 8)}")

print("\\n计算历史:")
for operation in calc.get_history():
    print(f"  {operation}")
`)

  const [jsonCode, setJsonCode] = useState(`{
  "name": "open-agent-ui",
  "version": "0.1.0",
  "description": "现代化的 Agent 对话界面 UI 组件库",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.7.0",
    "monaco-editor": "^0.53.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.7",
    "typescript": "~5.8.3",
    "vite": "^7.1.2"
  }
}`)

  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light')
  const [showMinimap, setShowMinimap] = useState(true)
  const [wordWrap, setWordWrap] = useState<'off' | 'on' | 'wordWrapColumn' | 'bounded'>('on')
  const [fontSize, setFontSize] = useState(14)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Monaco Editor 组件测试</h1>
      
      {/* 配置面板 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">编辑器配置</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">主题</label>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'high-contrast')}
              className="w-full p-2 border rounded"
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="high-contrast">高对比度</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">字体大小</label>
            <input 
              type="number" 
              value={fontSize} 
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="10" 
              max="24"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">自动换行</label>
            <select 
              value={wordWrap} 
              onChange={(e) => setWordWrap(e.target.value as 'off' | 'on' | 'wordWrapColumn' | 'bounded')}
              className="w-full p-2 border rounded"
            >
              <option value="off">关闭</option>
              <option value="on">开启</option>
              <option value="wordWrapColumn">按列换行</option>
              <option value="bounded">有界换行</option>
            </select>
          </div>
          
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={showMinimap} 
                onChange={(e) => setShowMinimap(e.target.checked)}
                className="mr-2"
              />
              显示小地图
            </label>
          </div>
        </div>
      </div>

      {/* JavaScript/TypeScript 编辑器 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">JavaScript 代码编辑器</h2>
        <MonacoCodeEditor
          value={javascriptCode}
          onChange={setJavascriptCode}
          filename="example.js"
          height="300px"
          theme={theme}
          showMinimap={showMinimap}
          wordWrap={wordWrap}
          fontSize={fontSize}
          className="mb-4"
        />
        
        <h2 className="text-xl font-semibold mb-4">TypeScript 代码编辑器</h2>
        <MonacoCodeEditor
          value={typescriptCode}
          onChange={setTypescriptCode}
          filename="example.ts"
          height="300px"
          theme={theme}
          showMinimap={showMinimap}
          wordWrap={wordWrap}
          fontSize={fontSize}
          className="mb-4"
        />
      </div>

      {/* Python 编辑器 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Python 代码编辑器</h2>
        <MonacoCodeEditor
          value={pythonCode}
          onChange={setPythonCode}
          filename="example.py"
          height="300px"
          theme={theme}
          showMinimap={showMinimap}
          wordWrap={wordWrap}
          fontSize={fontSize}
        />
      </div>

      {/* JSON 编辑器 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">JSON 编辑器（只读模式）</h2>
        <MonacoCodeEditor
          value={jsonCode}
          onChange={setJsonCode}
          filename="package.json"
          height="300px"
          theme={theme}
          showMinimap={showMinimap}
          wordWrap={wordWrap}
          fontSize={fontSize}
          readOnly={true}
        />
      </div>

      {/* 功能说明 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Monaco Editor 功能特性</h3>
        <ul className="space-y-1 text-sm">
          <li>• <strong>语法高亮：</strong>支持 40+ 种编程语言</li>
          <li>• <strong>智能补全：</strong>基于语言语法的代码补全建议</li>
          <li>• <strong>错误检测：</strong>实时语法错误检测和提示</li>
          <li>• <strong>快捷键支持：</strong>Ctrl+S 格式化，Ctrl+D 复制行，Ctrl+/ 注释</li>
          <li>• <strong>主题切换：</strong>浅色、深色、高对比度主题</li>
          <li>• <strong>小地图：</strong>代码小地图导航</li>
          <li>• <strong>自动缩进：</strong>智能代码缩进和格式化</li>
          <li>• <strong>多光标编辑：</strong>Ctrl/Cmd + 点击支持多光标</li>
          <li>• <strong>查找替换：</strong>Ctrl+F 查找，Ctrl+H 替换</li>
          <li>• <strong>代码折叠：</strong>支持代码块折叠和展开</li>
        </ul>
      </div>
    </div>
  )
}

export default MonacoEditorDemo