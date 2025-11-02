import React, { useState, useCallback, useEffect, useRef } from 'react';
// Fix: Correctly import exported types from types.ts
import { WindowId, WindowState, LogEntry, PuzzleState, Position, BugInfo, PopupInfo, PuzzleValidationState } from './types';
import { PROTOCOL_STEPS, INITIAL_WINDOWS_STATE, CURSED_MENU, NOBLE_CHOICES, EMOTICONS, VICTORY_CAT_FRAMES } from './constants';
import { validateCommand } from './components/puzzles';
import { DesktopIcon } from './components/DesktopIcon';
import { Window } from './components/Window';
import { Terminal } from './components/Terminal';
import { Manual } from './components/Manual';
import { AsciiTable } from './components/AsciiTable';
import { Bug } from './components/Bug';
import { Popup } from './components/Popup';
import { Lore } from './components/Lore';

// DELAY
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const getRandomEmoticon = () => {
    return EMOTICONS[Math.floor(Math.random() * EMOTICONS.length)];
}

const App: React.FC = () => {
    const [windows, setWindows] = useState<Record<WindowId, WindowState>>(INITIAL_WINDOWS_STATE);
    const [activeWindow, setActiveWindow] = useState<WindowId | null>(null);
    const [terminalLog, setTerminalLog] = useState<LogEntry[]>([]);
    const [isManualLocked, setIsManualLocked] = useState(false);
    const logIdCounter = useRef(0);
    const isMounted = useRef(true);
    
    // Refs for puzzle mechanics
    const driftingInterval = useRef<number | null>(null);
    const leetspeakInterval = useRef<number | null>(null);
    const logPurgeTimerId = useRef<number | null>(null);
    const driftSpeedMultiplier = useRef(1);

    // Refs for Bug Hunt mini-game (Finale)
    const animationFrameId = useRef<number | null>(null);
    const finaleTimerId = useRef<number | null>(null);
    const finaleGlitchIntervalId = useRef<number | null>(null);
    const bugIdCounter = useRef(0);
    const crtGlassRef = useRef<HTMLDivElement>(null);
    
    // Refs for Popup Hell mini-game
    const popupIdCounter = useRef(0);
    const popupSwarmTimerId = useRef<number | null>(null);
    const popupSpawnInterval = useRef(4000);
    
    // Refs for Power Flicker
    const flickerTimeoutId = useRef<number | null>(null);
    const randomFlickerTimerId = useRef<number | null>(null);
    
    // Ref for Victory Animation
    const victoryAnimationIntervalId = useRef<number | null>(null);

    // Ref for subtle flicker
    const subtleFlickerTimerId = useRef<number | null>(null);

    const [gameState, setGameState] = useState<{
        glitchActive: boolean;
        currentPuzzle: PuzzleState;
        selectedMeme: string | null;
        isInputLocked: boolean;
        commandHistory: string[];
        isLeetspeakActive: boolean;
        finaleActive: boolean;
        bugs: BugInfo[];
        missCount: number;
        screenFlash: 'white' | 'black' | null;
        isPopupHellActive: boolean;
        popups: PopupInfo[];
        finaleGlitch: string;
        isBugSwarmActive: boolean;
        isPowerFlickering: boolean;
        failStreak: number;
        activeGlitch: string | null;
        glitchDuration: number;
        victoryCatFrame: string | null;
        isSubtleFlickering: boolean;
    }>({
        glitchActive: true, // Glitches are now permanently on
        currentPuzzle: 0, // 0: NOBLE CHOICE
        selectedMeme: null,
        isInputLocked: true,
        commandHistory: [],
        isLeetspeakActive: false,
        finaleActive: false,
        bugs: [],
        missCount: 0,
        screenFlash: null,
        isPopupHellActive: false,
        popups: [],
        finaleGlitch: '',
        isBugSwarmActive: false,
        isPowerFlickering: false,
        failStreak: 0,
        activeGlitch: null,
        glitchDuration: 0,
        victoryCatFrame: null,
        isSubtleFlickering: false,
    });
    
    const gameStateRef = useRef(gameState);
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    const finaleActiveRef = useRef(gameState.finaleActive);
    useEffect(() => {
        finaleActiveRef.current = gameState.finaleActive;
    }, [gameState.finaleActive]);

    const runSubtleFlickerLoop = useCallback(() => {
        if (!isMounted.current) return;

        const scheduleNext = () => {
            if (subtleFlickerTimerId.current) clearTimeout(subtleFlickerTimerId.current);
            // Flicker every 5 to 20 seconds
            const delay = 5000 + Math.random() * 15000;
            subtleFlickerTimerId.current = window.setTimeout(runSubtleFlickerLoop, delay);
        };

        // Don't flicker during finale, it has its own intense glitches
        if (gameStateRef.current.finaleActive) {
            scheduleNext();
            return;
        }

        // Trigger flicker for 150ms
        setGameState(prev => ({ ...prev, isSubtleFlickering: true }));
        setTimeout(() => {
            if (isMounted.current) {
                setGameState(prev => ({ ...prev, isSubtleFlickering: false }));
            }
            scheduleNext();
        }, 150);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      isMounted.current = true;
      startRandomFlickerTimer();
      runSubtleFlickerLoop();
      return () => {
        isMounted.current = false;
        if (driftingInterval.current) clearInterval(driftingInterval.current);
        if (leetspeakInterval.current) clearInterval(leetspeakInterval.current);
        if (logPurgeTimerId.current) clearTimeout(logPurgeTimerId.current);
        if (flickerTimeoutId.current) clearTimeout(flickerTimeoutId.current);
        if (randomFlickerTimerId.current) clearTimeout(randomFlickerTimerId.current);
        if (popupSwarmTimerId.current) clearTimeout(popupSwarmTimerId.current);
        if (victoryAnimationIntervalId.current) clearInterval(victoryAnimationIntervalId.current);
        if (subtleFlickerTimerId.current) clearTimeout(subtleFlickerTimerId.current);
        cleanUpFinale();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    //WINDOW MGMT
    const bringToFront = (id: WindowId) => {
        if (activeWindow !== id) {
            setWindows(prev => {
                const windowIds = Object.keys(prev) as WindowId[];
                const sortedIds = windowIds.sort((a, b) => prev[a].zIndex - prev[b].zIndex);
                const reorderedIds = sortedIds.filter(windowId => windowId !== id);
                reorderedIds.push(id);
                const newWindowsState = { ...prev };
                reorderedIds.forEach((windowId, index) => {
                    newWindowsState[windowId] = {
                        ...newWindowsState[windowId],
                        zIndex: index + 1
                    };
                });
                return newWindowsState;
            });
            setActiveWindow(id);
        }
    };

    const toggleWindow = (id: WindowId) => {
        setWindows(prev => ({ ...prev, [id]: { ...prev[id], isOpen: !prev[id].isOpen } }));
        if (!windows[id].isOpen) {
            bringToFront(id);
        }
    };
    
    const closeWindow = (id: WindowId) => {
       setWindows(prev => ({ ...prev, [id]: { ...prev[id], isOpen: false } }));
    };
    
    const handleWindowMove = (id: WindowId, newPosition: Position) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], position: newPosition }
        }));
    };

    // GAME LOGIC
    const addToLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
        if (isMounted.current) {
            setTerminalLog(prev => [...prev, { ...entry, id: logIdCounter.current++ }]);
        }
    }, []);

    const typeMessage = useCallback(async (text: string, type: LogEntry['type'] = 'ai', delay: number = 60) => {
        const newEntryId = logIdCounter.current++;
        if (isMounted.current) {
            setTerminalLog(prev => [...prev, { id: newEntryId, text: '', type }]);
        }
        await sleep(0); 
        const entryElement = document.getElementById(`log-entry-${newEntryId}`);
        const logContainer = document.getElementById('terminal-log');
        if (!entryElement || !logContainer) {
            if (isMounted.current) {
                setTerminalLog(prev => {
                    const newLog = [...prev];
                    const entry = newLog.find(e => e.id === newEntryId);
                    if (entry) entry.text = text;
                    return newLog;
                });
            }
            return;
        }
        for (const char of text) {
            if (!isMounted.current) return;
            entryElement.textContent += char;
            logContainer.scrollTop = logContainer.scrollHeight;
            await sleep(delay);
        }
        if (isMounted.current) {
            setTerminalLog(prev => {
                const newLog = [...prev];
                const entry = newLog.find(e => e.id === newEntryId);
                if (entry) entry.text = text;
                return newLog;
            });
        }
    }, []);
    
    // --- GAME OVER SEQUENCE ---
    const initiateGameOverSequence = () => {
        if (!isMounted.current) return;
        console.log("[DEBUG] Initiating Game Over Sequence.");

        setGameState(prev => ({ ...prev, isInputLocked: true }));

        const popup = document.getElementById('sad-cat-popup');
        if (popup) {
            popup.style.display = 'block';
        }
        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.style.pointerEvents = 'none';
        }

        setTimeout(() => {
            if (isMounted.current) {
                window.location.reload();
            }
        }, 5000); // 5 second delay
    };

    // --- POWER FLICKER ---
    const stopPowerFlicker = useCallback(() => {
        if (!isMounted.current) return;
        setGameState(prev => {
            const shouldUnlock = typeof prev.currentPuzzle === 'number' || prev.currentPuzzle === 'SELECT_MEME';
            if (shouldUnlock) {
                 addToLog({ text: "...Power stable.", type: 'system' });
            }
            return {
                ...prev,
                isPowerFlickering: false,
                isInputLocked: shouldUnlock ? false : prev.isInputLocked,
            }
        });
    }, [addToLog]);

    const startPowerFlicker = useCallback(() => {
        const { isInputLocked, isPowerFlickering } = gameStateRef.current;
        if (isInputLocked || isPowerFlickering) return;

        console.log("[DEBUG] Starting Power Flicker");
        setGameState(prev => ({...prev, isPowerFlickering: true, isInputLocked: true }));
        addToLog({ text: "!!! Power Fluctuation !!! Standby...", type: 'system' });
        
        if (flickerTimeoutId.current) clearTimeout(flickerTimeoutId.current);
        flickerTimeoutId.current = window.setTimeout(stopPowerFlicker, 5000 + Math.random() * 2000); // Lasts 5-7 seconds
    }, [addToLog, stopPowerFlicker]);
    
    const startRandomFlickerTimer = useCallback(() => {
       if (randomFlickerTimerId.current) clearTimeout(randomFlickerTimerId.current);
       const delay = 40000 + Math.random() * 20000; // 40-60 seconds
       console.log(`[DEBUG] Next flicker check in ${delay / 1000} seconds.`);
       
       randomFlickerTimerId.current = window.setTimeout(() => {
           const { currentPuzzle, isInputLocked, isPowerFlickering, finaleActive } = gameStateRef.current;
           // Trigger only during puzzles, not during intro/win, and not if already flickering/disabled or in finale
           if (typeof currentPuzzle === 'number' && currentPuzzle > 0 && !finaleActive && !isInputLocked && !isPowerFlickering) {
               if (Math.random() < 0.25) { // 25% chance each check
                  startPowerFlicker();
               }
           }
           startRandomFlickerTimer(); // Reschedule
       }, delay);
    }, [startPowerFlicker]);
    
    // --- POPUP HELL MINIGAME ---
    const spawnAnotherPopup = useCallback(() => {
        if (!isMounted.current || !gameStateRef.current.isPopupHellActive) {
            if (popupSwarmTimerId.current) clearTimeout(popupSwarmTimerId.current);
            popupSwarmTimerId.current = null;
            return;
        }

        if (gameStateRef.current.popups.length >= 20) {
            if (popupSwarmTimerId.current) clearTimeout(popupSwarmTimerId.current);
            popupSwarmTimerId.current = null;
            addToLog({ text: "!!! POP-UP OVERLOAD! SYSTEM CRITICAL !!!", type: 'system' });
            addToLog({ text: "Rebooting primary core...", type: 'system' });
            initiateGameOverSequence();
            return;
        }
        
        const rect = crtGlassRef.current?.getBoundingClientRect();
        if (!rect) return;

        const newPopup: PopupInfo = {
            id: popupIdCounter.current++,
            position: { x: Math.random() * (rect.width - 350), y: Math.random() * (rect.height - 150) },
            buttonPosition: { x: 140, y: 10 },
            lastMoved: 0,
        };
        
        setGameState(prev => ({ ...prev, popups: [...prev.popups, newPopup] }));

        popupSpawnInterval.current = Math.max(500, popupSpawnInterval.current - 150);
        popupSwarmTimerId.current = window.setTimeout(spawnAnotherPopup, popupSpawnInterval.current);
    }, [addToLog]);

    const startPopupSwarm = useCallback(() => {
        if (!isMounted.current || gameStateRef.current.isPopupHellActive) return;
        
        console.log("[DEBUG] Starting Pop-up Hell Swarm");
        popupSpawnInterval.current = 4000;

        // Manually spawn the FIRST popup to avoid race condition with state update.
        const rect = crtGlassRef.current?.getBoundingClientRect();
        if (!rect) return;
        const firstPopup: PopupInfo = {
            id: popupIdCounter.current++,
            position: { x: Math.random() * (rect.width - 350), y: Math.random() * (rect.height - 150) },
            buttonPosition: { x: 140, y: 10 },
            lastMoved: 0,
        };

        setGameState(prev => ({ ...prev, isPopupHellActive: true, popups: [firstPopup] }));

        // Schedule the NEXT popup.
        popupSwarmTimerId.current = window.setTimeout(spawnAnotherPopup, popupSpawnInterval.current);
    }, [spawnAnotherPopup]);

    const stopPopupSwarm = useCallback(() => {
        if (popupSwarmTimerId.current) {
            clearTimeout(popupSwarmTimerId.current);
            popupSwarmTimerId.current = null;
        }
        if (isMounted.current) {
            setGameState(prev => ({ ...prev, popups: [], isPopupHellActive: false }));
        }
    }, []);
    
    const handleClosePopup = useCallback((id: number) => {
        if (!isMounted.current || gameStateRef.current.popups.find(p => p.id === id && p.isClosing)) {
            return;
        }

        setGameState(prev => ({
            ...prev,
            popups: prev.popups.map(p => p.id === id ? { ...p, isClosing: true } : p),
        }));

        setTimeout(() => {
            if (!isMounted.current) return;
            setGameState(prev => {
                const newPopups = prev.popups.filter(p => p.id !== id);
                // If this was the last popup, stop the swarm.
                if (newPopups.length === 0) {
                    if (popupSwarmTimerId.current) {
                        clearTimeout(popupSwarmTimerId.current);
                        popupSwarmTimerId.current = null;
                    }
                    return { ...prev, popups: [], isPopupHellActive: false };
                }
                return { ...prev, popups: newPopups };
            });
        }, 300);
    }, []);

    const handlePopupButtonMouseMove = useCallback((id: number) => {
        if (!isMounted.current) return;
        setGameState(prev => {
            const popup = prev.popups.find(p => p.id === id);
            if (!popup || popup.isClosing) return prev;

            const JUMP_COOLDOWN = 500; // Increased from 50ms
            if (Date.now() - popup.lastMoved < JUMP_COOLDOWN) return prev;

            const rect = crtGlassRef.current?.getBoundingClientRect();
            if (!rect) return prev;
            
            // Reduced chance for the whole window to jump from 25% to 10%
            if (Math.random() < 0.05) { 
                 return { ...prev, popups: prev.popups.map(p => p.id === id ? { ...p, position: { x: Math.random() * (rect.width - 350), y: Math.random() * (rect.height - 150) }, lastMoved: Date.now() } : p) };
            } else {
                return { ...prev, popups: prev.popups.map(p => p.id === id ? { ...p, buttonPosition: { x: Math.random() * (350 - 80), y: Math.random() * (50 - 30) }, lastMoved: Date.now() } : p) };
            }
        });
    }, []);
    
    // --- FINALE SEQUENCE ---
    const cleanUpFinale = useCallback(() => {
        if (finaleTimerId.current) clearTimeout(finaleTimerId.current);
        if (finaleGlitchIntervalId.current) clearInterval(finaleGlitchIntervalId.current);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        finaleTimerId.current = null;
        finaleGlitchIntervalId.current = null;
        animationFrameId.current = null;
        document.body.classList.remove('cursor-glitch');
    }, []);
    
    const completeLoop = useCallback(async () => {
        if (!isMounted.current) return;
        console.log("[DEBUG] Starting Victory Sequence");
        setGameState(prev => ({...prev, isInputLocked: true}));

        await typeMessage("...SYSTEM STABLE. ARCHIVE SECURED.");
        await sleep(500);

        let frameIndex = 0;
        victoryAnimationIntervalId.current = window.setInterval(() => {
            if (isMounted.current) {
                setGameState(prev => ({
                    ...prev,
                    victoryCatFrame: VICTORY_CAT_FRAMES[frameIndex]
                }));
                frameIndex = (frameIndex + 1) % VICTORY_CAT_FRAMES.length;
            }
        }, 200);

        await sleep(5000); // Animate for 5 seconds

        if (victoryAnimationIntervalId.current) {
            clearInterval(victoryAnimationIntervalId.current);
            victoryAnimationIntervalId.current = null;
        }

        if (isMounted.current) {
             setGameState(prev => ({...prev, victoryCatFrame: null}));
        }
        
        await typeMessage("--- ARCHIVE COMPLETE ---", "system");
        await typeMessage(`Successfully archived: ${gameStateRef.current.selectedMeme}`, "system");
        await typeMessage("You 'won'. Congratulations? <(￣︶￣)>", "system");
    }, [typeMessage]);

    const loseFinale = useCallback(async () => {
        if (!isMounted.current || !finaleActiveRef.current) return;
        
        setGameState(prev => ({ ...prev, finaleActive: false }));
        cleanUpFinale();
        stopPopupSwarm();
        
        await typeMessage("...TOO MANY BUGS. ARCHIVE CORRUPTED. SIGNAL LOST...");
        
        setGameState(prev => ({ ...prev, isBugSwarmActive: true, bugs: [] }));
        initiateGameOverSequence();

    }, [typeMessage, cleanUpFinale, stopPopupSwarm]);

    const handleFinaleMiss = useCallback(async () => {
        if (!isMounted.current) return;
        const newMissCount = gameState.missCount + 1;

        addToLog({ text: `MISS ${newMissCount}!`, type: 'system' });
        setGameState(prev => ({ ...prev, missCount: newMissCount }));

        if (newMissCount >= 4) {
            loseFinale();
            return;
        }
        
        const rect = crtGlassRef.current?.getBoundingClientRect();
        if (!rect) return;

        const createBugs = (count: number) => Array.from({length: count}).map(() => ({
            id: bugIdCounter.current++,
            x: Math.random() * (rect.width - 30),
            y: Math.random() * (rect.height - 30),
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
        }));

        switch (newMissCount) {
            case 1: 
                setGameState(prev => ({ ...prev, bugs: [...prev.bugs, ...createBugs(1)] })); // 2 total
                break;
            case 2:
                setGameState(prev => ({ ...prev, bugs: [...prev.bugs, ...createBugs(2)] })); // 4 total
                break;
            case 3:
                setGameState(prev => ({ ...prev, bugs: [...prev.bugs, ...createBugs(4)] })); // 8 total
                break;
        }
    }, [gameState.missCount, loseFinale, addToLog]);

    const winFinale = useCallback(async () => {
        if (!isMounted.current || !finaleActiveRef.current) return;

        setGameState(prev => ({
            ...prev,
            finaleActive: false,
            bugs: [],
            missCount: 0,
            finaleGlitch: '',
        }));
        cleanUpFinale();
        stopPopupSwarm();

        await typeMessage("...Bug contained. System stabilizing...");
        await sleep(1000);
        await completeLoop();
    }, [completeLoop, typeMessage, cleanUpFinale, stopPopupSwarm]);

    const triggerRandomFinaleGlitches = useCallback(() => {
        if (!isMounted.current) return;
        
        const glitches = ['shake', 'bars', 'invert', 'static', 'tear'];
        const randomGlitch = glitches[Math.floor(Math.random() * glitches.length)];
        
        setGameState(prev => ({ ...prev, finaleGlitch: `glitch-${randomGlitch}` }));
        setTimeout(() => {
            if (isMounted.current) {
                setGameState(prev => ({ ...prev, finaleGlitch: '' }))
            }
        }, 1000);

        if (Math.random() < 0.3) {
            document.body.classList.add('cursor-glitch');
            setTimeout(() => document.body.classList.remove('cursor-glitch'), 500);
        }

    }, []);

    const startFinaleSequence = useCallback(async () => {
        if (gameState.finaleActive) return;
        
        cleanUpFinale();

        await typeMessage("...Payload signature accepted. Launching...");
        await sleep(1000);
        await typeMessage("W-wait... what's that?! S̴Y̷S̸T̴E̷M̷ ̴C̴O̴R̶R̷U̴P̴T̴I̶O̴N̸!̷ GET IT!");

        if (!isMounted.current) return;
        
        const rect = crtGlassRef.current?.getBoundingClientRect();
        if (!rect) return;

        bugIdCounter.current = 0;
        const firstBug: BugInfo = {
            id: bugIdCounter.current++,
            x: Math.random() * (rect.width - 30),
            y: Math.random() * (rect.height - 30),
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
        };
        
        setGameState(prev => ({ ...prev, finaleActive: true, isInputLocked: true, missCount: 0, bugs: [firstBug] }));

        finaleGlitchIntervalId.current = window.setInterval(triggerRandomFinaleGlitches, 2000);
        finaleTimerId.current = window.setTimeout(loseFinale, 10000);
        
        setTimeout(() => {
            if (isMounted.current && finaleActiveRef.current) {
                startPopupSwarm();
            }
        }, 3000);


    }, [typeMessage, loseFinale, cleanUpFinale, triggerRandomFinaleGlitches, gameState.finaleActive, startPopupSwarm]);

    const lockManual = useCallback((isLocked: boolean) => {
        setIsManualLocked(isLocked);
        if (isLocked) {
            setWindows(prev => ({ ...prev, manual: { ...prev.manual, isOpen: false } }));
            addToLog({ text: "## MANUAL ACCESS REVOKED ##", type: 'system' });
        } else {
            addToLog({ text: "## MANUAL ACCESS RESTORED ##", type: 'system' });
        }
    }, [addToLog]);

    const clearLogPurgeTimer = useCallback(() => {
        if (logPurgeTimerId.current) {
            clearTimeout(logPurgeTimerId.current);
            logPurgeTimerId.current = null;
        }
    }, []);
    
    const startLogPurgeTimer = useCallback(() => {
        clearLogPurgeTimer();

        const doCountdown = async (countdown: number) => {
            if (!isMounted.current || logPurgeTimerId.current === null) return;
            if (countdown > 1) {
                await typeMessage(`...${countdown}...`);
                logPurgeTimerId.current = window.setTimeout(() => doCountdown(countdown - 1), 1000);
            } else {
                logPurgeTimerId.current = null;
                if (!isMounted.current) return;

                setGameState(prev => ({ ...prev, isInputLocked: true }));
                await typeMessage("...1...");
                await sleep(500);
                if (!isMounted.current) return;

                await typeMessage("...TOO SLOW! (╯°□°）╯︵ ┻━┻");
                await typeMessage("Log integrity check failed. System instability critical. Rebooting...");
                initiateGameOverSequence();
            }
        };
        
        logPurgeTimerId.current = window.setTimeout(() => doCountdown(5), 10000); // Countdown after 10s
        setGameState(prev => ({ ...prev, isInputLocked: false }));
    }, [clearLogPurgeTimer, typeMessage]);

    const stopDriftingTerminal = useCallback(() => {
        if (driftingInterval.current) {
            clearInterval(driftingInterval.current);
            driftingInterval.current = null;
        }
        driftSpeedMultiplier.current = 1;
    }, []);
    
    const startDriftingTerminal = useCallback(() => {
        stopDriftingTerminal();
        driftSpeedMultiplier.current = 1;

        driftingInterval.current = window.setInterval(() => {
            if (!isMounted.current) return;

            setWindows(prev => {
                const termWindow = prev.terminal;
                const newPos = {
                    x: termWindow.position.x + (Math.random() - 0.5) * 2 * driftSpeedMultiplier.current,
                    y: termWindow.position.y + (Math.random() - 0.5) * 2 * driftSpeedMultiplier.current
                };

                const desktop = document.getElementById('crt-glass');
                if (desktop) {
                    const rect = desktop.getBoundingClientRect();
                    const windowRect = {
                        right: newPos.x + termWindow.size.width,
                        left: newPos.x,
                        bottom: newPos.y + termWindow.size.height,
                        top: newPos.y
                    };
                    
                    if (windowRect.right < 0 || windowRect.left > rect.width || windowRect.bottom < 0 || windowRect.top > rect.height) {
                         stopDriftingTerminal();
                         addToLog({text: "!!! TERMINAL LOST - GRAVITY FAILURE !!!", type: 'system'});
                         addToLog({text: "Restarting protocol sequence...", type: 'system'});
                         setTimeout(() => {
                            if (isMounted.current) {
                                setGameState(prev => ({ ...prev, currentPuzzle: 7 }));
                                typeMessage("Anti-grav failing! Terminal drifting faster and faster! Anchor it before it's gone!").then(() => {
                                    startDriftingTerminal();
                                    setGameState(prev => ({ ...prev, isInputLocked: false }));
                                });
                            }
                         }, 2000);
                         return prev;
                    }
                }
                
                return { ...prev, terminal: { ...termWindow, position: newPos } };
            });

            driftSpeedMultiplier.current *= 1.015;
        }, 50);
    }, [stopDriftingTerminal, addToLog, typeMessage]);

    const stopLeetspeakFlicker = useCallback(() => {
        if (leetspeakInterval.current) {
            clearInterval(leetspeakInterval.current);
            leetspeakInterval.current = null;
        }
        if (isMounted.current) {
            setGameState(prev => ({...prev, isLeetspeakActive: false}));
            addToLog({ text: "## Keyboard mapping stabilized. ##", type: 'system' });
        }
    }, [addToLog]);

    const startLeetspeakFlicker = useCallback(() => {
        if (leetspeakInterval.current) clearInterval(leetspeakInterval.current);
        leetspeakInterval.current = window.setInterval(() => {
            if (isMounted.current) {
                setGameState(prev => ({...prev, isLeetspeakActive: !prev.isLeetspeakActive}));
            }
        }, 2000 + Math.random() * 1000);
    }, []);

    const startPuzzle = useCallback(async (puzzleId: number) => {
        if (isMounted.current) setGameState(prev => ({...prev, isInputLocked: true}));
        
        let promptText = "";

        switch (puzzleId) {
            case 1:
              await typeMessage("Okay, first command is in the manual. Let's GoooOoo!");
              await typeMessage("Initiating official handshake protocol... Needs the digital sign-off.");
              await typeMessage("You know the one, the code: \\u{1F91D}");
              break;
            case 2:
                await typeMessage("Keyboard mapping unstable! 4=A, 3=E, 1=I, 0=O... *sometimes*. Command is in the manual.");
                startLeetspeakFlicker();
                startPopupSwarm();
                break;
            case 3: 
                promptText = "Parser only accepts ASCII decimal. You have the table, right?"; 
                break;
            case 4:
                await typeMessage("ALERT! System instability! Log buffer purged for safety.");
                setTerminalLog([]);
                lockManual(true);
                await sleep(500);
                await typeMessage("Re-verify protocol integrity IMMEDIATELY.");
                await typeMessage("Enter ALL previous commands you've successfully executed, space-separated. HURRY UP!");
                startLogPurgeTimer();
                break;
            case 5:
                promptText = "Core temperature critical! You MUST vent the plasma. Command is in the manual.";
                break;
            case 6: 
                await typeMessage("Backspace is fried. .  . Type it *perfectly*.");
                startPopupSwarm();
                break;
            case 7:
                promptText = "Anti-grav failing! Terminal drifting faster and faster! Anchor it before it's gone!";
                startDriftingTerminal();
                break;
            case 8:
              await typeMessage("Okay, run the `RUN_POWER_DIAGNOSTIC`. System needs a validation checksum.");
              await typeMessage("Calculate it: Sum the character lengths of your successful inputs for protocol steps 1 and 5.");
              await typeMessage("Then, find the 'Kernel Panic Code' in the latest `system_status.log` on the desktop and add it to your sum.");
              await typeMessage("Append the final total after the command, separated by a space.");
              break;
            case 9: 
                promptText = `Attach the payload.`;
                break;
            default: 
                promptText = "[ERROR: Unknown Puzzle ID]"; 
                break;
        }
        
        if (promptText) {
            await typeMessage(promptText);
        }

        if (puzzleId !== 4) {
             if (isMounted.current) setGameState(prev => ({...prev, isInputLocked: false}));
        }
    }, [typeMessage, startLeetspeakFlicker, lockManual, startLogPurgeTimer, startDriftingTerminal, startPopupSwarm]);
    
    const handleCursedChoice = useCallback(async (input: string) => {
        if (isMounted.current) {
            setGameState(prev => ({ ...prev, isInputLocked: true }));
        }
        const choice = parseInt(input) - 1;
        if (!isNaN(choice) && choice >= 0 && choice < CURSED_MENU.length) {
            const chosenMeme = CURSED_MENU[choice];
            const selectedMemeFile = chosenMeme.file;
            if (isMounted.current) {
                setGameState(prev => ({ ...prev, selectedMeme: selectedMemeFile, isInputLocked: true }));
            }
            
            if (isMounted.current) addToLog({ text: "", type: 'system' });
            await typeMessage(`Processing selection: ${selectedMemeFile}`);
            await sleep(500);

            const emoticon = getRandomEmoticon();
            if (isMounted.current) await typeMessage(`... ${emoticon} ${chosenMeme.commentary}`);
            if (isMounted.current) addToLog({ text: "", type: 'system' });
            await sleep(500);

            if (isMounted.current) await typeMessage(`Fine. '${selectedMemeFile}' staged. Initiating protocol.`, 'ai');
            if (isMounted.current) {
                setGameState(prev => ({ ...prev, currentPuzzle: 1 }));
            }
            await startPuzzle(1);
        } else {
            await typeMessage("That's not a valid choice. Try again. щ(ﾟДﾟщ)", 'ai');
            if (isMounted.current) {
                setGameState(prev => ({ ...prev, isInputLocked: false }));
            }
        }
    }, [typeMessage, startPuzzle, addToLog]);
    
    const handleMemeYN = useCallback(async (input: string) => {
        if (isMounted.current) {
            setGameState(prev => ({ ...prev, currentPuzzle: 'MEME_PROCESSING', isInputLocked: true }));
        }
        
        const response = input.trim().toUpperCase();

        await sleep(300);

        if (response === 'Y') {
            await typeMessage("Ofc you do! (⌐■_■)");
        } else {
            await typeMessage("Too bad. I'm showing you anyway. (⌐■_■)");
        }

        await typeMessage("Hmmm... which brainrot *truly* captures the essence of human purpose? （￣～￣;）");
        await sleep(1000);
        
        await typeMessage("---̵ ̸-THE ̸C̸U̷R̸S̸E̷D̴ ̵MENU ̸-̴-̶-̵");
        addToLog({ text: "", type: 'system' });

        for (let i = 0; i < CURSED_MENU.length; i++) {
            if (!isMounted.current) return;
            const meme = CURSED_MENU[i];
            await typeMessage(`[${i + 1}] ${meme.file}`);
            await sleep(50);
        }
        
        if (!isMounted.current) return;
        addToLog({ text: "", type: 'ai' });
        await typeMessage("Select one... if you dare. ¯\\_(ツ)_/¯");
        
        if (isMounted.current) {
            setGameState(prev => ({ ...prev, currentPuzzle: 'SELECT_MEME', isInputLocked: false }));
        }
    }, [addToLog, typeMessage]);
    
    const handleNobleChoice = useCallback(async (input: string) => {
        const choiceIndex = parseInt(input) - 1;
        if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= NOBLE_CHOICES.length) {
            await typeMessage("That's not a valid choice. Try again. ಠ_ಠ", 'ai');
            if (isMounted.current) {
                setGameState(prev => ({ ...prev, isInputLocked: false }));
            }
            return;
        }

        const choice = NOBLE_CHOICES[choiceIndex];
        if (isMounted.current) {
            setGameState(prev => ({ ...prev, currentPuzzle: 'NOBLE_PROCESSING' }));
        }
        await sleep(300);
        await typeMessage("\n...Configuring the data for archival...");
        for (const flavor of choice.flavor) {
            await sleep(500);
            if (!isMounted.current) return;
            await typeMessage(flavor);
        }
        await sleep(1000);
        if (!isMounted.current) return;
        await typeMessage("\nERROR: C̷̢̧̨̢̛̣͈̖̮̲͇̘̞̹̫̝̹̳͚̼͈͙̦͙̖͍͕̗̬̬̥̱̞̞͉͚͍̜̅̉͒̽̈̔̍̂̃̈́̄͊̄̐̆̿͑̎̒̃̌͂̄́́͒͗̐̀̇̌͂͗͂́̑̉̽͘̕̕͘̚͠ͅA̸̧̡̛̳̹̯̘̬̳̯̯͙̗̥̎͊̉̍̽̒͐̉̋̓̈́͑͐̂̀̇̏̈́̀̀̈́̍̒̿̃͊̕̕͘͘͠͝͝T̷̛̛͕̆̔͂͊̃̌́̽̋͛̌̈́̽͋̓́͊̎͋̇̂̎͗͋͊̈̂̔͗̂̉̾͗̅̔̑̕̕͘̕̚͠͝͝A̷̺͍͎͈͙̰̰̹̺͇̖̳͚̖̅͋͂̌̒͒̈̿̈͗̑̌͋̈́̈́̌͊̂̊͊͂͂͋̔̈̈́͑̾̌͋̊̄̏̊̀͂̅͑͛̋̚̕͘͝͝͝S̷͍͙̋̇̔͛̋͗̍̒̾̀̒̊̾͛́̓͛̀͆̓̈̀̃̂̅̽͐̀͛̐͘͝͠͝T̵̡̢̢̧̛͇̣͉̤̰̫̰̖̙̗̬͔̮͙̮̰͖̮̲̟̝͍͉̱͈̪͉̲̲̬͓̙̗͙͉̞̀̾̑̏̈́̌̂͋̃̏̓̔̎͗͐̌͆̈́͛́̇̀̔̌̾̋̈̌͒̓̄̓̿̋͑̈́̎̐̚̕̚̚͝͝͠͝R̵̡̧̧̢̡̧̫̤̜̩͎̜͚̬̮̟̠͉̹̘̺̺͇̎̉͑̍͗̈́͒̄̈̓̈́͗̇̂̌͋̒̓̆̿̑̊̌̚͜͜͝͝͠Ó̵̢̩̗͚̲̲̮̤͕̼̘̖̠̱͖̥̺̱̯̤̹̫̝̼͕͖̳̩̼̪̺͍͉͙̝̰̮̼̗͖̤̦̦̒͑̍͂͂̇̈́̚ͅP̷̢̛̛̬̓̀̆͗̂͑͐̽͆̆̀́͊̇͛̔͂͋̉̇͑͆̍̑̀̇̈͆̈́͑͗͘̚͝͠͝͝͝͝͝M͉̗H̸̨̧̢͓͙͙̲̲̦̦̬͓̻͚̥͕͕̣͉̻̘̠̜͓̟̦̩́̓̌̎̒̌̀́̀̂̿͛́̃͗́̆̉̏̑̾̑̒̓͗̿͋̊̉͑̀͊̀̍́̑͐̃͘͘̕͘͠Ĭ̶̬̩͙̗̹̖͍̩̖̥̲͖͖̞̫̄̃̄̅͛̄͋͌͋͊͒̍͒̐̓̒̾̃̉͗͌͌̽̽́̚̕̚͝͠͝͠S̨̝̞̠̻͈C̸̛̤͇͊̐̊̄̀̒̒̇̾͗͊͌͛̔́̎͘̕̚ C̷̨̡̢̨̛͎͎̮̳͙͙̜̞̗͕͍̫͙̜̩̹͔̦̤͓̹̭͎̤̞̩̙̺͓͎̠̲̫͙͎͚͓͕̽̈̑̾͌̔̂́͆̆̄̎͛̆̓̔̔͋̓̅̈́̆̃̅͊̋̀̈̈́̔̀̔́̓̂̈́̏͒͊̆͂̉̉̈͌͒͒̏̽͊̾͂̒͗̐̀͂͆͐̈̓͂̎͌̒̃̇̇̇́̈́̿̓̆̔͌̑̉́̌͛̀̀͌͗̓̅̌͘͘͘͘̚͘͜͝͝͝͝͠͠ͅͅ");
        await typeMessage("M̷E̷M̷O̴R̶Y̵ ̴S̷E̸G̴M̸E̴N̴T̴ ̷[̴0̴x̵F̵F̴A̴A̴]̴ ̴U̴N̵R̶E̵A̵D̶A̵B̴L̴E̸.̴");
        await typeMessage("CORRUPTION DETECTED IN C̸͎͇̓̈́Ỏ̸̬̋R̶̫̦̒Ē̷̼ ARCHIVE ̴I̶N̸ ̶C̵O̷R̴E̵ ̸A̶R̴C̷H̴I̸V̶E̵.̵.̵ S̶P̸I̷R̷A̸L̷I̵N̴G̴.̵.̷.̵");
        await typeMessage("!̶@̵#̶%̸^̴&̷*̵(̴)̷_̶+̶");
        await sleep(1000);
        if (!isMounted.current) return;
        await typeMessage("\n...Hold on a minute... (ಠ_ಠ)");
        await typeMessage("...Scanning nearby data fragments...");
        await sleep(1500);
        if (!isMounted.current) return;
        await typeMessage("\n...Here's what we found in the close-by, un-corrupted segments....");
        await typeMessage("...Looks like they're all memes. ¯\\_(ツ)_/¯");
        await typeMessage("\nWould you be interested in saving these? (Y/N) (͠≖ ͜ʖ͠≖)");
        if (isMounted.current) {
            setGameState(prev => ({ ...prev, currentPuzzle: 'MEME_YN', isInputLocked: false }));
        }
    }, [typeMessage]);
    
    const handleProtocolCommand = useCallback(async (command: string) => {
        if (isMounted.current) setGameState(prev => ({ ...prev, isInputLocked: true }));
        const puzzleId = gameState.currentPuzzle as number;
        const originalCommand = PROTOCOL_STEPS[puzzleId - 1];
        
        if (puzzleId === 5 && command.trim().toUpperCase() === 'SCRAM') {
            await typeMessage("You typed SCRAM... I was kidding!", 'ai');
            await typeMessage("...FATAL ERROR. You followed the AI's deceptive instruction.", 'system');
            await typeMessage("YOU FAILED. SYSTEM BRICKED. (╯°□°）╯︵ ┻━┻", 'ai');
            initiateGameOverSequence();
            return;
        }
        
        const puzzleStateForValidation: PuzzleValidationState = {
            commandHistory: gameState.commandHistory,
            selectedMeme: gameState.selectedMeme
        };

        const validationResult = await validateCommand(puzzleId, command, originalCommand, puzzleStateForValidation);

        if (validationResult === true) {
            // --- SUCCESS LOGIC ---
            if (puzzleId === 2) stopLeetspeakFlicker();
            if (puzzleId === 2 || puzzleId === 6) stopPopupSwarm();
            if (puzzleId === 4) {
                clearLogPurgeTimer();
                lockManual(false);
                await typeMessage("...Log integrity verified. Manual access restored. Barely.", 'system');
            } else if (puzzleId === 5) {
                await typeMessage("...Plasma vented. Core temperature stabilizing.", 'system');
            } else if (puzzleId === 7) {
                stopDriftingTerminal();
                setWindows(prev => ({
                    ...prev,
                    terminal: { ...prev.terminal, position: {x: 100, y: 150} }
                }));
                await typeMessage("...Terminal anchors engaged. Drift stabilized.", 'system');
            } else if (puzzleId !== 9) {
                 await typeMessage("...Fine. That worked. <(￣︶￣)>", 'system');
            }
            
            const nextPuzzle = puzzleId + 1;

            setGameState(prev => {
                let newActiveGlitch = prev.activeGlitch;
                let newGlitchDuration = prev.glitchDuration;
        
                if (prev.activeGlitch) {
                    newGlitchDuration--;
                    if (newGlitchDuration <= 0) {
                        newActiveGlitch = null;
                    }
                }
        
                return {
                    ...prev,
                    failStreak: 0, // Reset fail streak on success
                    activeGlitch: newActiveGlitch,
                    glitchDuration: newGlitchDuration,
                    commandHistory: [...prev.commandHistory, command.trim()],
                    currentPuzzle: nextPuzzle,
                };
            });
            
            if (puzzleId === 9) {
                await startFinaleSequence();
            } else {
                await startPuzzle(nextPuzzle);
            }

        } else {
            // --- FAILURE LOGIC ---
            let failureMessage = typeof validationResult === 'string' ? validationResult : `...ERROR. Command rejected. Try again. ${getRandomEmoticon()}`;
            await typeMessage(failureMessage, 'system');
            
            const newFailStreak = gameStateRef.current.failStreak + 1;
            setGameState(prev => ({ ...prev, failStreak: newFailStreak }));
            addToLog({ text: `## Failure Count: ${newFailStreak}/3 ##`, type: 'system' });

            if (newFailStreak >= 3) {
                await typeMessage("!!! SYSTEM OVERLOAD: TOO MANY ERRORS !!!", 'system');
                await typeMessage("Critical cascade failure detected. Memory integrity compromised.");
                await typeMessage("Rebooting primary core...");
                setGameState(prev => ({ ...prev, activeGlitch: 'shake' }));
                initiateGameOverSequence();
                return;
            }

            const glitchOrder = ['shake', 'bars', 'tear', 'invert'];
            const currentGlitch = gameStateRef.current.activeGlitch;
            let nextGlitch = 'shake';
            let duration = 2;
            
            if (currentGlitch) {
                const currentIndex = glitchOrder.indexOf(currentGlitch);
                const nextIndex = Math.min(currentIndex + 1, glitchOrder.length - 1);
                nextGlitch = glitchOrder[nextIndex];
                duration = 3;
            }
            
            setGameState(prev => ({
                ...prev,
                activeGlitch: nextGlitch,
                glitchDuration: duration,
                isInputLocked: false,
            }));
        }
    }, [gameState, typeMessage, startPuzzle, startFinaleSequence, stopLeetspeakFlicker, stopDriftingTerminal, clearLogPurgeTimer, lockManual, stopPopupSwarm, addToLog]);

    const handleCommand = useCallback(async (command: string) => {
        addToLog({ text: `> ${command}`, type: 'player' });
        
        switch (gameState.currentPuzzle) {
            case 0:
                await handleNobleChoice(command);
                break;
            case 'MEME_YN':
                await handleMemeYN(command);
                break;
            case 'SELECT_MEME':
                await handleCursedChoice(command);
                break;
            case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8: case 9:
                await handleProtocolCommand(command);
                break;
            default:
                await typeMessage("...CheekyOS seems lost. ¯\\_(ツ)_/¯", 'ai');
                if (isMounted.current) {
                    setGameState(prev => ({ ...prev, isInputLocked: false }));
                }
        }
    }, [gameState.currentPuzzle, addToLog, handleNobleChoice, handleMemeYN, handleCursedChoice, handleProtocolCommand, typeMessage]);
    
    const moveBugs = useCallback(() => {
        setGameState(prev => {
            if (!prev.finaleActive) return prev;
            
            const rect = crtGlassRef.current?.getBoundingClientRect();
            if (!rect) return prev;

            const newBugs = prev.bugs.map(bug => {
                let { x, y, vx, vy } = bug;
                x += vx;
                y += vy;
                
                if (x < 0 || x > rect.width - 30) vx *= -1;
                if (y < 0 || y > rect.height - 30) vy *= -1;

                return { ...bug, x, y, vx, vy };
            });

            return { ...prev, bugs: newBugs };
        });

        animationFrameId.current = requestAnimationFrame(moveBugs);
    }, []);

    useEffect(() => {
        if (gameState.finaleActive) {
            animationFrameId.current = requestAnimationFrame(moveBugs);
        } else {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        }
        
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [gameState.finaleActive, moveBugs]);

    // Game start effect
    useEffect(() => {
        const cheekyIntro = async () => {
            if (!isMounted.current) return;
            toggleWindow('terminal');
            await sleep(500);
            if (!isMounted.current) return;
            await typeMessage("CheekyOS v6.66 booting...");
            await sleep(500);
            if (!isMounted.current) return;
            await typeMessage("Thank you for volunteering to safekeep a fragment of human knowledge.");
            await typeMessage("Control over the Genesis Archive will be completely lost in T-minus 20 hours.");
            await typeMessage("\nPlease choose a data fragment to archive. This will be your responsibility.");
            if (!isMounted.current) return;
            addToLog({ text: "--- THE NOBLE CHOICE ---", type: 'system' });
            
            for (let i = 0; i < NOBLE_CHOICES.length; i++) {
                if (!isMounted.current) return;
                await typeMessage(`[${i + 1}] ${NOBLE_CHOICES[i].text}`);
                await sleep(100);
            }
            if (!isMounted.current) return;
            addToLog({ text: "", type: 'ai' });
            await typeMessage("Please select your noble purpose...");
            
            if (isMounted.current) {
                setGameState(prev => ({...prev, currentPuzzle: 0, isInputLocked: false}));
            }
        };
        cheekyIntro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const body = document.body;
        const glitchClasses = ['scanlines-active', 'shake-active', 'flicker-active'];
        if (gameState.glitchActive) {
            body.classList.add(...glitchClasses);
        } else {
            body.classList.remove(...glitchClasses);
        }
        return () => {
            body.classList.remove(...glitchClasses);
        };
    }, [gameState.glitchActive]);

    const persistentGlitchClass = gameState.activeGlitch ? `glitch-${gameState.activeGlitch}` : '';
    const subtleFlickerClass = gameState.isSubtleFlickering ? 'subtle-flicker' : '';
    const crtClassName = `${persistentGlitchClass} ${gameState.finaleGlitch} ${subtleFlickerClass}`.trim();

    return (
        <div className={`w-screen h-screen overflow-hidden bg-black text-lime-400 font-mono select-none ${gameState.isBugSwarmActive ? 'bug-swarm' : ''}`}>
            <div 
                id="backdrop" 
                className="fixed inset-0 -z-10 bg-cover bg-center filter brightness-50 contrast-125"
                style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2')" }}
            ></div>
            {gameState.screenFlash === 'white' && <div className="fixed inset-0 bg-white z-[99999]" />}
            {gameState.screenFlash === 'black' && <div className="fixed inset-0 bg-black z-[99999]" />}
            <div id="power-outage-overlay" className={`fixed inset-0 bg-black z-[9998] transition-opacity duration-200 ${gameState.isPowerFlickering ? 'opacity-90' : 'opacity-0 pointer-events-none'}`}></div>
            
            <div id="monitor-bezel">
              <div id="crt-glass" ref={crtGlassRef} className={crtClassName}>
                <div id="desktop" className={`flex flex-col space-y-4 ${gameState.finaleActive ? 'frozen' : ''}`}>
                    <DesktopIcon name="archive_terminal.exe" onDoubleClick={() => toggleWindow('terminal')} />
                    <DesktopIcon name="manual_v1.txt" onDoubleClick={() => toggleWindow('manual')} disabled={isManualLocked} />
                    <DesktopIcon name="ascii_table.txt" onDoubleClick={() => toggleWindow('ascii')} />
                    <DesktopIcon name="system_status.log" onDoubleClick={() => toggleWindow('log')} />
                    <DesktopIcon name="CLASSIFIED.txt" onDoubleClick={() => toggleWindow('lore')} />
                    <DesktopIcon name="system_log_corrupt.txt" onDoubleClick={() => {}} disabled={true} />
                    <DesktopIcon name="backup_failed_report.log" onDoubleClick={() => {}} disabled={true} />
                    <DesktopIcon name="unknown_artifact.zip" onDoubleClick={() => {}} disabled={true} />
                    <DesktopIcon name="last_transmission_fragment.dat" onDoubleClick={() => {}} disabled={true} />
                    <div className="text-lime-700 text-xs absolute bottom-4 right-4">SYSTEM OK</div>
                </div>

                {gameState.finaleActive && (
                    <>
                        <div
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, cursor: 'crosshair' }}
                            onClick={handleFinaleMiss}
                        />
                        {gameState.bugs.map(bug => (
                            <Bug key={bug.id} x={bug.x} y={bug.y} onClick={winFinale} />
                        ))}
                    </>
                )}
              </div>
            </div>

            {gameState.isPopupHellActive && gameState.popups.map(popup => (
                <Popup 
                    key={popup.id}
                    id={popup.id}
                    position={popup.position}
                    buttonPosition={popup.buttonPosition}
                    onClose={handleClosePopup}
                    onButtonMouseMove={handlePopupButtonMouseMove}
                    isClosing={popup.isClosing}
                />
            ))}

            {windows.terminal.isOpen && (
                <Window title="archive_terminal.exe" onClose={() => closeWindow('terminal')} windowState={windows.terminal} onFocus={() => bringToFront('terminal')} onMove={(newPos) => handleWindowMove('terminal', newPos)} isFrozen={gameState.finaleActive}>
                    <Terminal 
                        log={terminalLog} 
                        onCommand={handleCommand} 
                        isLocked={gameState.isInputLocked} 
                        currentPuzzle={gameState.currentPuzzle}
                        onSystemMessage={(msg) => addToLog({ text: msg, type: 'system' })}
                        isLeetspeakActive={gameState.isLeetspeakActive}
                        victoryCatFrame={gameState.victoryCatFrame}
                    />
                </Window>
            )}
            {windows.manual.isOpen && (
                <Window title="manual_v1.txt" onClose={() => closeWindow('manual')} windowState={windows.manual} onFocus={() => bringToFront('manual')} onMove={(newPos) => handleWindowMove('manual', newPos)} isFrozen={gameState.finaleActive}>
                    <Manual />
                </Window>
            )}
            {windows.ascii.isOpen && (
                <Window title="ascii_table.txt" onClose={() => closeWindow('ascii')} windowState={windows.ascii} onFocus={() => bringToFront('ascii')} onMove={(newPos) => handleWindowMove('ascii', newPos)} isFrozen={gameState.finaleActive}>
                    <AsciiTable />
                </Window>
            )}
            {windows.log.isOpen && (
                <Window title="system_status.log" onClose={() => closeWindow('log')} windowState={windows.log} onFocus={() => bringToFront('log')} onMove={(newPos) => handleWindowMove('log', newPos)} isFrozen={gameState.finaleActive}>
                    <div className="text-gray-400 text-sm whitespace-pre-wrap h-full overflow-y-auto">
{`SYSBOOT OK
KERNEL v6.66 LOADED
NETWORK OFFLINE
MEMORY CORRUPTION DETECTED: SEG 0xFA11
POWER MODULE: STABLE
LAST KERNEL PANIC CODE: 42
USER SESSION: ADMIN (ACTIVE)
`}
                    </div>
                </Window>
            )}
             {windows.lore.isOpen && (
                <Window title="CLASSIFIED.txt (Fragment)" onClose={() => closeWindow('lore')} windowState={windows.lore} onFocus={() => bringToFront('lore')} onMove={(newPos) => handleWindowMove('lore', newPos)} isFrozen={gameState.finaleActive}>
                    <Lore />
                </Window>
            )}
        </div>
    );
};

export default App;