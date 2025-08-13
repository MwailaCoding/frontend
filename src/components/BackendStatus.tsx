import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, RefreshCw, Clock, Server, Activity } from 'lucide-react';
import { API_CONFIG } from '../config/api';

interface BackendStatusProps {
  showDetails?: boolean;
  className?: string;
  showRetryButton?: boolean;
  onRetry?: () => void;
}

interface HealthCheck {
  isHealthy: boolean;
  status: number;
  message: string;
  responseTime: number;
  lastCheck: Date;
  consecutiveFailures: number;
}

const BackendStatus: React.FC<BackendStatusProps> = ({
  showDetails = false,
  className = "",
  showRetryButton = false,
  onRetry
}) => {
  const [health, setHealth] = useState<HealthCheck>({
    isHealthy: false,
    status: 0,
    message: 'Checking...',
    responseTime: 0,
    lastCheck: new Date(),
    consecutiveFailures: 0
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkBackendHealth = async (): Promise<HealthCheck> => {
    const startTime = performance.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        return {
          isHealthy: true,
          status: response.status,
          message: 'Backend is healthy',
          responseTime,
          lastCheck: new Date(),
          consecutiveFailures: 0
        };
      } else {
        return {
          isHealthy: false,
          status: response.status,
          message: `Backend returned ${response.status}`,
          responseTime,
          lastCheck: new Date(),
          consecutiveFailures: health.consecutiveFailures + 1
        };
      }
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      let message = 'Backend is unreachable';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          message = 'Backend request timed out';
        } else {
          message = error.message;
        }
      }
      
      return {
        isHealthy: false,
        status: 0,
        message,
        responseTime,
        lastCheck: new Date(),
        consecutiveFailures: health.consecutiveFailures + 1
      };
    }
  };

  const performHealthCheck = async () => {
    setIsChecking(true);
    const healthCheck = await checkBackendHealth();
    setHealth(healthCheck);
    setIsChecking(false);
  };

  useEffect(() => {
    performHealthCheck();
    
    // Check every 30 seconds
    const interval = setInterval(performHealthCheck, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    
    if (health.isHealthy) {
      if (health.responseTime < 1000) {
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      } else if (health.responseTime < 3000) {
        return <Activity className="w-4 h-4 text-yellow-500" />;
      } else {
        return <Clock className="w-4 h-4 text-orange-500" />;
      }
    } else {
      if (health.consecutiveFailures > 3) {
        return <WifiOff className="w-4 h-4 text-red-500" />;
      } else {
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      }
    }
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    
    if (health.isHealthy) {
      if (health.responseTime < 1000) return 'Online';
      if (health.responseTime < 3000) return 'Slow';
      return 'Very Slow';
    } else {
      if (health.consecutiveFailures > 3) return 'Offline';
      if (health.status === 502) return 'Bad Gateway';
      if (health.status === 503) return 'Service Unavailable';
      if (health.status === 504) return 'Gateway Timeout';
      return 'Error';
    }
  };

  const getStatusColor = () => {
    if (isChecking) return 'text-blue-600';
    
    if (health.isHealthy) {
      if (health.responseTime < 1000) return 'text-green-600';
      if (health.responseTime < 3000) return 'text-yellow-600';
      return 'text-orange-600';
    } else {
      if (health.consecutiveFailures > 3) return 'text-red-600';
      return 'text-orange-600';
    }
  };

  const getStatusDescription = () => {
    if (isChecking) return 'Checking backend connectivity...';
    
    if (health.isHealthy) {
      if (health.responseTime < 1000) return 'Backend is responding quickly';
      if (health.responseTime < 3000) return 'Backend is responding slowly';
      return 'Backend is very slow to respond';
    } else {
      if (health.status === 502) return 'Backend server is temporarily unavailable';
      if (health.status === 503) return 'Backend service is temporarily unavailable';
      if (health.status === 504) return 'Backend request timed out';
      if (health.consecutiveFailures > 3) return 'Backend has been offline for a while';
      return 'Backend connection issues detected';
    }
  };

  const getRecommendation = () => {
    if (health.isHealthy) return null;
    
    if (health.status === 502) {
      return 'Try refreshing the page in a few moments. The backend server may be restarting.';
    }
    
    if (health.consecutiveFailures > 3) {
      return 'The backend appears to be down. Please check back later or contact support.';
    }
    
    return 'Try refreshing the page. This might be a temporary network issue.';
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {getStatusIcon()}
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      
      {showDetails && (
        <div className="ml-4 p-3 bg-gray-50 rounded-lg border border-gray-200 min-w-[300px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Backend Status</h4>
            <button
              onClick={performHealthCheck}
              disabled={isChecking}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={getStatusColor()}>{getStatusText()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Response Time:</span>
              <span className="font-mono">
                {health.responseTime > 0 ? `${health.responseTime.toFixed(0)}ms` : 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Check:</span>
              <span className="text-gray-700">
                {health.lastCheck.toLocaleTimeString()}
              </span>
            </div>
            
            {health.consecutiveFailures > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Failures:</span>
                <span className="text-red-600 font-medium">
                  {health.consecutiveFailures} consecutive
                </span>
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-200">
              <p className="text-gray-700 text-xs">{getStatusDescription()}</p>
              {getRecommendation() && (
                <p className="text-orange-700 text-xs mt-1 font-medium">
                  💡 {getRecommendation()}
                </p>
              )}
            </div>
            
            {showRetryButton && onRetry && !health.isHealthy && (
              <button
                onClick={onRetry}
                className="w-full mt-3 px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Operation</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendStatus;
