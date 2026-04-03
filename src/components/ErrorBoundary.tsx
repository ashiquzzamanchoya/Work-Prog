import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = parsed.error;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-danger/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-danger" size={32} />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-6 text-sm">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
