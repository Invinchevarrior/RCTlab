import React, { useState, useEffect } from 'react';
import { Controlled as ControlledEditor } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/eclipse.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import { useHistory, useLocation } from 'react-router-dom';

const DEFAULT_CODE = {
  'Python 2.7 (PyPy 7.3.12)': 'def add(a, b):\n    return a + b\n\nprint add(1, 2)',
  'Python 3.10 (PyPy 7.3.12)': 'def add(a, b):\n    return a + b\n\nprint(add(1, 2))',
  'Python 3.9 (PyPy 7.3.12)': 'def add(a, b):\n    return a + b\n\nprint(add(1, 2))',
  'Python for ML (3.11.2)': 'def add(a, b):\n    return a + b\n\nprint(add(1, 2))',
  'Python for ML (3.12.5)': 'def add(a, b):\n    return a + b\n\nprint(add(1, 2))',
  'Python for ML (3.13.2)': 'def add(a, b):\n    return a + b\n\nprint(add(1, 2))',
  'Python for ML (3.7.7)': 'def add(a, b):\n    return a + b\n\nprint(add(1, 2))',
  'Java (OpenJDK 14.0.1)': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println(add(1, 2));\n    }\n    public static int add(int a, int b) {\n        return a + b;\n    }\n}',
  'Java Test (OpenJDK 14.0.1, JUnit Platform Console Standalone 1.6.2)': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println(add(1, 2));\n    }\n    public static int add(int a, int b) {\n        return a + b;\n    }\n}',
  'C (Clang 10.0.1)': '#include <stdio.h>\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    printf("%d\\n", add(1, 2));\n    return 0;\n}',
  'C (GCC 10.0.1)': '#include <stdio.h>\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    printf("%d\\n", add(1, 2));\n    return 0;\n}',
  'C++ (Clang 10.0.1)': '#include <iostream>\nusing namespace std;\nint add(int a, int b) { return a + b; }\nint main() { cout << add(1, 2) << endl; return 0; }',
  'C++ (Clang 9.0.1)': '#include <iostream>\nusing namespace std;\nint add(int a, int b) { return a + b; }\nint main() { cout << add(1, 2) << endl; return 0; }',
};



function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

// 自动生成所有主流语言的两数相加示例
const GEN_ADD_CODE = (langName) => {
  const l = langName.toLowerCase();
  if (l.includes('python')) return 'def add(a, b):\n    return a + b\n\nprint(add(1, 2))';
  if (l.includes('java')) return 'public class Main {\n    public static void main(String[] args) {\n        System.out.println(add(1, 2));\n    }\n    public static int add(int a, int b) {\n        return a + b;\n    }\n}';
  if (l.includes('c++')) return '#include <iostream>\nusing namespace std;\nint add(int a, int b) { return a + b; }\nint main() { cout << add(1, 2) << endl; return 0; }';
  if (l.includes('c#')) return 'using System;\nclass Program {\n    static int Add(int a, int b) { return a + b; }\n    static void Main() { Console.WriteLine(Add(1, 2)); }\n}';
  if (l.includes('c (') || l === 'c') return '#include <stdio.h>\n\nint add(int a, int b) { return a + b; }\nint main() { printf("%d\\n", add(1, 2)); return 0; }';
  if (l.includes('javascript') || l.includes('node.js')) return 'function add(a, b) { return a + b; }\nconsole.log(add(1, 2));';
  if (l.includes('typescript')) return 'function add(a: number, b: number): number { return a + b; }\nconsole.log(add(1, 2));';
  if (l.includes('go')) return 'package main\nimport "fmt"\nfunc add(a, b int) int { return a + b }\nfunc main() { fmt.Println(add(1, 2)) }';
  if (l.includes('ruby')) return 'def add(a, b)\n  a + b\nend\nputs add(1, 2)';
  if (l.includes('php')) return '<?php\nfunction add($a, $b) { return $a + $b; }\necho add(1, 2);';
  if (l.includes('swift')) return 'func add(_ a: Int, _ b: Int) -> Int { return a + b }\nprint(add(1, 2))';
  if (l.includes('kotlin')) return 'fun add(a: Int, b: Int): Int = a + b\nfun main() { println(add(1, 2)) }';
  if (l.includes('scala')) return 'def add(a: Int, b: Int): Int = a + b\nprintln(add(1, 2))';
  if (l.includes('rust')) return 'fn add(a: i32, b: i32) -> i32 { a + b }\nfn main() { println!("{}", add(1, 2)); }';
  if (l.includes('perl')) return 'sub add { $_[0] + $_[1] }\nprint add(1, 2), "\n";';
  if (l.includes('haskell')) return 'add a b = a + b\nmain = print (add 1 2)';
  if (l.includes('lua')) return 'function add(a, b) return a + b end\nprint(add(1, 2))';
  if (l.includes('r (')) return 'add <- function(a, b) { a + b }\ncat(add(1, 2), "\n")';
  if (l.includes('bash')) return 'echo $((1 + 2))';
  if (l.includes('fortran')) return 'program add\n  print *, 1 + 2\nend program add';
  if (l.includes('visual basic') || l.includes('vb.net')) return 'Module Module1\n    Function Add(a As Integer, b As Integer) As Integer\n        Return a + b\n    End Function\n    Sub Main()\n        Console.WriteLine(Add(1, 2))\n    End Sub\nEnd Module';
  if (l.includes('f#')) return 'let add a b = a + b\nprintfn "%d" (add 1 2)';
  if (l.includes('nim')) return 'proc add(a, b: int): int = a + b\necho add(1, 2)';
  return '// Two sum example not available for this language.';
};

function CodeRunner() {
  const [languages, setLanguages] = useState([]);
  const [language, setLanguage] = useState('python');
  const [languageId, setLanguageId] = useState(null);
  const [code, setCode] = useState(DEFAULT_CODE['python']);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState('');
  const [outputColor, setOutputColor] = useState('#23272f');
  const history = useHistory();
  const query = useQuery();
  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(false);
  const [problemError, setProblemError] = useState('');

  // 获取支持的语言列表
  useEffect(() => {
    async function fetchLanguages() {
      const resp = await fetch('https://judge0-extra-ce.p.rapidapi.com/languages', {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'judge0-extra-ce.p.rapidapi.com',
          'x-rapidapi-key': 'dcae8c75f0msh8da4bab5dfa0d1fp1b77e7jsn3fb20c2b9452',
        },
      });
      const langs = await resp.json();
      console.log('All Judge0 languages:', langs);
      if (!Array.isArray(langs)) {
        alert('Failed to fetch languages: API did not return an array.');
        setLanguages([]);
        return;
      }
      // 支持 C, C++, Java, Python（所有非MPI）
      const filtered = langs.filter(l =>
        ((l.name.toLowerCase().includes('python') && !l.name.toLowerCase().includes('mpi')) ||
        l.name.toLowerCase().includes('java') ||
        l.name.toLowerCase().includes('c++') ||
        (l.name.toLowerCase().includes('c') && !l.name.toLowerCase().includes('c#')))
      );
      setLanguages(filtered);
      // 默认选 Python 3.10（如有），否则选第一个
      const py310 = filtered.find(l => l.name.toLowerCase().includes('python 3.10'));
      setLanguage(py310 ? py310.name : filtered[0]?.name);
      setLanguageId(py310 ? py310.id : filtered[0]?.id);
      setCode(GEN_ADD_CODE(py310 ? py310.name : filtered[0]?.name));
    }
    fetchLanguages();
  }, []);

  useEffect(() => {
    const id = query.get('id');
    if (!id) return;
    setProblemLoading(true);
    setProblemError('');
    fetch(`http://localhost:5000/api/problems/${id}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setProblemError(data.error);
        else setProblem(data);
        setProblemLoading(false);
      })
      .catch(() => {
        setProblemError('Failed to load problem');
        setProblemLoading(false);
      });
  }, [query]);

  // 切换语言时同步 id
  const handleLanguageChange = (e) => {
    const langName = e.target.value;
    setLanguage(langName);
    const langObj = languages.find(l => l.name === langName);
    setLanguageId(langObj ? langObj.id : null);
    setCode(GEN_ADD_CODE(langName));
    setOutput('');
  };

  // ControlledEditor 的 mode 适配
  const getEditorMode = () => {
    if (language.toLowerCase().includes('java')) return 'text/x-java';
    if (language.toLowerCase().includes('c++')) return 'text/x-c++src';
    if (language.toLowerCase().includes('c')) return 'text/x-csrc';
    return 'python';
  };

  const handleRun = async () => {
    setLoading(true);
    setOutput('');
    setWarnings('');
    setOutputColor('#23272f');
    const payload = {
      source_code: code,
      language_id: languageId,
      stdin: input,
    };
    console.log('Judge0 payload:', payload, typeof payload.source_code, typeof payload.language_id, typeof payload.stdin);
    try {
      const submitResp = await fetch('https://judge0-extra-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'judge0-extra-ce.p.rapidapi.com',
          'x-rapidapi-key': 'dcae8c75f0msh8da4bab5dfa0d1fp1b77e7jsn3fb20c2b9452',
        },
        body: JSON.stringify(payload),
      });
      const submitText = await submitResp.text();
      let submitData;
      try {
        submitData = JSON.parse(submitText);
      } catch (e) {
        console.error('Failed to parse Judge0 response as JSON:', submitText);
        setOutput('Failed to submit code. (Invalid JSON response)');
        setOutputColor('#d32f2f');
        setWarnings('');
        setLoading(false);
        return;
      }
      console.log('Judge0 submit response:', submitData);
      const token = submitData.token;
      if (!token) {
        setOutput('Failed to submit code. (No token)');
        setOutputColor('#d32f2f');
        setWarnings('');
        setLoading(false);
        return;
      }
      // Step 2: Poll for result
      let result = null;
      for (let i = 0; i < 20; i++) {
        const res = await fetch(`https://judge0-extra-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'judge0-extra-ce.p.rapidapi.com',
            'x-rapidapi-key': 'dcae8c75f0msh8da4bab5dfa0d1fp1b77e7jsn3fb20c2b9452',
          },
        });
        result = await res.json();
        if (result.status && (result.status.id === 3 || result.status.id === 6)) {
          // 3: Accepted, 6: Compilation Error
          break;
        }
        await new Promise(r => setTimeout(r, 700));
      }
      // 优化输出：只显示 stdout，stderr/compile_output 单独显示
      let mainOutput = (result.stdout && result.stdout.trim()) ? result.stdout : '';
      let warnOutput = '';
      let isError = false;
      if ((!mainOutput || mainOutput.trim() === '') && result.stderr && result.stderr.trim()) {
        mainOutput = result.stderr;
        isError = true;
      } else {
        if (result.stderr && result.stderr.trim()) {
          warnOutput += result.stderr;
          isError = true;
        }
        if (result.compile_output && result.compile_output.trim()) {
          warnOutput += '\n' + result.compile_output;
          isError = true;
        }
      }
      setOutput(mainOutput);
      setWarnings(warnOutput);
      setOutputColor(isError ? '#d32f2f' : '#23272f');
    } catch (err) {
      console.error('Judge0 fetch error:', err);
      setOutput('Failed to submit code. (Network or server error)');
      setOutputColor('#d32f2f');
      setWarnings('');
    }
    setLoading(false);
  };

  return (
    <div className="code-runner-root">
      <div className="code-runner-header">
        <div className="code-runner-title">Code Runner</div>
        <div>
          <button className="code-runner-btn" onClick={() => history.push('/problems')} style={{marginRight: 8}}>Problems</button>
          <button className="code-runner-btn" onClick={() => history.push('/')}>Back to Editor</button>
        </div>
      </div>
      <div className="code-runner-main">
        <div className="code-runner-question" style={{overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%'}}>
          {query.get('id') ? (
            problemLoading ? <div>Loading...</div> : problemError ? <div style={{color:'red'}}>{problemError}</div> : problem && (
              <div style={{padding: '0 0 12px 0'}}>
                <h2 style={{marginBottom: 12, fontWeight: 700, fontSize: 24}}>{problem.title}</h2>
                <div className="problem-description" style={{marginBottom: 18, fontSize: 16, lineHeight: 1.7, overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%'}}>
                  <div dangerouslySetInnerHTML={{__html: problem.description}} />
                </div>
              </div>
            )
          ) : (
            <>
              <h3>Add Two Numbers</h3>
              <p>Write a function that returns the sum of two numbers.</p>
              <div><b>Sample Input:</b> <pre>1 2</pre></div>
              <div><b>Sample Output:</b> <pre>3</pre></div>
            </>
          )}
        </div>
        <div className="code-runner-editor">
          <div className="code-runner-controls">
            <select value={language} onChange={handleLanguageChange}>
              {languages.map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
            <button className="code-runner-btn" onClick={handleRun} disabled={loading || !languageId}>
              {loading ? 'Running...' : 'Run Code'}
            </button>
          </div>
          <ControlledEditor
            value={code}
            onBeforeChange={(_e, _d, v) => setCode(v)}
            options={{
              mode: getEditorMode(),
              theme: 'eclipse',
              lineNumbers: true,
              tabSize: 4,
              indentUnit: 4,
              lineWrapping: true,
            }}
          />
          <div className="code-runner-io">
            <div>
              <div><b>Input</b></div>
              <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Custom input" />
            </div>
            <div style={{ flex: 1 }}>
              <div><b>Output</b></div>
              <div className="code-runner-output" style={{ color: outputColor }}>{output}</div>
            </div>
          </div>
          <div className="code-runner-warnings" style={{ color: '#d32f2f', marginTop: 8, whiteSpace: 'pre-wrap' }}>{warnings && (<><b>Warnings/Errors:</b><br />{warnings}</>)}</div>
        </div>
      </div>
    </div>
  );
}

export default CodeRunner; 

