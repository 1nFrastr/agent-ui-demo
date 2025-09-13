import type { SimpleFileSystem } from './types'

// 示例文件系统数据
export const sampleFileSystem: SimpleFileSystem = {
  files: [
    {
      id: '1',
      name: 'index.html',
      path: '/index.html',
      type: 'file',
      extension: 'html',
      content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>示例页面</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>欢迎使用AI编程工具</h1>
        <p>这是一个示例HTML文件。</p>
        <button id="clickBtn">点击我</button>
        <div id="output"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      modified: new Date('2024-01-15T10:30:00'),
      isReadOnly: false
    },
    {
      id: '2',
      name: 'style.css',
      path: '/style.css',
      type: 'file',
      extension: 'css',
      content: `.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

h1 {
    color: #2563eb;
    text-align: center;
    margin-bottom: 20px;
}

p {
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 20px;
}

button {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background-color: #2563eb;
}

#output {
    margin-top: 20px;
    padding: 15px;
    background-color: #f3f4f6;
    border-radius: 5px;
    min-height: 50px;
}`,
      modified: new Date('2024-01-15T10:25:00'),
      isReadOnly: false
    },
    {
      id: '3',
      name: 'script.js',
      path: '/script.js',
      type: 'file',
      extension: 'js',
      content: `// 获取页面元素
const button = document.getElementById('clickBtn');
const output = document.getElementById('output');

// 显示初始消息
if (output) {
    output.innerHTML = '<p>页面已加载完成，点击上方按钮查看效果。</p>';
}

// 设置按钮点击事件
if (button && output) {
    button.addEventListener('click', function() {
        const now = new Date();
        output.innerHTML = 
            '<h3>按钮被点击了！</h3>' +
            '<p>当前时间: ' + now.toLocaleString() + '</p>' +
            '<p>这是由JavaScript动态生成的内容。</p>';
        
        console.log('按钮点击事件触发', now);
    });
}

// 添加一些示例功能
function generateRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 每5秒改变标题颜色
setInterval(() => {
    const h1 = document.querySelector('h1');
    if (h1) {
        h1.style.color = generateRandomColor();
    }
}, 5000);`,
      modified: new Date('2024-01-15T10:20:00'),
      isReadOnly: false
    },
    {
      id: '4',
      name: 'README.md',
      path: '/README.md',
      type: 'file',
      extension: 'md',
      content: `# AI编程工具示例项目

这是一个简单的HTML/CSS/JavaScript项目示例，用于演示AI编程工具的功能。

## 文件说明

- \`index.html\` - 主要的HTML结构文件
- \`style.css\` - 样式文件，定义页面外观
- \`script.js\` - JavaScript逻辑文件，处理交互
- \`README.md\` - 项目说明文档

## 功能特点

1. 响应式设计
2. 交互式按钮
3. 动态内容生成
4. 颜色变化动画

## 使用方法

1. 在文件浏览器中选择任意文件进行查看和编辑
2. 修改文件内容后保存
3. 切换到HTML预览标签查看效果
4. 支持实时预览HTML、CSS、JavaScript的组合效果

## 技术栈

- HTML5
- CSS3
- Vanilla JavaScript
- 无外部依赖`,
      modified: new Date('2024-01-15T10:15:00'),
      isReadOnly: false
    }
  ],
  selectedPath: '/index.html'
}