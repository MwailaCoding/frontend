import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showDetails = false, 
  className = "" 
}) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'slow'>('checking');
  const [latency, setLatency] = useState<number>(0);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkConnection = async () => {
    try {
      const start = performance.now();
      const response = await fetch('https://hamilton47.pythonanywhere.com/api/health', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      const end = performance.now();
      const responseTime = end - start;
      
      setLatency(responseTime);
      setLastCheck(new Date());
      
      if (response.ok) {
        if (responseTime < 1000) {
          setStatus('online');
        } else if (responseTime < 3000) {
          setStatus('slow');
        } else {
          setStatus('slow');
        }
      } else {
        setStatus('offline');
      }
    } catch (error) {
      setStatus('offline');
      setLatency(0);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'slow':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-400 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Backend Online';
      case 'slow':
        return 'Backend Slow';
      case 'offline':
        return 'Backend Offline';
      default:
        return 'Checking...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-600';
      case 'slow':
        return 'text-yellow-600';
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {getStatusIcon()}
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      
      {showDetails && status !== 'checking' && (
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {status === 'online' && (
            <span>• {latency.toFixed(0)}ms</span>
          )}
          {status === 'slow' && (
            <span>• {latency.toFixed(0)}ms (slow)</span>
          )}
          {status === 'offline' && (
            <span>• Last check: {lastCheck.toLocaleTimeString()}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
