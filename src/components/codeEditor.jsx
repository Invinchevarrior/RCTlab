import { Controlled as ReactCodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';

const CodeEditor = ({ code, language, onChange }) => {
  return (
    <ReactCodeMirror
      value={code}
      options={{
        mode: language === 'python' ? 'python' : 'text/x-java',
        theme: 'material',
        lineNumbers: true,
        tabSize: 4,
        lineWrapping: true
      }}
      onBeforeChange={(editor, data, value) => onChange(value)}
    />
  );
};
