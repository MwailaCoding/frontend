import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { checkBackendHealth } from '../config/api';

interface BackendStatusProps {
  showDetails?: boolean;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ showDetails = false }) => {
  const [status, setStatus] = useState<{
    isHealthy: boolean;
    status: number;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      setLoading(true);
      const healthStatus = await checkBackendHealth();
      setStatus(healthStatus);
      setLoading(false);
    };

    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        <span>Checking backend...</span>
      </div>
    );
  }

  if (!status) return null;

  const getStatusIcon = () => {
    if (status.isHealthy) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status.status === 502) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    if (status.isHealthy) return 'text-green-600';
    if (status.status === 502) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="flex items-center space-x-2">
      {getStatusIcon()}
      <span className={`text-sm ${getStatusColor()}`}>
        {status.isHealthy ? 'Backend Online' : 'Backend Issue'}
      </span>
      {showDetails && (
        <span className="text-xs text-gray-500">
          ({status.message})
        </span>
      )}
    </div>
  );
};

export default BackendStatus;
