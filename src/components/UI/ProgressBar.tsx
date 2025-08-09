import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: 'green' | 'orange' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'green',
  size = 'md',
  showPercentage = false,
  animated = true
}) => {
  const colors = {
    green: 'bg-green-600',
    orange: 'bg-orange-500',
    blue: 'bg-blue-600'
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-1000 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-right text-sm text-gray-600 mt-1">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;