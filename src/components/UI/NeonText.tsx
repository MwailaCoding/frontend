import React from 'react';

interface NeonTextProps {
  children: React.ReactNode;
  color?: 'green' | 'orange' | 'blue' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  className?: string;
}

const NeonText: React.FC<NeonTextProps> = ({
  children,
  color = 'green',
  size = 'md',
  animated = true,
  className = ''
}) => {
  const colors = {
    green: 'text-green-400',
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400'
  };

  const shadows = {
    green: 'drop-shadow-[0_0_5px_#22c55e] drop-shadow-[0_0_10px_#22c55e] drop-shadow-[0_0_15px_#22c55e]',
    orange: 'drop-shadow-[0_0_5px_#f97316] drop-shadow-[0_0_10px_#f97316] drop-shadow-[0_0_15px_#f97316]',
    blue: 'drop-shadow-[0_0_5px_#3b82f6] drop-shadow-[0_0_10px_#3b82f6] drop-shadow-[0_0_15px_#3b82f6]',
    purple: 'drop-shadow-[0_0_5px_#8b5cf6] drop-shadow-[0_0_10px_#8b5cf6] drop-shadow-[0_0_15px_#8b5cf6]',
    pink: 'drop-shadow-[0_0_5px_#ec4899] drop-shadow-[0_0_10px_#ec4899] drop-shadow-[0_0_15px_#ec4899]'
  };

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  return (
    <span
      className={`
        ${colors[color]} 
        ${shadows[color]} 
        ${sizes[size]} 
        font-bold 
        ${animated ? 'animate-neon-glow' : ''} 
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default NeonText;