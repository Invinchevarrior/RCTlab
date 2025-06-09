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
  const [html, setHtml] = useLocalStorage('html', '')
  const [css, setCss] = useLocalStorage('css', '')
  const [js, setJs] = useLocalStorage('js', '')
  const [srcDoc, setSrcDoc] = useState('')
  const [theme, setTheme] = useState('light')
  const [widths, setWidths] = useState([33.33, 33.33, 33.34]) // 三栏宽度百分比
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

  // 拖动分隔线
  const handleResize = (index, dx, parentWidth) => {
    // index: 0=html/css分隔，1=css/js分隔
    const total = widths[index] + widths[index + 1]
    let left = ((widths[index] * parentWidth + dx) / parentWidth) * 100
    let right = total - left
    // 限制最小宽度10%
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
