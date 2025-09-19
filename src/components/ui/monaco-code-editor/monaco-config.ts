import * as monaco from 'monaco-editor'

// Monaco Editor 高级配置
export const setupMonacoEditor = () => {
  // 配置JavaScript/TypeScript诊断
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  })

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  })

  // 配置编译器选项
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types']
  })

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types'],
    strict: true
  })

  // 添加常见的库定义
  const libSource = `
    declare var console: Console;
    interface Console {
      log(message?: any, ...optionalParams: any[]): void;
      error(message?: any, ...optionalParams: any[]): void;
      warn(message?: any, ...optionalParams: any[]): void;
      info(message?: any, ...optionalParams: any[]): void;
    }
  `

  monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, 'ts:lib.es6.d.ts')
  monaco.languages.typescript.typescriptDefaults.addExtraLib(libSource, 'ts:lib.es6.d.ts')
}

// 自定义主题
export const setupCustomThemes = () => {
  // 定义暗色主题
  monaco.editor.defineTheme('custom-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'class', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editorLineNumber.foreground': '#858585',
      'editor.selectionBackground': '#264F78',
      'editor.lineHighlightBackground': '#2A2D2E',
      'editorCursor.foreground': '#AEAFAD',
      'editor.findMatchBackground': '#515C6A',
      'editor.findMatchHighlightBackground': '#EA5C0055'
    }
  })

  // 定义亮色主题
  monaco.editor.defineTheme('custom-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'keyword', foreground: '0000FF' },
      { token: 'string', foreground: 'A31515' },
      { token: 'number', foreground: '098658' },
      { token: 'type', foreground: '267F99' },
      { token: 'class', foreground: '267F99' },
      { token: 'function', foreground: '795E26' },
      { token: 'variable', foreground: '001080' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
      'editorLineNumber.foreground': '#237893',
      'editor.selectionBackground': '#ADD6FF',
      'editor.lineHighlightBackground': '#F7F7F7',
      'editorCursor.foreground': '#000000',
      'editor.findMatchBackground': '#A8AC94',
      'editor.findMatchHighlightBackground': '#EA5C0055'
    }
  })
}

// 注册自定义语言服务
export const registerCustomLanguages = () => {
  // 为JSON添加自定义配置
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: true,
    schemas: [{
      uri: 'http://myserver/package-schema.json',
      fileMatch: ['package.json'],
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          version: { type: 'string' },
          description: { type: 'string' },
          scripts: { type: 'object' },
          dependencies: { type: 'object' },
          devDependencies: { type: 'object' }
        }
      }
    }]
  })

  // 注册自定义代码格式化器
  monaco.languages.registerDocumentFormattingEditProvider('javascript', {
    provideDocumentFormattingEdits: (model) => {
      // 简单的格式化逻辑
      const text = model.getValue()
      const formatted = text
        .split('\n')
        .map(line => line.trim())
        .join('\n')
      
      return [{
        range: model.getFullModelRange(),
        text: formatted
      }]
    }
  })

  // 注册代码补全提供者
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const suggestions: monaco.languages.CompletionItem[] = [
        {
          label: 'console.log',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'console.log(${1:message});',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '在控制台输出信息',
          range
        },
        {
          label: 'function',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'function ${1:name}(${2:params}) {\n\t${3:// body}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '创建一个函数',
          range
        },
        {
          label: 'if',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'if (${1:condition}) {\n\t${2:// body}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '条件语句',
          range
        },
        {
          label: 'for',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3:// body}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '循环语句',
          range
        }
      ]

      return { suggestions }
    }
  })
}

// 初始化Monaco Editor
export const initializeMonacoEditor = () => {
  setupMonacoEditor()
  setupCustomThemes()
  registerCustomLanguages()
}

// 导出配置选项
export const defaultEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
  fontLigatures: true,
  minimap: { enabled: true },
  wordWrap: 'on',
  lineNumbers: 'on',
  folding: true,
  autoIndent: 'advanced',
  formatOnPaste: true,
  formatOnType: true,
  scrollBeyondLastLine: false,
  renderWhitespace: 'selection',
  renderControlCharacters: true,
  smoothScrolling: true,
  cursorSmoothCaretAnimation: 'on',
  contextmenu: true,
  mouseWheelZoom: true,
  multiCursorModifier: 'ctrlCmd',
  accessibilitySupport: 'auto',
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  tabCompletion: 'on',
  parameterHints: { enabled: true },
  quickSuggestions: {
    other: true,
    comments: true,
    strings: true
  },
  rulers: [80, 120],
  renderLineHighlight: 'gutter',
  selectionHighlight: true,
  occurrencesHighlight: 'singleFile',
  codeLens: true,
  hover: { enabled: true },
  links: true,
  colorDecorators: true,
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    indentation: true
  }
}