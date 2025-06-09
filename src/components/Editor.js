import React, { useState } from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/theme/eclipse.css'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/css/css'
import { Controlled as ControlledEditor } from 'react-codemirror2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCompressAlt, faExpandAlt } from '@fortawesome/free-solid-svg-icons'

export default function Editor(props) {
  const {
    language,
    displayName,
    value,
    onChange,
    theme = 'light',
    width = 33.33,
  } = props
  const [open, setOpen] = useState(true)

  // 主题映射
  const codeMirrorTheme = theme === 'dark' ? 'material' : 'eclipse';

  function handleChange(editor, data, value) {
    onChange(value)
  }

  return (
    <div
      className={`editor-container ${open ? '' : 'collapsed'}`}
      style={{ width: `${width}%` }}
    >
      <div className="editor-title">
        <span>{displayName}</span>
        <span style={{ flex: 1 }}></span>
        <button
          type="button"
          className="expand-collapse-btn"
          onClick={() => setOpen(prevOpen => !prevOpen)}
          style={{ marginLeft: 'auto' }}
        >
          <FontAwesomeIcon icon={open ? faCompressAlt : faExpandAlt} />
        </button>
      </div>
      <div className="code-mirror-wrapper">
      <ControlledEditor
        onBeforeChange={handleChange}
        value={value}
        className="code-mirror-wrapper"
        options={{
          lineWrapping: true,
          lint: true,
          mode: language,
            theme: codeMirrorTheme,
          lineNumbers: true
        }}
      />
      </div>
    </div>
  )
}
