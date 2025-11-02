import React from 'react';
import { Position } from '../types';

interface PopupProps {
  id: number;
  position: Position;
  buttonPosition: Position;
  onClose: (id: number) => void;
  onButtonMouseMove: (id: number) => void;
  isClosing?: boolean;
}

const ErrorIcon = () => (
  <div className="popup-error-icon">X</div>
);

export const Popup: React.FC<PopupProps> = ({ id, position, buttonPosition, onClose, onButtonMouseMove, isClosing }) => {
  return (
    <div className={`popup-window ${isClosing ? 'is-closing' : ''}`} style={{ top: position.y, left: position.x, width: '350px' }}>
      <div className="popup-title-bar">
        <span>Error</span>
      </div>
      <div className="popup-content flex flex-col items-center" style={{ height: '150px' }}>
        <div className="flex items-center mb-4">
          <ErrorIcon />
          <p className="text-sm">A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) + 00010E36.</p>
        </div>
        <div style={{ position: 'relative', width: '100%', height: '50px', flexGrow: 1 }}>
           <button
            className="popup-close-button"
            style={{
              top: `${buttonPosition.y}px`,
              left: `${buttonPosition.x}px`,
            }}
            onClick={() => onClose(id)}
            onMouseMove={() => onButtonMouseMove(id)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};