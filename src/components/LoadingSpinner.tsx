import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  timeout?: number; // in milliseconds
  onTimeout?: () => void;
  showRetry?: boolean;
  onRetry?: () => void;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading delicious food...",
  timeout = 15000, // 15 seconds default
  onTimeout,
  showRetry = true,
  onRetry
}) => {
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeoutMessage(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  if (showTimeoutMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <AlertCircle className="w-16 h-16 text-orange-500" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading is taking longer than expected</h3>
          <p className="text-gray-600 mb-4">
            This might be due to slow network connection or backend server issues.
          </p>
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-400 rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
      </div>
      <p className="text-gray-600 text-lg">{message}</p>
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
