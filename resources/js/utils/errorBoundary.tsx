// 📄 10. resources/js/utils/errorBoundary.tsx
import { Component, ReactNode, ComponentType, ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: ComponentType<{ error: Error; retry: () => void }> = ({ 
  error, 
  retry 
}) => (
  <div className="p-6 text-center max-w-md mx-auto">
    <div className="text-red-600 mb-4">
      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
      Something went wrong
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6">{error.message}</p>
    <div className="space-x-4">
      <button
        onClick={retry}
        className="px-4 py-2 bg-[#F57979] text-white rounded-lg hover:bg-[#e26d6d] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F57979] focus:ring-offset-2"
      >
        Try Again
      </button>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        Reload Page
      </button>
    </div>
  </div>
);