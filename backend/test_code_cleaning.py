#!/usr/bin/env python3
"""Test script for code cleaning functionality."""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.tools.code_generator import CodeGeneratorTool

def test_clean_generated_code():
    """Test the _clean_generated_code function."""
    
    tool = CodeGeneratorTool()
    
    # Test HTML with markdown
    html_with_markdown = """```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Test Page</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>
```"""
    
    cleaned_html = tool._clean_generated_code(html_with_markdown, "html")
    print("=== HTML Cleaning Test ===")
    print("Input:")
    print(html_with_markdown)
    print("\nOutput:")
    print(cleaned_html)
    print("\n" + "="*50 + "\n")
    
    # Test CSS with markdown
    css_with_markdown = """以下是生成的CSS代码：

```css
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
}

h1 {
    color: #333;
    text-align: center;
}
```"""
    
    cleaned_css = tool._clean_generated_code(css_with_markdown, "css")
    print("=== CSS Cleaning Test ===")
    print("Input:")
    print(css_with_markdown)
    print("\nOutput:")
    print(cleaned_css)
    print("\n" + "="*50 + "\n")
    
    # Test JS with markdown
    js_with_markdown = """这是生成的JavaScript代码：

```javascript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');
    
    const button = document.querySelector('button');
    if (button) {
        button.addEventListener('click', function() {
            alert('Hello World!');
        });
    }
});
```"""
    
    cleaned_js = tool._clean_generated_code(js_with_markdown, "js")
    print("=== JavaScript Cleaning Test ===")
    print("Input:")
    print(js_with_markdown)
    print("\nOutput:")
    print(cleaned_js)

if __name__ == "__main__":
    test_clean_generated_code()