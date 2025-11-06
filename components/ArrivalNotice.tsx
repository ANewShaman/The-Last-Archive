import React, { useEffect, useState, useRef } from "react";

export default function ArrivalNotice({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void; }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);
  const skippedRef = useRef(false);

  // Effect to trigger the entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100); // Short delay for styles to apply
    return () => clearTimeout(timer);
  }, []);

  // Effect to show skip prompt
  useEffect(() => {
    const timer = setTimeout(() => {
        if (!visible || exiting) return;
        setShowSkipPrompt(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [visible, exiting]);

  // Effect to handle key press for continuing or skipping
  useEffect(() => {
    if (!visible || exiting) return;

    const handleKeyPress = (e: KeyboardEvent) => {
        if (skippedRef.current) return;

        if (showSkipPrompt && ["x", "X", "Enter", " "].includes(e.key)) {
            skippedRef.current = true;
            onSkip();
        } else {
            setExiting(true);
            setTimeout(onComplete, 500); // Match exit animation duration
        }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [visible, exiting, onComplete, onSkip, showSkipPrompt]);

  const visibilityClass = visible ? 'visible' : '';
  const exitingClass = exiting ? 'exiting' : '';

  return (
    <div id="arrival-notice" className={`${visibilityClass} ${exitingClass}`}>
      <div className="gta-location">
        &gt; LOCATION: OFFLINE ARCHIVE, SECTOR-7G
      </div>
      <div className="gta-briefing">
        {`BRIEFING // GHOST-7
You are a Data-Runner, one of the last couriers of the collapsed net. Your mission: infiltrate this dead-zone archive and secure a fragment of human history before it's lost to the noise.

This is the big one. Archive It!. Get the data, get out.

Jackpot.`}
      </div>
      <div className="gta-title-container">
        <h1 className="gta-main-title">ARCHIVE IT!</h1>
        <p className="gta-subtitle">SECURE THE FRAGMENT</p>
      </div>
       {showSkipPrompt && !exiting && (
          <div className="skip-flash" style={{ position: 'absolute', bottom: '8rem', width: '100%' }}>
              [PRESS X TO FAST BOOT]
          </div>
      )}
      <div className="gta-prompt">
        [PRESS ANY KEY]
      </div>
    </div>
  );
}