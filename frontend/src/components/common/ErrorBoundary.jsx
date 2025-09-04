import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      const containerStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '20px',
        backgroundColor: '#111827',
        color: '#e5e7eb',
        borderRadius: '8px',
        border: '1px solid #374151'
      };

      const titleStyles = {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#ef4444'
      };

      const messageStyles = {
        fontSize: '16px',
        marginBottom: '20px',
        textAlign: 'center'
      };

      const buttonStyles = {
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
      };

      const detailsStyles = {
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#1f2937',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#9ca3af',
        maxWidth: '600px',
        overflow: 'auto'
      };

      return (
        <div style={containerStyles}>
          <div style={titleStyles}>⚠️ Something went wrong</div>
          <div style={messageStyles}>
            An unexpected error occurred. Please try refreshing the page.
          </div>
          <button
            style={buttonStyles}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          {import.meta && import.meta.env && import.meta.env.MODE === 'development' && this.state.error && (
            <details style={detailsStyles}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Error Details (Development)
              </summary>
              <div>
                <strong>Error:</strong> {this.state.error.toString()}
              </div>
              <div style={{ marginTop: '10px' }}>
                <strong>Stack Trace:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
