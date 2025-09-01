import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 16,
          backgroundColor: '#fff3f3',
          border: '1px solid #ffcdd2',
          borderRadius: 8,
          margin: 16,
          color: '#d32f2f'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
            ❌ Runtime Error in Preview
          </div>
          <div style={{ marginBottom: 8 }}>{this.state.error && this.state.error.toString()}</div>
          {this.state.errorInfo && (
            <details style={{ color: '#666', fontSize: 12 }}>
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
