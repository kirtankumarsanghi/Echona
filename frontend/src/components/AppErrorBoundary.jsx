import React from "react";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, requestId: "" };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.setState({ requestId });
    console.error("[UI Crash]", { requestId, error });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl shadow-sm p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-4">
              ECHONA is still running, but this screen failed to render. Please refresh to continue.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-primary-700 text-white hover:bg-primary-800"
            >
              Reload App
            </button>
            {this.state.requestId ? (
              <p className="mt-3 text-xs text-slate-500">Ref: {this.state.requestId}</p>
            ) : null}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
