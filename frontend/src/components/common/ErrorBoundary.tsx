import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 에러 로깅 서비스로 전송 가능
    // console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', color: '#d32f2f', background: '#fff0f0', padding: 32, borderRadius: 12
        }}>
          <h2>문제가 발생했습니다.</h2>
          <pre style={{ color: '#b71c1c', background: '#fff', padding: 16, borderRadius: 8, maxWidth: 600, overflowX: 'auto' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={this.handleReload} style={{ marginTop: 24, padding: '8px 24px', fontSize: 16, borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 