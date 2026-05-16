"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function DefaultErrorFallback({ error }: { error: Error | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-500">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-red-800">Something went wrong</p>
        {error ? (
          <p className="text-xs text-red-600">{error.name}: {error.message}</p>
        ) : null}
      </div>
      <button
        onClick={() => window.location.reload()}
        className="rounded-2xl bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
      >
        Reload page
      </button>
    </div>
  );
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <DefaultErrorFallback error={this.state.error} />
      );
    }
    return this.props.children;
  }
}
