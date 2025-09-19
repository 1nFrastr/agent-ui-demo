// 获取页面元素
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
}, 5000);