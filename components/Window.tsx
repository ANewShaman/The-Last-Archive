import React, { useState, useRef, useEffect, useCallback } from 'react';
// Fix: Correctly import exported types from types.ts
import { WindowState, Position } from '../types';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  windowState: WindowState;
  onFocus: () => void;
  onMove: (newPosition: Position) => void;
  isFrozen?: boolean;
}

export const Window: React.FC<WindowProps> = ({ title, children, onClose, windowState, onFocus, onMove, isFrozen = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, windowX: 0, windowY: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Effect to add "juice" on window open
  useEffect(() => {
    const el = windowRef.current;
    if (el) {
      el.classList.add('window-open');
      const timer = setTimeout(() => {
        el.classList.remove('window-open');
      }, 200); // Must match animation duration
      return () => clearTimeout(timer);
    }
  }, []);

  const handleMouseDownOnTitleBar = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFrozen) return;
    e.stopPropagation(); // Prevent parent's onMouseDown from firing.
    onFocus(); // Manually trigger focus.
    setIsDragging(true);
    
    // Use prop state as the source of truth for the window's start position.
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      windowX: windowState.position.x,
      windowY: windowState.position.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    
    if (isFrozen) return;
    const deltaX = e.clientX - dragStartPos.current.mouseX;
    const deltaY = e.clientY - dragStartPos.current.mouseY;

    // Proposed new absolute position relative to the desktop
    let newX = dragStartPos.current.windowX + deltaX;
    let newY = dragStartPos.current.windowY + deltaY;

    // Clamp within CRT glass container bounds if available
    const crt = document.getElementById('crt-glass');
    const elem = windowRef.current;
    if (crt && elem) {
      const crtRect = crt.getBoundingClientRect();
      const elemRect = elem.getBoundingClientRect();

      // Calculate maximum allowed positions (prevent overflow)
      const maxX = Math.max(0, crtRect.width - elemRect.width);
      const maxY = Math.max(0, crtRect.height - elemRect.height);

      // Clamp new positions
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
    }

    onMove({
      x: newX,
      y: newY,
    });
}, [onMove, isFrozen]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={windowRef}
      className="window absolute flex flex-col bg-black border-2 border-lime-500"
      style={{
        transform: `translate(${windowState.position.x}px, ${windowState.position.y}px)`,
        width: `${windowState.size.width}px`,
        height: `${windowState.size.height}px`,
        zIndex: windowState.zIndex,
      }}
      onMouseDown={isFrozen ? undefined : onFocus}
    >
      <div
        className="title-bar flex justify-between items-center bg-lime-500 text-black px-2 py-0.5"
        onMouseDown={handleMouseDownOnTitleBar}
      >
        <span>{title}</span>
        <button
          className="close-btn bg-red-500 text-white w-5 h-5 flex items-center justify-center font-bold text-xs border border-black hover:bg-red-700"
          onClick={isFrozen ? undefined : onClose}
        >
          X
        </button>
      </div>
      <div className="flex-grow p-2 overflow-hidden">
        {children}
      </div>
    </div>
  );
};