// 📄 10. resources/js/utils/errorBoundary.tsx
import { Component, ComponentType, ErrorInfo, ReactNode } from 'react';

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

const DefaultErrorFallback: ComponentType<{ error: Error; retry: () => void }> = ({ error, retry }) => (
    <div className="mx-auto max-w-md p-6 text-center">
        <div className="mb-4 text-destructive">
            <svg className="mx-auto mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
            </svg>
        </div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Something went wrong</h2>
        <p className="mb-6 text-muted-foreground">{error.message}</p>
        <div className="space-x-4">
            <button
                onClick={retry}
                className="rounded-lg bg-brand-red px-4 py-2 text-brand-ink transition-colors hover:bg-[color-mix(in_oklch,var(--brand-red)_88%,black)] focus:ring-2 focus:ring-brand-red focus:ring-offset-2 focus:outline-none"
            >
                Try Again
            </button>
            <button
                onClick={() => window.location.reload()}
                className="rounded-lg border border-border px-4 py-2 text-foreground transition-colors hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
            >
                Reload Page
            </button>
        </div>
    </div>
);
