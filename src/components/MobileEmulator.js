import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EmulatorScreen from './EmulatorScreen';
import { Controlled as ControlledEditor } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/eclipse.css';
import 'codemirror/mode/javascript/javascript';
import './MobileEmulator.css';

const initialCode = `export default function App() {
  // State
  const [todos, setTodos] = React.useState([
    { id: 1, text: 'Learn React Native', done: false, priority: 'High' },
    { id: 2, text: 'Build a mobile app', done: false, priority: 'Medium' }
  ]);
  const [input, setInput] = React.useState('');
  const [priority, setPriority] = React.useState('Medium');
  const [filter, setFilter] = React.useState('All'); // All | Active | Completed
  const [editingId, setEditingId] = React.useState(null);
  const [editingText, setEditingText] = React.useState('');

  // Styles (mobile-first, stacked to avoid overflow)
  const styles = {
    screen: {
      flex: 1,
      minHeight: '100%',
      minWidth: '100%',
      background: 'linear-gradient(180deg, #e3f2fd 0%, #ffffff 65%)',
      padding: 0,
      margin: 0,
      boxSizing: 'border-box',
      justifyContent: 'flex-start',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"
    },
    container: {
      padding: 12,
      gap: 10,
      width: '100%',
      boxSizing: 'border-box'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
      padding: 10,
      border: '1px solid #f0f0f0'
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6
    },
    title: {
      fontSize: 20,
      fontWeight: 800,
      color: '#1e293b'
    },
    subtitle: {
      fontSize: 12,
      color: '#64748b'
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
      width: '100%'
    },
    input: {
      flex: 1,
      minWidth: 0,
      padding: 9,
      fontSize: 15,
      borderRadius: 10,
      border: '1px solid #dbeafe',
      outline: 'none',
      background: '#f8fafc'
    },
    select: {
      padding: 8,
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      background: '#fff'
    },
    chipsWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      width: '100%'
    },
    chip: (active) => ({
      padding: '6px 10px',
      borderRadius: 999,
      background: active ? '#e0f2fe' : '#f1f5f9',
      color: active ? '#0369a1' : '#475569',
      border: active ? '1px solid #bae6fd' : '1px solid #e2e8f0',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer'
    }),
    count: { marginLeft: 'auto', fontSize: 12, color: '#64748b' },

    // Todo item layout
    todoCard: {
      backgroundColor: '#ffffff',
      padding: 10,
      borderRadius: 12,
      border: '1px solid #f1f5f9',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      marginBottom: 8,
      width: '100%',
      boxSizing: 'border-box'
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: '100%'
    },
    text: (done) => ({
      flex: 1,
      minWidth: 0,
      fontSize: 16,
      color: done ? '#94a3b8' : '#0f172a',
      textDecoration: done ? 'line-through' : 'none',
      wordBreak: 'break-word'
    }),
    priBadge: (pri) => ({
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      background: pri === 'High' ? '#fee2e2' : pri === 'Medium' ? '#ffedd5' : '#dcfce7',
      color: pri === 'High' ? '#b91c1c' : pri === 'Medium' ? '#b45309' : '#166534',
      border: '1px solid rgba(0,0,0,0.05)'
    }),
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
      marginTop: 8,
      width: '100%'
    },
    leftControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6
    },
    rightControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6
    },
    btn: {
      margin: 0,
      padding: '6px 10px',
      borderRadius: 10,
      background: '#f1f5f9',
      color: '#0f172a'
    },
    addBtn: {
      margin: 0,
      padding: '9px 12px',
      borderRadius: 12,
      background: 'linear-gradient(90deg, #60a5fa, #22d3ee)',
      color: '#ffffff',
      fontWeight: 700
    }
  };

  // Helpers
  function addTodo() {
    const value = input.trim();
    if (!value) return;
    const nextId = todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1;
    setTodos([...todos, { id: nextId, text: value, done: false, priority }]);
    setInput('');
    setPriority('Medium');
  }

  function toggleTodo(id) {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo));
  }

  function deleteTodo(id) {
    setTodos(todos.filter(todo => todo.id !== id));
  }

  function startEdit(id, text) {
    setEditingId(id);
    setEditingText(text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText('');
  }

  function confirmEdit() {
    const value = editingText.trim();
    if (!value) { setEditingId(null); return; }
    setTodos(todos.map(todo => todo.id === editingId ? { ...todo, text: value } : todo));
    setEditingId(null);
    setEditingText('');
  }

  function clearCompleted() {
    setTodos(todos.filter(t => !t.done));
  }

  function changePriority(id, newPriority) {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, priority: newPriority } : todo));
  }

  const filteredTodos = React.useMemo(() => {
    if (filter === 'Active') return todos.filter(t => !t.done);
    if (filter === 'Completed') return todos.filter(t => t.done);
    return todos;
  }, [todos, filter]);

  const remaining = todos.filter(t => !t.done).length;

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        {/* Header + Add */}
        <View style={{ ...styles.card, marginBottom: 6 }}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Todo List</Text>
            <Text style={styles.subtitle}>{remaining} items left</Text>
          </View>
          <View style={styles.row}>
            <input
              style={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Add a new task..."
            />
            <select value={priority} onChange={e => setPriority(e.target.value)} style={styles.select}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <Button title="Add" onPress={addTodo} style={styles.addBtn} />
          </View>
        </View>

        {/* Filters */}
        <View style={{ ...styles.card, marginBottom: 6 }}>
          <View style={styles.chipsWrap}>
            <Text style={{ fontSize: 14, color: '#334155', fontWeight: 600 }}>Filter:</Text>
            <button style={styles.chip(filter === 'All')} onClick={() => setFilter('All')}>All</button>
            <button style={styles.chip(filter === 'Active')} onClick={() => setFilter('Active')}>Active</button>
            <button style={styles.chip(filter === 'Completed')} onClick={() => setFilter('Completed')}>Completed</button>
            <span style={styles.count}>{remaining} left</span>
            <Button title="Clear Completed" onPress={clearCompleted} style={{ ...styles.btn, background: '#fee2e2', color: '#991b1b' }} />
          </View>
        </View>

        {/* Todo List */}
        <View>
          {filteredTodos.map((todo) => (
            <View key={todo.id} style={styles.todoCard}>
              <View style={styles.topRow}>
                <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />
                {editingId === todo.id ? (
                  <input
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') cancelEdit(); }}
                    style={{ ...styles.input, margin: 0 }}
                  />
                ) : (
                  <Text style={styles.text(todo.done)}>{todo.text}</Text>
                )}
                <span style={styles.priBadge(todo.priority)}>{todo.priority}</span>
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.leftControls}>
                  <select value={todo.priority} onChange={e => changePriority(todo.id, e.target.value)} style={{ ...styles.select, padding: 6 }}>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </View>
                <View style={styles.rightControls}>
                  {editingId === todo.id ? (
                    <>
                      <Button title="Save" onPress={confirmEdit} style={{ ...styles.btn, background: '#dcfce7', color: '#166534' }} />
                      <Button title="Cancel" onPress={cancelEdit} style={{ ...styles.btn, background: '#e2e8f0' }} />
                    </>
                  ) : (
                    <>
                      <Button title="Edit" onPress={() => startEdit(todo.id, todo.text)} style={{ ...styles.btn, background: '#e0f2fe', color: '#075985' }} />
                      <Button title="Delete" onPress={() => deleteTodo(todo.id)} style={{ ...styles.btn, background: '#fee2e2', color: '#991b1b' }} />
                    </>
                  )}
                </View>
              </View>
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
  const [compilationError, setCompilationError] = useState(null);
  const [compileStatus, setCompileStatus] = useState('success'); // compiling | success | error
  const errorTimerRef = useRef(null);
  const history = useNavigate();

  // React Native logo (public domain image)
  const rnLogo = 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg';

  // Handle compile error
  const handleCompilationError = useCallback((error) => {
    setCompilationError(error);
    if (error) {
      // auto dismiss after 3s
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => {
        setCompilationError(null);
      }, 3000);
    }
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((status) => {
    setCompileStatus(status);
    if (status === 'success') {
      // clear error banner if compilation recovered
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      setCompilationError(null);
    }
  }, []);

  // Clear any pending timers on unmount
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  return (
    <div className="mobile-emulator-root">
      <div className="mobile-emulator-header">
        <div className="mobile-emulator-title">Mobile Emulator</div>
        <div className="mobile-emulator-actions">
          <button 
            className="mobile-emulator-btn ai-chat-btn" 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('globalChatToggle'));
            }}
          >
            AI Chat
          </button>
          <button className="mobile-emulator-back" onClick={() => history('/')}>Back to Editor</button>
        </div>
      </div>
      
      {/* Compile error banner (auto dismiss in 3s) */}
      {compilationError && (
        <div className="compilation-error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{compilationError.message}</span>
            {compilationError.suggestion && (
              <span className="error-suggestion">{compilationError.suggestion}</span>
            )}
          </div>
          <button className="error-close" onClick={() => setCompilationError(null)}>✕</button>
        </div>
      )}
      
      <div className="mobile-emulator-container">
        <div className="emulator-left">
          <EmulatorScreen 
            code={code} 
            onError={handleCompilationError}
            onStatusChange={handleStatusChange}
            theme="light"
          />
        </div>
        <div className="emulator-right" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="emulator-info-bar">
            <img src={rnLogo} alt="React Native Logo" />
            Write or edit your React Native code below. Changes are rendered in real time.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, marginTop: 24 }}>
            <h3 style={{ flex: 1, margin: 0 }}>React Native Code</h3>
            <div className="code-status">
              {compileStatus === 'compiling' && <span>⏳ Compiling...</span>}
              {compileStatus === 'success' && <span className="status-success">✅ Compile Success</span>}
              {compileStatus === 'error' && <span className="status-error">❌ Compile Failed</span>}
            </div>
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
                styleActiveLine: true,
                lint: true,
                extraKeys: {
                  'Ctrl-Space': 'autocomplete',
                  'Tab': 'indentMore',
                  'Shift-Tab': 'indentLess'
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileEmulator; 