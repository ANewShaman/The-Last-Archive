import React, { useState, useRef, useEffect } from 'react';
// Fix: Correctly import exported types from types.ts
import { LogEntry, PuzzleState } from '../types';

interface TerminalProps {
    log: LogEntry[];
    onCommand: (command: string) => void;
    isLocked: boolean;
    currentPuzzle: PuzzleState;
    onSystemMessage: (message: string) => void;
    // Fix: Add missing isLeetspeakActive prop to match its usage in App.tsx.
    isLeetspeakActive: boolean;
    victoryCatFrame: string | null;
}

export const Terminal: React.FC<TerminalProps> = ({ log, onCommand, isLocked, currentPuzzle, onSystemMessage, isLeetspeakActive, victoryCatFrame }) => {
    const [input, setInput] = useState('');
    const endOfLogRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [log, victoryCatFrame]);

    useEffect(()=> {
        // For puzzle 7, we specifically DO NOT want to auto-focus.
        // The challenge is to click the drifting window first.
        if(!isLocked && currentPuzzle !== 7) {
            inputRef.current?.focus();
        }
    }, [isLocked, currentPuzzle]);

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        // LOGIC FOR PUZZLE 6 AFFLICTION (Fried Backspace)
        if (e.key === 'Backspace' && currentPuzzle === 6) {
            e.preventDefault(); // Prevents the backspace action
            onSystemMessage("...Back.space.key.is.non.functional. (╯°□°）╯︵ ┻━┻");
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const command = input.trim();
            if (!isLocked && command !== '') {
                setInput('');
                await onCommand(command);
            }
        }
    };

    return (
        <div className="bg-black text-lime-400 h-full flex flex-col" onClick={() => inputRef.current?.focus()}>
            <div id="terminal-log" className="flex-grow overflow-y-auto text-sm">
                {log.map((entry) => (
                    <p 
                        key={entry.id} 
                        id={`log-entry-${entry.id}`}
                        className={`terminal-msg ${entry.type} whitespace-pre-wrap`}
                    >
                        {entry.text}
                    </p>
                ))}
                {victoryCatFrame && (
                    <pre className="victory-cat whitespace-pre-wrap">
                        {victoryCatFrame}
                    </pre>
                )}
                <div ref={endOfLogRef} />
            </div>
            <div className="flex items-center">
                <span>&gt;</span>
                <input
                    ref={inputRef}
                    id="terminal-input"
                    type="text"
                    className="bg-transparent border-none text-lime-400 focus:outline-none w-full ml-2"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLocked}
                    autoFocus
                />
            </div>
        </div>
    );
};