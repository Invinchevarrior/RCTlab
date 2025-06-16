import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import Editor from './Editor'
import Login from './Login'
import Register from './Register'
import useLocalStorage from '../hooks/useLocalStorage'
import CodeRunner from './CodeRunner'
import Problems from './Problems'
import ProblemDetail from './ProblemDetail'

function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/coderunner" component={CodeRunner} />
      <Route path="/problems/:id" component={ProblemDetail} />
      <Route path="/problems" component={Problems} />
      <Route
        exact
        path="/"
        render={() =>
          localStorage.getItem('currentUser')
            ? <EditorPage />
            : <Redirect to="/login" />
        }
      />
      <Redirect to="/login" />
    </Switch>
  )
}

function EditorPage() {
  const [html, setHtml] = useLocalStorage('html', `<div class="todo-app">
  <h1>My Todo List</h1>
  <div class="input-section">
    <input type="text" id="todoInput" placeholder="Enter a new todo...">
    <button onclick="addTodo()">Add</button>
  </div>
  <ul id="todoList">
    <li>
      <span>Learn React</span>
      <button onclick="removeTodo(this)">Complete</button>
    </li>
    <li>
      <span>Review JavaScript</span>
      <button onclick="removeTodo(this)">Complete</button>
    </li>
  </ul>
</div>`)
  const [css, setCss] = useLocalStorage('css', `body {
    font-family: 'Arial', sans-serif;
    background-color: #f0f2f5;
    display: flex;
    justify-content: center;
    padding: 20px;
}

.todo-app {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 500px;
}

h1 {
    color: #1a73e8;
    text-align: center;
    margin-bottom: 20px;
}

.input-section {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

button {
    background: #1a73e8;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background: #1557b0;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #f8f9fa;
    margin-bottom: 8px;
    border-radius: 4px;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

li button {
    background: #dc3545;
    font-size: 14px;
    padding: 4px 8px;
}

li button:hover {
    background: #bb2d3b;
}`)
  const [js, setJs] = useLocalStorage('js', `function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text) {
        const list = document.getElementById('todoList');
        const li = document.createElement('li');
        li.innerHTML = \`
            <span>\${text}</span>
            <button onclick="removeTodo(this)">Complete</button>
        \`;
        list.appendChild(li);
        input.value = '';
    }
}

function removeTodo(button) {
    const li = button.parentElement;
    li.style.opacity = '0';
    li.style.transform = 'translateX(100px)';
    li.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        li.remove();
    }, 300);
}

// Add event listener for Enter key in input
document.getElementById('todoInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});`)
  const [srcDoc, setSrcDoc] = useState('')
  const [theme, setTheme] = useState('light')
  const [widths, setWidths] = useState([33.33, 33.33, 33.34]) // Three-column width percentage
  const history = useHistory()
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <body>${html}</body>
          <style>${css}</style>
          <script>${js}</script>
        </html>
      `)
    }, 250)

    return () => clearTimeout(timeout)
  }, [html, css, js])

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    history.push('/login')
  }

  const handleCodeRunner = () => {
    history.push('/coderunner')
  }

  const handleProblems = () => {
    history.push('/problems')
  }

  // Drag the divider
  const handleResize = (index, dx, parentWidth) => {
    // index: 0=html/css divider, 1=css/js divider
    const total = widths[index] + widths[index + 1]
    let left = ((widths[index] * parentWidth + dx) / parentWidth) * 100
    let right = total - left
    // Limit the minimum width to 10%
    if (left < 10) { left = 10; right = total - 10 }
    if (right < 10) { right = 10; left = total - 10 }
    const newWidths = [...widths]
    newWidths[index] = left
    newWidths[index + 1] = right
    setWidths(newWidths)
  }

  return (
    <div className={`editor-root ${theme}`}>
      <div className="editor-header">
        <div className="user-info">Hello, {user.username || 'User'}</div>
        <div className="toolbar">
          <button onClick={handleProblems}>Problems</button>
          <button onClick={handleCodeRunner}>Code Runner</button>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? 'Dark Theme' : 'Light Theme'}
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="pane top-pane" style={{ display: 'flex', width: '100%' }}>
        <Editor
          language="xml"
          displayName="HTML"
          value={html}
          onChange={setHtml}
          theme={theme}
          width={widths[0]}
          onResize={(dx, parentWidth) => handleResize(0, dx, parentWidth)}
          showResizeHandle={true}
        />
        <Editor
          language="css"
          displayName="CSS"
          value={css}
          onChange={setCss}
          theme={theme}
          width={widths[1]}
          onResize={(dx, parentWidth) => handleResize(1, dx, parentWidth)}
          showResizeHandle={true}
        />
        <Editor
          language="javascript"
          displayName="JS"
          value={js}
          onChange={setJs}
          theme={theme}
          width={widths[2]}
          showResizeHandle={false}
        />
      </div>
      <div className="pane">
        <iframe
          srcDoc={srcDoc}
          title="output"
          sandbox="allow-scripts"
          frameBorder="0"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  )
}

export default App;
