import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, Database, Wifi, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  networkLatency: number;
}

interface PerformanceMonitorProps {
  showDetails?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  showDetails = false, 
  onMetricsUpdate 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    networkLatency: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  // Measure render performance
  const measureRenderTime = useCallback(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const renderTime = end - start;
      setMetrics(prev => ({ ...prev, renderTime }));
      onMetricsUpdate?.({ ...prev, renderTime });
    };
  }, [onMetricsUpdate]);

  // Measure API response time
  const measureApiTime = useCallback(async (apiCall: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      const apiResponseTime = end - start;
      setMetrics(prev => ({ ...prev, apiResponseTime }));
      onMetricsUpdate?.({ ...prev, apiResponseTime });
      return result;
    } catch (error) {
      const end = performance.now();
      const apiResponseTime = end - start;
      setMetrics(prev => ({ ...prev, apiResponseTime }));
      onMetricsUpdate?.({ ...prev, apiResponseTime });
      throw error;
    }
  }, [onMetricsUpdate]);

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100;
        setMetrics(prev => ({ ...prev, memoryUsage }));
        onMetricsUpdate?.({ ...prev, memoryUsage });
      }
    };

    const interval = setInterval(updateMemoryUsage, 5000);
    return () => clearInterval(interval);
  }, [onMetricsUpdate]);

  // Monitor network performance
  useEffect(() => {
    const measureNetworkLatency = async () => {
      try {
        const start = performance.now();
        await fetch('/api/health', { method: 'HEAD' });
        const end = performance.now();
        const networkLatency = end - start;
        setMetrics(prev => ({ ...prev, networkLatency }));
        onMetricsUpdate?.({ ...prev, networkLatency });
      } catch (error) {
        // Network error, set high latency
        setMetrics(prev => ({ ...prev, networkLatency: 9999 }));
        onMetricsUpdate?.({ ...prev, networkLatency: 9999 });
      }
    };

    const interval = setInterval(measureNetworkLatency, 10000);
    return () => clearInterval(interval);
  }, [onMetricsUpdate]);

  // Performance indicators
  const getPerformanceStatus = () => {
    const { renderTime, apiResponseTime, memoryUsage, networkLatency } = metrics;
    
    if (renderTime > 100 || apiResponseTime > 2000 || memoryUsage > 80 || networkLatency > 5000) {
      return 'poor';
    } else if (renderTime > 50 || apiResponseTime > 1000 || memoryUsage > 60 || networkLatency > 2000) {
      return 'fair';
    } else {
      return 'good';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <Activity className="w-4 h-4 text-green-500" />;
      case 'fair': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isVisible && !showDetails) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-400 hover:text-gray-600"
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>

      {isVisible && (
        <div className="space-y-3">
          {/* Render Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">Render Time</span>
            </div>
            <span className={`text-xs font-medium ${metrics.renderTime > 100 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.renderTime.toFixed(1)}ms
            </span>
          </div>

          {/* API Response Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">API Response</span>
            </div>
            <span className={`text-xs font-medium ${metrics.apiResponseTime > 2000 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.apiResponseTime.toFixed(0)}ms
            </span>
          </div>

          {/* Memory Usage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">Memory</span>
            </div>
            <span className={`text-xs font-medium ${metrics.memoryUsage > 80 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.memoryUsage.toFixed(1)}%
            </span>
          </div>

          {/* Network Latency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">Network</span>
            </div>
            <span className={`text-xs font-medium ${metrics.networkLatency > 5000 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.networkLatency === 9999 ? 'Error' : `${metrics.networkLatency.toFixed(0)}ms`}
            </span>
          </div>

          {/* Overall Status */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Overall Status</span>
              <div className="flex items-center space-x-1">
                {getStatusIcon(getPerformanceStatus())}
                <span className={`text-xs font-medium ${getStatusColor(getPerformanceStatus())}`}>
                  {getPerformanceStatus().toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;

// Export performance measurement utilities
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const renderStart = performance.now();
    
    useEffect(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      if (renderTime > 100) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(1)}ms`);
      }
    });

    return <Component {...props} ref={ref} />;
  });
};
