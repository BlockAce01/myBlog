"use client";

import React, { ReactNode, useState, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface ErrorState {
  hasError: boolean;
  error?: Error;
}

export const AdminErrorBoundary: React.FC<Props> = ({ children }) => {
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });

  const handleError = useCallback((error: Error) => {
    console.error("Admin Error Boundary caught an error:", error);
    setErrorState({ hasError: true, error });
  }, []);

  const handleRetry = useCallback(() => {
    setErrorState({ hasError: false, error: undefined });
  }, []);

  if (errorState.hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              An unexpected error occurred in the admin interface. This has been
              logged and will be investigated.
            </AlertDescription>
          </Alert>

          <div className="mt-4 flex gap-2">
            <Button onClick={handleRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/admin/dashboard")}
              className="flex-1"
            >
              Go to Dashboard
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && errorState.error && (
            <details className="mt-4 p-4 bg-gray-100 rounded-md text-sm">
              <summary className="cursor-pointer font-medium">
                Error Details (Development)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs">
                {errorState.error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundaryWrapper onError={handleError}>
      {children}
    </ErrorBoundaryWrapper>
  );
};

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  onError: (error: Error) => void;
}

class ErrorBoundaryWrapper extends React.Component<ErrorBoundaryWrapperProps> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}
