import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WindowState } from '../types';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  windowState: WindowState;
  onFocus: () => void;
  onMove: (newPosition: { x: number; y: number }) => void;
  isFrozen?: boolean;
}

export const Window: React.FC<WindowProps> = ({ title, children, onClose, windowState, onFocus, onMove, isFrozen = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFrozen) return;
    onFocus();
    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isFrozen) return;

    const newPos = {
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    };
    
    // Simple boundary checks to keep it on screen
    const parent = windowRef.current?.parentElement;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      const windowRect = windowRef.current!.getBoundingClientRect();
      newPos.x = Math.max(0, Math.min(newPos.x, parentRect.width - windowRect.width));
      newPos.y = Math.max(0, Math.min(newPos.y, parentRect.height - windowRect.height));
    }
    
    onMove(newPos);
  }, [isDragging, onMove, isFrozen]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={windowRef}
      className="window absolute flex flex-col window-open"
      style={{
        left: `${windowState.position.x}px`,
        top: `${windowState.position.y}px`,
        width: `${windowState.size.width}px`,
        height: `${windowState.size.height}px`,
        zIndex: windowState.zIndex,
        pointerEvents: isFrozen ? 'none' : 'auto'
      }}
      onMouseDown={onFocus}
    >
      <div
        className="title-bar flex justify-between items-center px-2 py-1 select-none"
        onMouseDown={handleMouseDown}
      >
        <span>{title}</span>
        <button 
          onClick={onClose} 
          className="text-lime-400 hover:bg-red-700 w-5 h-5 flex items-center justify-center"
          disabled={isFrozen}
        >
          X
        </button>
      </div>
      <div className="flex-grow p-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};
