import { Component } from 'react';
import { logError } from '../lib/errorLogger.js';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError(error, 'boundary', { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
          style={{ backgroundColor: '#fdf8f0' }}
        >
          <p className="text-lg font-semibold text-slate-700">Something went wrong.</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
