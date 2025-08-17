import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import EmulatorScreen from './EmulatorScreen';
import { Controlled as ControlledEditor } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/eclipse.css';
import 'codemirror/mode/javascript/javascript';
import './MobileEmulator.css';

const initialCode = `export default function App() {
  const [todos, setTodos] = React.useState([
    { text: 'Learn React Native', done: false },
    { text: 'Build a mobile app', done: false }
  ]);
  const [input, setInput] = React.useState('');

  function addTodo() {
    if (input.trim()) {
      setTodos([...todos, { text: input, done: false }]);
      setInput('');
    }
  }

  function toggleTodo(index) {
    setTodos(
      todos.map((todo, i) =>
        i === index ? { ...todo, done: !todo.done } : todo
      )
    );
  }

  return (
    <View style={{ flex: 1, minHeight: '100%', minWidth: '100%', backgroundColor: '#f5f5f5', padding: 0, margin: 0, boxSizing: 'border-box', justifyContent: 'flex-start' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Todo List
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <input
            style={{
              flex: 1,
              padding: 8,
              fontSize: 16,
              borderRadius: 4,
              border: '1px solid #ccc',
              marginRight: 8
            }}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add a new todo..."
          />
          <Button title="Add" onPress={addTodo} />
        </View>
        <View>
          {todos.map((todo, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
                backgroundColor: '#fff',
                padding: 10,
                borderRadius: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(idx)}
                style={{ marginRight: 12 }}
              />
              <Text
                style={{
                  fontSize: 18,
                  textDecoration: todo.done ? 'line-through' : 'none',
                  color: todo.done ? '#aaa' : '#222'
                }}
              >
                {todo.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
`;

function MobileEmulator() {
  const [code, setCode] = useState(initialCode);
  const history = useHistory();

  // React Native logo (public domain)
  const rnLogo = 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg';

  return (
    <div className="mobile-emulator-root">
      <div className="mobile-emulator-header">
        <div className="mobile-emulator-title">Mobile Emulator</div>
        <button className="mobile-emulator-back" onClick={() => history.push('/')}>Back to Editor</button>
      </div>
      <div className="mobile-emulator-container">
        <div className="emulator-left">
          <EmulatorScreen code={code} />
        </div>
        <div className="emulator-right" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="emulator-info-bar">
            <img src={rnLogo} alt="React Native Logo" />
            Write or edit your React Native code below. Changes are rendered in real time.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, marginTop: 24 }}>
            <h3 style={{ flex: 1, margin: 0 }}>React Native Code</h3>
          </div>
          <div className="editor-container" style={{ flex: 1, minHeight: 0, paddingTop: 24, paddingBottom: 24 }}>
            <ControlledEditor
              value={code}
              onBeforeChange={(_e, _d, v) => setCode(v)}
              className="code-editor emulator-code-editor"
              options={{
                mode: 'javascript',
                theme: 'eclipse',
                lineNumbers: true,
                tabSize: 2,
                indentUnit: 2,
                lineWrapping: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                autoCloseBrackets: true,
                matchBrackets: true,
                styleActiveLine: true
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileEmulator; 