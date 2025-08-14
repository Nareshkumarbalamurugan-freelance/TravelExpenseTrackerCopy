import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class DebugErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error);
    console.error('📊 Error info:', errorInfo);
    
    // Check if this is the fetchUser error
    if (error.message.includes('fetchUser')) {
      console.error('🎯 This is the fetchUser error!');
      console.error('📍 Stack trace:', error.stack);
    }
    
    // Log additional debug info
    console.error('🔍 Component stack:', errorInfo.componentStack);
    console.error('🕰️ Error timestamp:', new Date().toISOString());
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-lg border border-red-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">!</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Application Error</h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-red-700">
                An error occurred while loading the application. Check the browser console for detailed error information.
              </p>
            </div>
            
            {this.state.error && (
              <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
                <p className="text-xs font-mono text-red-800 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DebugErrorBoundary;
