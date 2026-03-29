import { useState, ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
}

export function Card({ title, children, defaultCollapsed = false, className = "" }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`bg-black/80 text-white p-4 rounded-lg shadow-lg border border-gray-700 font-mono text-sm backdrop-blur-sm pointer-events-auto ${className}`}>
      <div 
        className={`flex justify-between items-center cursor-pointer select-none ${isCollapsed ? '' : 'border-b border-gray-600 pb-2 mb-3'}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="font-bold tracking-wider uppercase text-xs text-gray-200">{title}</h3>
        <span className="text-gray-500 text-[10px] ml-4">{isCollapsed ? '▼ EXPAND' : '▲ COLLAPSE'}</span>
      </div>
      
      {!isCollapsed && (
        <div className="animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
