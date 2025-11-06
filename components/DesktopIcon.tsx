
import React from 'react';

interface DesktopIconProps {
  name: string;
  onDoubleClick: () => void;
  disabled?: boolean;
}

const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const ExeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

export const DesktopIcon: React.FC<DesktopIconProps> = ({ name, onDoubleClick, disabled = false }) => {
  const isExe = name.endsWith('.exe');

  return (
    <div 
      className={`flex flex-col items-center justify-center w-24 h-24 text-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'desktop-icon-interactive hover:bg-lime-900/50'}`}
      onDoubleClick={!disabled ? onDoubleClick : undefined}
    >
      {isExe ? <ExeIcon /> : <FileIcon />}
      <span className="mt-1 text-xs break-words w-full">{name}</span>
    </div>
  );
};