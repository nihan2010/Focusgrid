import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4">
                    <div className="glass-panel border-red-500/30 p-8 max-w-md w-full text-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl font-black">!</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">App encountered an error.</h1>
                        <p className="text-gray-400 text-sm mb-8">
                            Don't worry, your data is safe in local storage. Click below to reload the application.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-accent-500 hover:bg-accent-600 text-charcoal-950 font-bold py-3 px-6 rounded-xl transition-colors w-full"
                        >
                            Reload Application
                        </button>
                        <details className="mt-6 text-left opacity-30 mx-auto w-full">
                            <summary className="text-xs text-gray-400 cursor-pointer">Technical Details</summary>
                            <pre className="text-[10px] text-red-400 mt-2 overflow-x-auto p-2 bg-black/50 rounded">{this.state.error?.message}</pre>
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
