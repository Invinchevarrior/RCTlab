// EmulatorCodeEditor.js

import React, { useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
// 为了配合深色主题，可以引入一个深色的Prism主题
import 'prismjs/themes/prism.css'; 
import './EmulatorCodeEditor.css';

function EmulatorCodeEditor({ code, setCode }) {
  const lineNumbersRef = useRef(null);

  // 1. 简化高亮函数：只进行语法高亮，这是修复光标位置的关键！
  const highlightWithPrism = (code) =>
    Prism.highlight(code, Prism.languages.jsx, 'jsx');

  // 2. 同步滚动：当代码区滚动时，同步滚动行号区
  const handleScroll = (event) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = event.target.scrollTop;
      lineNumbersRef.current.scrollLeft = event.target.scrollLeft;
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="emulator-code-editor">
      <h3>React Native Code</h3>
      {/* 3. 新的布局：一个包含行号和编辑器的容器 */}
      <div className="emulator-editor-container">
        <div className="emulator-line-numbers" ref={lineNumbersRef}>
          {lineNumbers.map(num => (
            <div key={num}>{num}</div>
          ))}
        </div>
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={highlightWithPrism}
          padding={12} // 统一的内边距
          textareaId="emulator-code-editor-textarea"
          className="emulator-editor-main" // 用于定位和应用样式的Class
          onScroll={handleScroll} // 监听滚动事件
          style={{
            fontFamily: 'Fira Mono, monospace',
            fontSize: 14,
            lineHeight: 1.4, // 紧凑的行高
            // 其他布局样式全部移到CSS文件中
          }}
        />
      </div>
    </div>
  );
}

export default EmulatorCodeEditor;