import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Play, Check, X as XIcon, RotateCw, Trophy } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const ReactionGame: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, updateUserMinigameLevel } = useUser();

    type GameState = 'idle' | 'countdown' | 'playing' | 'level_complete' | 'game_over';

    const [gameState, setGameState] = useState<GameState>('idle');
    const level = currentUser?.minigames_progress?.reaction_game?.level || 1;
    
    const [config, setConfig] = useState({ targets: 0, speed: 2000, gridSize: 4 });
    const [score, setScore] = useState(0);
    const [activeCell, setActiveCell] = useState<number | null>(null);
    const [countdown, setCountdown] = useState(3);

    const timerRef = useRef<number | null>(null);
    const countdownRef = useRef<number | null>(null);

    useEffect(() => {
        const targets = 10 + (level - 1);
        const speed = Math.max(400, 1500 - (level - 1) * 50);
        const gridSize = level > 5 ? 5 : 4;
        setConfig({ targets, speed, gridSize });
        setScore(0);
    }, [level, gameState]);

    const cleanupTimers = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        timerRef.current = null;
        countdownRef.current = null;
    }, []);

    useEffect(() => {
        return () => cleanupTimers();
    }, [cleanupTimers]);

    const handleGameOver = useCallback(() => {
        cleanupTimers();
        setGameState('game_over');
        setActiveCell(null);
    }, [cleanupTimers]);

    const nextTarget = useCallback(() => {
        cleanupTimers();
        const gridSize = config.gridSize * config.gridSize;
        let newActiveCell;
        do {
            newActiveCell = Math.floor(Math.random() * gridSize);
        } while (newActiveCell === activeCell);

        setActiveCell(newActiveCell);

        timerRef.current = window.setTimeout(() => {
            handleGameOver();
        }, config.speed);
    }, [activeCell, config.gridSize, config.speed, cleanupTimers, handleGameOver]);

    const handleCellClick = (index: number) => {
        if (index === activeCell) {
            const newScore = score + 1;
            setScore(newScore);

            if (newScore >= config.targets) {
                cleanupTimers();
                setGameState('level_complete');
                updateUserMinigameLevel('reaction_game', level + 1);
                setActiveCell(null);
            } else {
                nextTarget();
            }
        }
    };

    const startGame = () => {
        setCountdown(3);
        setGameState('countdown');
        countdownRef.current = window.setInterval(() => {
            setCountdown(prev => {
                if (prev > 1) {
                    return prev - 1;
                } else {
                    clearInterval(countdownRef.current!);
                    setGameState('playing');
                    nextTarget();
                    return 0;
                }
            });
        }, 1000);
    };

    const nextLevel = () => {
        setGameState('idle');
    };

    const gridCells = Array.from({ length: config.gridSize * config.gridSize });

    const GameOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4 z-10">
            {children}
        </div>
    );

    return (
        <div className="bg-graphite text-white h-full flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-graphite z-10 border-b border-graphite-lighter flex-shrink-0">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2"><ArrowLeft /></button>
                    <h1 className="text-xl font-bold">Reflejos de Asclepio</h1>
                </div>
                <div className="font-bold">Nivel: {level}</div>
            </header>
            
            <main className="flex-1 flex flex-col p-4 relative">
                {gameState === 'idle' && (
                    <GameOverlay>
                        <Zap size={64} className="text-yellow-400"/>
                        <h2 className="text-4xl font-black mt-4">Nivel {level}</h2>
                        <p className="text-gray-400 mt-2">Toca {config.targets} objetivos lo más rápido que puedas.</p>
                        <button onClick={startGame} className="mt-8 bg-accent-lime text-graphite font-bold py-3 px-8 rounded-lg flex items-center justify-center text-lg">
                            <Play size={20} className="mr-2"/> Empezar
                        </button>
                    </GameOverlay>
                )}

                {gameState === 'countdown' && <GameOverlay><p className="text-8xl font-black animate-ping">{countdown}</p></GameOverlay>}
                
                {gameState === 'level_complete' && (
                    <GameOverlay>
                        <Trophy size={64} className="text-accent-lime"/>
                        <h2 className="text-4xl font-black mt-4 text-white">¡Nivel {level} Superado!</h2>
                        <p className="text-gray-300 mt-2">¡Prepárate para el siguiente desafío!</p>
                        <button onClick={nextLevel} className="mt-8 bg-accent-lime text-graphite font-bold py-3 px-8 rounded-lg flex items-center justify-center text-lg">
                            Continuar al Nivel {level + 1}
                        </button>
                    </GameOverlay>
                )}

                {gameState === 'game_over' && (
                    <GameOverlay>
                        <XIcon size={64} className="text-red-500"/>
                        <h2 className="text-4xl font-black mt-4 text-white">Fin del Juego</h2>
                        <p className="text-gray-300 mt-2">¡Casi lo logras! No te rindas.</p>
                        <button onClick={startGame} className="mt-8 bg-yellow-500 text-graphite font-bold py-3 px-8 rounded-lg flex items-center justify-center text-lg">
                            <RotateCw size={20} className="mr-2"/> Reintentar Nivel {level}
                        </button>
                    </GameOverlay>
                )}
                
                {gameState === 'playing' && (
                    <>
                        <div className="mb-4">
                            <div className="w-full bg-graphite-light rounded-full h-4">
                                <div className="bg-accent-lime h-4 rounded-full transition-all duration-200" style={{ width: `${(score / config.targets) * 100}%` }}></div>
                            </div>
                            <p className="text-center text-sm mt-2 text-gray-400">{score} / {config.targets}</p>
                        </div>
                        <div 
                            className={`flex-1 grid gap-2 ${config.gridSize === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}
                            style={{ gridTemplateRows: `repeat(${config.gridSize}, minmax(0, 1fr))`}}
                        >
                            {gridCells.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleCellClick(i)}
                                    className={`rounded-lg transition-colors duration-100 ${i === activeCell ? 'bg-accent-lime' : 'bg-graphite-light hover:bg-graphite-lighter'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default ReactionGame;
