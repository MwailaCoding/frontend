import React from 'react';

interface MorphingBlobProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'green' | 'orange' | 'blue' | 'purple';
  className?: string;
  children?: React.ReactNode;
}

const MorphingBlob: React.FC<MorphingBlobProps> = ({
  size = 'md',
  color = 'green',
  className = '',
  children
}) => {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  const colors = {
    green: 'bg-gradient-to-br from-green-400 to-green-600',
    orange: 'bg-gradient-to-br from-orange-400 to-orange-600',
    blue: 'bg-gradient-to-br from-blue-400 to-blue-600',
    purple: 'bg-gradient-to-br from-purple-400 to-purple-600'
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${sizes[size]} 
          ${colors[color]} 
          animate-morphing 
          opacity-20 
          absolute 
          top-1/2 
          left-1/2 
          transform 
          -translate-x-1/2 
          -translate-y-1/2
          blur-xl
        `}
      />
      <div
        className={`
          ${sizes[size]} 
          ${colors[color]} 
          animate-morphing 
          opacity-40 
          absolute 
          top-1/2 
          left-1/2 
          transform 
          -translate-x-1/2 
          -translate-y-1/2
          blur-lg
        `}
        style={{ animationDelay: '2s' }}
      />
      <div
        className={`
          ${sizes[size]} 
          ${colors[color]} 
          animate-morphing 
          opacity-60 
          absolute 
          top-1/2 
          left-1/2 
          transform 
          -translate-x-1/2 
          -translate-y-1/2
          blur-md
        `}
        style={{ animationDelay: '4s' }}
      />
      {children && (
        <div className="relative z-10 flex items-center justify-center h-full">
          {children}
        </div>
      )}
    </div>
  );
};

export default MorphingBlob;