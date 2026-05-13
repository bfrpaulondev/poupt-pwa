import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="text-4xl mb-4">😵</div>
          <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Algo correu mal
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            {this.state.error?.message || 'Erro inesperado'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white gold-gradient"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
