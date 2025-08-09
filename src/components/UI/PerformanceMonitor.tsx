import React, { useEffect, useState } from 'react';

interface PerformanceMonitorProps {
  componentName: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ componentName }) => {
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log(`${componentName} rendered ${renderCount + 1} times`);
  });

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs z-50">
      {componentName}: {renderCount}
    </div>
  );
};

export default PerformanceMonitor; 