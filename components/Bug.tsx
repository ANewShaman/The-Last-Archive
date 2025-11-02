import React from 'react';

interface BugProps {
  x: number;
  y: number;
  onClick: () => void;
}

export const Bug: React.FC<BugProps> = ({ x, y, onClick }) => {
  return (
    <div
      className="bug"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent the miss-click handler on the overlay below from firing
        onClick();
      }}
    >
      🪲
    </div>
  );
};
