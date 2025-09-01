import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import ErrorBoundary from './ErrorBoundary';

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

function EmulatorScreen({ code, onError, onStatusChange, theme = 'light', device }) {
  const [error, setError] = useState('');
  const [AppComponent, setAppComponent] = useState(null);
  const [errors, setErrors] = useState([]);
  const [errorLocation, setErrorLocation] = useState(null);
  const [codeCache, setCodeCache] = useState(new Map());
  const [isCompiling, setIsCompiling] = useState(false);

  // Compute frame size (fallback to defaults)
  const frameWidth = device && device.frameWidth ? device.frameWidth : 320;
  const frameHeight = device && device.frameHeight ? device.frameHeight : 640;

  // Parse error message and provide friendly suggestions
  const parseError = useCallback((error) => {
    if (error.message.includes('Unexpected token')) {
      return { 
        type: 'syntax', 
        message: 'Syntax error, please check code format',
        suggestion: 'Please check if brackets, quotes, semicolons and other syntax elements are correct'
      };
    }
    if (error.message.includes('is not defined')) {
      return { 
        type: 'reference', 
        message: 'Variable is not defined, please check variable name',
        suggestion: 'Please ensure all variables are properly declared'
      };
    }
    if (error.message.includes('Cannot read property')) {
      return { 
        type: 'property', 
        message: 'Property access error',
        suggestion: 'Please check if the object exists and the property name is correct'
      };
    }
    if (error.message.includes('Unexpected end of input')) {
      return { 
        type: 'syntax', 
        message: 'Code is incomplete, missing closing symbols',
        suggestion: 'Please check if brackets, quotes or semicolons are missing'
      };
    }
    return { 
      type: 'runtime', 
      message: error.message,
      suggestion: 'Please check if the code logic is correct'
    };
  }, []);

  // More intelligent code transformation logic
  const transformCode = useCallback((code) => {
    try {
      let transformed = code;
      
      // Handle React Native specific syntax
      transformed = transformed.replace(/StyleSheet\.create/g, '{}');
      transformed = transformed.replace(/Dimensions\.get/g, '() => ({ width: 375, height: 667 })');
      transformed = transformed.replace(/Platform\.OS/g, '"web"');
      transformed = transformed.replace(/Alert\.alert/g, 'console.log');
      
      // Remove import statements
      transformed = transformed.split('\n').filter(line => !line.trim().startsWith('import')).join('\n');
      
      // Convert export default
      transformed = transformed.replace(/export default function/g, 'module.exports = function');
      transformed = transformed.replace(/export default/g, 'module.exports =');
      
      return transformed;
    } catch (error) {
      throw new Error(`Code transformation failed: ${error.message}`);
    }
  }, []);

  // Code compilation function
  const compileCode = useCallback(async (codeToCompile) => {
    setIsCompiling(true);
    if (onStatusChange) onStatusChange('compiling');
    setError('');
    setErrors([]);
    setErrorLocation(null);

    try {
      // Check cache
      if (codeCache.has(codeToCompile)) {
        const cachedComponent = codeCache.get(codeToCompile);
        setAppComponent(() => cachedComponent);
        setIsCompiling(false);
        if (onStatusChange) onStatusChange('success');
        if (onError) onError(null);
        return;
      }

      // Transform code
      const filteredCode = transformCode(codeToCompile);
      
      // Use Babel to transform JSX
      let transpiled = filteredCode;
      if (window.Babel) {
        transpiled = window.Babel.transform(filteredCode, { 
          presets: ['react'],
          sourceMaps: true
        }).code;
      }

      // Inject React Native components
      const injected = 'const { View, Text, Button } = rn || {};' + transpiled;
      
      // Create execution environment
      const exports = {};
      const require = (name) => {
        if (name === 'react-native') return { View, Text, Button };
        throw new Error(`Unsupported import module: ${name}, only react-native is supported`);
      };
      const module = { exports };
      
      // Execute code
      // eslint-disable-next-line no-new-func
      const fn = new Function('React', 'require', 'module', 'exports', 'rn', injected + '\nreturn module.exports;');
      const result = fn(React, require, module, exports, { View, Text, Button });
      
      // Get component
      const Comp = result && result.default ? result.default : result;
      
      if (typeof Comp !== 'function') {
        throw new Error('Code must export a React component function');
      }
      
      // Cache result
      setCodeCache(prev => new Map(prev).set(codeToCompile, Comp));
      setAppComponent(() => Comp);
      
      // Notify parent component of successful compilation
      if (onError) {
        onError(null);
      }
      if (onStatusChange) onStatusChange('success');
      
    } catch (e) {
      const parsedError = parseError(e);
      setError(parsedError.message);
      setErrors([parsedError]);
      
      // Try to extract error location information
      if (e.stack) {
        const stackLines = e.stack.split('\n');
        const lineMatch = stackLines.find(line => line.includes(':'));
        if (lineMatch) {
          const match = lineMatch.match(/:(\d+):(\d+)/);
          if (match) {
            setErrorLocation({ line: parseInt(match[1]), column: parseInt(match[2]) });
          }
        }
      }
      
      setAppComponent(null);
      
      // Notify parent component of compilation failure
      if (onError) {
        onError(parsedError);
      }
      if (onStatusChange) onStatusChange('error');
    } finally {
      setIsCompiling(false);
    }
  }, [codeCache, transformCode, parseError, onError, onStatusChange]);

  // Debounced code update handling
  const debouncedCodeUpdate = useMemo(
    () => debounce(compileCode, 500),
    [compileCode]
  );

  // Listen for code changes
  useEffect(() => {
    if (code.trim()) {
      debouncedCodeUpdate(code);
    }
    
    return () => {
      debouncedCodeUpdate.cancel();
    };
  }, [code, debouncedCodeUpdate]);

  // Clean up cache
  useEffect(() => {
    const cleanup = () => {
      setCodeCache(new Map());
    };
    
    // Clean up cache every 5 minutes
    const interval = setInterval(cleanup, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="emulator-phone-frame" style={{ width: frameWidth, height: frameHeight }}>
      <div className="emulator-phone-screen" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {isCompiling ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#666'
          }}>
            <div style={{ marginBottom: 16 }}>🔄 Compiling code...</div>
            <div style={{ fontSize: 14 }}>Please wait</div>
          </div>
        ) : error ? (
          <div style={{ 
            padding: 16, 
            backgroundColor: '#fff3f3', 
            border: '1px solid #ffcdd2',
            borderRadius: 8,
            margin: 16
          }}>
            <div style={{ color: '#d32f2f', fontWeight: 'bold', marginBottom: 8 }}>
              ❌ Compilation Error
            </div>
            <div style={{ color: '#d32f2f', marginBottom: 8 }}>{error}</div>
            {errors.length > 0 && errors[0].suggestion && (
              <div style={{ color: '#666', fontSize: 14, fontStyle: 'italic' }}>
                💡 Suggestion: {errors[0].suggestion}
              </div>
            )}
            {errorLocation && (
              <div style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                📍 Error location: Line {errorLocation.line}, Column {errorLocation.column}
              </div>
            )}
          </div>
        ) : AppComponent ? (
          <ErrorBoundary>
            <AppComponent />
          </ErrorBoundary>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '50%',
            color: '#666',
            fontSize: 16
          }}>
            📱 Preview Area
            <div style={{ fontSize: 14, marginTop: 8 }}>
              Write React Native code in the editor on the right
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// PropTypes validation
EmulatorScreen.propTypes = {
  code: PropTypes.string.isRequired,
  onError: PropTypes.func,
  onStatusChange: PropTypes.func,
  theme: PropTypes.oneOf(['light', 'dark']),
  device: PropTypes.shape({
    frameWidth: PropTypes.number,
    frameHeight: PropTypes.number
  })
};

// Default props
EmulatorScreen.defaultProps = {
  theme: 'light'
};

export default EmulatorScreen; 