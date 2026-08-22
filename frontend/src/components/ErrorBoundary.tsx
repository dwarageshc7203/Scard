import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-white px-4">
          <div className="bg-[#222222] border border-[#333333] p-8 rounded-2xl max-w-lg text-center flex flex-col items-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
            <h1 className="text-2xl font-bold mb-4 font-sans tracking-tight">Something went wrong</h1>
            <p className="text-gray-400 mb-8 font-sans">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>
            <button
              onClick={() => window.location.replace("/")}
              className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Return Home
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-8 w-full bg-[#1a1a1a] p-4 rounded-lg border border-red-500/20 text-left overflow-auto max-h-48 text-xs font-mono text-red-400">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
