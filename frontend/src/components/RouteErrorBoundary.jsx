import React from "react";

/**
 * Per-route error boundary (#22).
 * Renders a recovery UI scoped to a single route instead of crashing the whole app.
 */
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(`[RouteError] ${this.props.name || "Unknown"}:`, error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-100 mb-2">Something went wrong</h2>
            <p className="text-neutral-400 text-sm mb-6">
              This section encountered an error. The rest of the app is still working fine.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = "/dashboard"}
                className="px-5 py-2.5 bg-neutral-800 text-neutral-300 border border-neutral-600 rounded-xl text-sm font-medium hover:bg-neutral-700 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default RouteErrorBoundary;
