import { Component, type ReactNode, type ErrorInfo } from "react";
import * as Sentry from "@sentry/react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen bg-surface-page flex items-center justify-center px-4">
                    <div className="max-w-md text-center">
                        <h1 className="text-lg font-semibold bg-surface-subtle  mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-sm text-text-primary mb-4">
                            {this.state.error?.message ?? "An unexpected error occurred"}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm px-4 py-2 rounded-lg   font-medium hover:opacity-90 transition-opacity"
                        >
                            Reload page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}