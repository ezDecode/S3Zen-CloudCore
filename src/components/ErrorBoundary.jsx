/**
 * Error Boundary Component
 * Catches React errors and prevents full app crashes
 */

import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error Boundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="bg-card rounded-2xl p-8 max-w-2xl w-full border border-border">
                        <div className="text-center">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-3xl font-display font-medium text-foreground mb-4">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                The application encountered an unexpected error. Don't worry, your data is safe.
                            </p>

                            {this.state.error && (
                                <details className="mb-6 text-left">
                                    <summary className="cursor-pointer text-brand hover:text-brand/80 mb-2 font-medium">
                                        Technical Details
                                    </summary>
                                    <div className="bg-secondary/50 rounded-lg p-4 text-sm text-foreground font-mono overflow-auto max-h-64 border border-border/50">
                                        <div className="mb-2 text-destructive">{this.state.error.toString()}</div>
                                        {this.state.errorInfo && (
                                            <pre className="text-xs text-muted-foreground">{this.state.errorInfo.componentStack}</pre>
                                        )}
                                    </div>
                                </details>
                            )}

                            <button
                                onClick={this.handleReset}
                                className="px-6 py-3 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors"
                            >
                                Return to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
