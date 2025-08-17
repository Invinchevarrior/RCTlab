import React, { useState, useEffect } from 'react';

// Web version of React Native components
const View = ({ style, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', ...style }}>{children}</div>
);
const Text = ({ style, children }) => (
  <span style={{ fontSize: 16, ...style }}>{children}</span>
);
const Button = ({ title = 'Button', onPress, style }) => (
  <button style={{ margin: 8, padding: '8px 16px', ...style }} onClick={onPress}>{title}</button>
);

function EmulatorScreen({ code }) {
  const [error, setError] = useState('');
  const [AppComponent, setAppComponent] = useState(null);

  useEffect(() => {
    setError('');
    try {
      // Remove import statements and convert export default
      let filteredCode = code.split('\n').filter(line => !line.trim().startsWith('import')).join('\n');
      filteredCode = filteredCode.replace(/export default function/g, 'module.exports = function');
      // Use Babel to transform JSX to JS
      let transpiled = filteredCode;
      if (window.Babel) {
        transpiled = window.Babel.transform(filteredCode, { presets: ['react'] }).code;
      }
      // Inject the React Native components
      const injected = 'const { View, Text, Button } = rn || {};' + transpiled;
      // eslint-disable-next-line no-new-func
      const exports = {};
      const require = (name) => {
        if (name === 'react-native') return { View, Text, Button };
        throw new Error('Only react-native is supported');
      };
      const module = { exports };
      // eslint-disable-next-line no-new-func
      const fn = new Function('React', 'require', 'module', 'exports', 'rn', injected + '\nreturn module.exports;');
      const result = fn(React, require, module, exports, { View, Text, Button });
      // result should be a component or { default: component }
      const Comp = result && result.default ? result.default : result;
      setAppComponent(() => Comp);
    } catch (e) {
      setError(e.message);
      setAppComponent(null);
    }
  }, [code]);

  return (
    <div className="emulator-phone-frame">
      <div className="emulator-phone-screen" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {error ? (
          <div style={{ color: 'red', padding: 16 }}>Error: {error}</div>
        ) : AppComponent ? (
          <AppComponent />
        ) : (
          <div style={{ textAlign: 'center', marginTop: '50%' }}>Preview Area</div>
        )}
      </div>
    </div>
  );
}

export default EmulatorScreen; 