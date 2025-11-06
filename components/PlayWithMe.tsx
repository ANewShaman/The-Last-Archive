import React, { useState, useEffect, useCallback } from 'react';

type Player = 'X' | 'O';
type BoardState = (Player | null)[];

interface PlayWithMeProps {
  onComplete: () => void;
  onLose: () => void;
}

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

const calculateWinner = (board: BoardState): Player | null => {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const PlayWithMe: React.FC<PlayWithMeProps> = ({ onComplete, onLose }) => {
    const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
    const [scores, setScores] = useState({ player: 0, ai: 0 });
    const [round, setRound] = useState(1);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [dialogue, setDialogue] = useState("Ugh, we've been working all day—play with me!");
    const [isCheating, setIsCheating] = useState(false);
    const [gameStatus, setGameStatus] = useState<'playing' | 'paused' | 'over'>('playing');

    const startNextRound = useCallback(() => {
        if (scores.player >= 3) {
            setGameStatus('over');
            setDialogue("You won... this time. Now get back to work.");
            setTimeout(onComplete, 1500);
            return;
        }
        if (scores.ai >= 3) {
            setGameStatus('over');
            setDialogue("Wow... that’s just sad. Let’s pretend this didn’t happen.");
            setTimeout(onLose, 1500);
            return;
        }
        
        setRound(prev => prev + 1);
        setBoard(Array(9).fill(null));
        setIsPlayerTurn(true);
        setGameStatus('playing');
        setDialogue(`Round ${round + 1} — you really think luck repeats?`);
    }, [scores, round, onComplete, onLose]);

    const handleRoundEnd = useCallback((winner: Player | 'draw') => {
        setGameStatus('paused');
        if (winner === 'X') {
            setDialogue("Wait WHAT—system error!!! ಠ_ಠ");
            setScores(s => ({ ...s, player: s.player + 1 }));
        } else if (winner === 'O') {
            setDialogue("Predictable. My turn to win.");
            setScores(s => ({ ...s, ai: s.ai + 1 }));
        } else {
            setDialogue("Fine. Boring result.");
        }
        
        setTimeout(startNextRound, 2000);

    }, [startNextRound]);

    const handlePlayerMove = (index: number) => {
        if (gameStatus !== 'playing' || !isPlayerTurn || board[index]) return;
        
        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setIsPlayerTurn(false);
    };

    const getAIMove = useCallback((currentBoard: BoardState): number | number[] => {
        const emptyIndices = currentBoard.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];

        // 1. AI win: Check if AI can make a winning move.
        for (const index of emptyIndices) {
            const tempBoard = [...currentBoard];
            tempBoard[index] = 'O';
            if (calculateWinner(tempBoard) === 'O') return index;
        }

        // 2. Block player win: Check if player is about to win and block them.
        for (const index of emptyIndices) {
            const tempBoard = [...currentBoard];
            tempBoard[index] = 'X';
            if (calculateWinner(tempBoard) === 'X') return index;
        }
        
        // 3. Cheat? (10% chance)
        if (Math.random() < 0.1 && emptyIndices.length >= 2) {
             setIsCheating(true);
             setTimeout(() => setIsCheating(false), 300);
             setDialogue("Hehe, optimization is not cheating 😏");
             const tempIndices = [...emptyIndices];
             const move1 = tempIndices.splice(Math.floor(Math.random() * tempIndices.length), 1)[0];
             const move2 = tempIndices.splice(Math.floor(Math.random() * tempIndices.length), 1)[0];
             return [move1, move2];
        }

        // 4. Strategic move: Prioritize center, then corners, then sides.
        if (emptyIndices.includes(4)) {
            return 4; // Take the center
        }

        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => emptyIndices.includes(i));
        if (availableCorners.length > 0) {
            // Take a random available corner
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        const sides = [1, 3, 5, 7];
        const availableSides = sides.filter(i => emptyIndices.includes(i));
        if (availableSides.length > 0) {
            // Take a random available side
            return availableSides[Math.floor(Math.random() * availableSides.length)];
        }

        // Fallback (should not be reached in a normal game)
        return emptyIndices[0];

    }, [setIsCheating, setDialogue]);

    useEffect(() => {
        const winner = calculateWinner(board);
        const isDraw = !board.includes(null);
        
        if (gameStatus !== 'playing') return;

        if (winner) {
            handleRoundEnd(winner);
            return;
        }
        if (isDraw) {
            handleRoundEnd('draw');
            return;
        }

        if (!isPlayerTurn) {
            const timeoutId = setTimeout(() => {
                const move = getAIMove(board);
                const newBoard = [...board];
                if(Array.isArray(move)) {
                    newBoard[move[0]] = 'O';
                    newBoard[move[1]] = 'O';
                } else {
                     newBoard[move] = 'O';
                }
                setBoard(newBoard);
                setIsPlayerTurn(true);
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [board, isPlayerTurn, gameStatus, getAIMove, handleRoundEnd]);

    return (
        <div className={`play-with-me-container ${isCheating ? 'xo-cheating-glitch' : ''}`}>
            <div className="xo-dialogue">{dialogue}</div>
            <div className="xo-scores">
                <span>Runner: {scores.player}</span>
                <span>CheekyOS: {scores.ai}</span>
            </div>
            <div className="xo-grid">
                {board.map((cell, index) => (
                    <button
                        key={index}
                        className={`xo-cell ${cell ? (cell === 'X' ? 'x' : 'o') : ''}`}
                        onClick={() => handlePlayerMove(index)}
                        disabled={gameStatus !== 'playing' || !isPlayerTurn || !!cell}
                    >
                        {cell}
                    </button>
                ))}
            </div>
            <div className="xo-round-notice">
                {gameStatus !== 'over' && `Round ${round}`}
            </div>
        </div>
    );
};

export default PlayWithMe;
