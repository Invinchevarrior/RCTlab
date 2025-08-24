// EmulatorCodeEditor.js

import React, { useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
// for dark theme, you can import a dark prism theme
import 'prismjs/themes/prism.css'; 
import './EmulatorCodeEditor.css';

function EmulatorCodeEditor({ code, setCode }) {
  const lineNumbersRef = useRef(null);

  // 1. simplify the highlight function: only do syntax highlighting, this is the key to fix the cursor position!
  const highlightWithPrism = (code) =>
    Prism.highlight(code, Prism.languages.jsx, 'jsx');

  // 2. synchronize scrolling: when the code area scrolls, synchronize the line number area
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
      {/* 3. new layout: a container that contains the line numbers and the editor */}
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
          padding={12} // uniform padding
          textareaId="emulator-code-editor-textarea"
          className="emulator-editor-main" // for positioning and applying styles
          onScroll={handleScroll} // listen to scroll events
          style={{
            fontFamily: 'Fira Mono, monospace',
            fontSize: 14,
            lineHeight: 1.4, // compact line height
            // all other layout styles are moved to the CSS file
          }}
        />
      </div>
    </div>
  );
}

export default EmulatorCodeEditor;