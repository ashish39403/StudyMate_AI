import React from "react";

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
     
    console.error("ErrorBoundary caught:", err, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 animated-gradient-bg">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-display font-bold mb-2">
            Something broke
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {this.state.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
