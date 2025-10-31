import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Imported X as XIcon to resolve reference error.
import { ArrowLeft, Swords, Shield, Zap, RotateCw, Trophy, Play, X as XIcon } from 'lucide-react';
import { useUser } from '../../context/UserContext';

type Action = 'attack' | 'block' | 'special';
type GameState = 'idle' | 'player_turn' | 'resolution' | 'victory' | 'defeat';

const Fighter: React.FC<{ isPlayer?: boolean, health: number, maxHealth: number, animation: string }> = ({ isPlayer, health, maxHealth, animation }) => (
    <div className={`flex flex-col items-center ${animation}`}>
        <p className="font-bold text-white text-lg">{isPlayer ? 'Tú' : 'Sombra'}</p>
        <div className="w-32 h-32 bg-black rounded-full my-2 border-4 border-graphite-light" />
        <div className="w-full max-w-xs bg-graphite-lighter rounded-full h-4 border-2 border-graphite-light">
            <div 
                className={`h-full rounded-full transition-all duration-300 ${health > maxHealth * 0.5 ? 'bg-green-500' : health > maxHealth * 0.25 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                style={{ width: `${(health / maxHealth) * 100}%`}} 
            />
        </div>
        <p className="text-sm font-mono mt-1">{health} / {maxHealth}</p>
    </div>
);

const ShadowDuel: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, updateUserMinigameLevel } = useUser();

    const level = currentUser?.minigames_progress?.shadow_duel?.level || 1;
    
    const [gameState, setGameState] = useState<GameState>('idle');
    const [maxHealth, setMaxHealth] = useState({ player: 100, ai: 100 });
    const [health, setHealth] = useState({ player: 100, ai: 100 });
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [animations, setAnimations] = useState({ player: '', ai: '' });
    
    useEffect(() => {
        const aiMaxHealth = 100 + (level - 1) * 20;
        setMaxHealth({ player: 100, ai: aiMaxHealth });
        setHealth({ player: 100, ai: aiMaxHealth });
        setCombatLog([]);
    }, [level, gameState]);

    const triggerAnimation = (target: 'player' | 'ai', type: 'shake' | 'attack' | 'defend') => {
        const animClass = type === 'shake' ? 'animate-shake' : type === 'attack' ? 'animate-attack' : 'animate-defend';
        setAnimations(prev => ({ ...prev, [target]: animClass }));
        setTimeout(() => setAnimations(prev => ({ ...prev, [target]: '' })), 500);
    };

    const handlePlayerAction = (playerAction: Action) => {
        if (gameState !== 'player_turn') return;

        const aiActions: Action[] = ['attack', 'block', 'special'];
        const aiAction = aiActions[Math.floor(Math.random() * aiActions.length)];
        let newPlayerHealth = health.player;
        let newAiHealth = health.ai;
        let log = '';
        
        const playerDamage = 15 + Math.floor(Math.random() * 5); // 15-19
        const playerSpecialDamage = 30 + Math.floor(Math.random() * 10); // 30-39
        const aiDamage = (10 + Math.floor(Math.random() * 5)) + (level - 1) * 2;
        
        // Rock-Paper-Scissors Logic
        if (playerAction === 'attack') {
            if (aiAction === 'attack') {
                log = '¡Choque de golpes! Ambos reciben daño.';
                newPlayerHealth -= aiDamage;
                newAiHealth -= playerDamage;
                triggerAnimation('player', 'shake');
                triggerAnimation('ai', 'shake');
            } else if (aiAction === 'block') {
                log = '¡Tu ataque fue bloqueado!';
                triggerAnimation('player', 'attack');
                triggerAnimation('ai', 'defend');
            } else { // aiAction === 'special'
                log = '¡Interrumpes su ataque cargado con un golpe rápido!';
                newAiHealth -= playerDamage;
                triggerAnimation('player', 'attack');
                triggerAnimation('ai', 'shake');
            }
        } else if (playerAction === 'block') {
            if (aiAction === 'attack') {
                log = '¡Bloqueas el ataque de la Sombra!';
                triggerAnimation('ai', 'attack');
                triggerAnimation('player', 'defend');
            } else if (aiAction === 'block') {
                log = 'Ambos se estudian, en guardia.';
            } else { // aiAction === 'special'
                log = '¡Su ataque cargado rompe tu defensa!';
                newPlayerHealth -= aiDamage * 2; // Special hits hard
                triggerAnimation('ai', 'attack');
                triggerAnimation('player', 'shake');
            }
        } else { // playerAction === 'special'
            if (aiAction === 'attack') {
                log = '¡La Sombra te golpea antes de que cargues tu ataque!';
                newPlayerHealth -= aiDamage;
                triggerAnimation('ai', 'attack');
                triggerAnimation('player', 'shake');
            } else if (aiAction === 'block') {
                log = '¡Tu ataque cargado destroza su guardia!';
                newAiHealth -= playerSpecialDamage;
                triggerAnimation('player', 'attack');
                triggerAnimation('ai', 'shake');
            } else { // aiAction === 'special'
                log = '¡Ambos ataques cargados chocan con fuerza!';
                newPlayerHealth -= aiDamage;
                newAiHealth -= playerDamage;
                 triggerAnimation('player', 'shake');
                triggerAnimation('ai', 'shake');
            }
        }

        setGameState('resolution');
        setCombatLog(prev => [log, ...prev].slice(0, 5));
        
        setTimeout(() => {
            setHealth({ player: Math.max(0, newPlayerHealth), ai: Math.max(0, newAiHealth) });

            if (newAiHealth <= 0) {
                setGameState('victory');
                updateUserMinigameLevel('shadow_duel', level + 1);
            } else if (newPlayerHealth <= 0) {
                setGameState('defeat');
            } else {
                setGameState('player_turn');
            }
        }, 800);
    };

    const startGame = () => setGameState('player_turn');
    const nextLevel = () => setGameState('idle');

    const GameOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4 z-10">
            {children}
        </div>
    );
    
    return (
        <div className="bg-graphite text-white h-full flex flex-col relative overflow-hidden">
            <style>{`
                @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
                .animate-shake { animation: shake 0.5s ease-in-out; }
                @keyframes attack { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
                .animate-attack { animation: attack 0.3s ease-out; }
                @keyframes defend { 0% { transform: scale(1); } 50% { transform: scale(0.95); } 100% { transform: scale(1); } }
                .animate-defend { animation: defend 0.3s ease-out; }
            `}</style>

            <header className="p-4 flex items-center justify-between sticky top-0 bg-graphite z-20 border-b border-graphite-lighter flex-shrink-0">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2"><ArrowLeft /></button>
                <h1 className="text-xl font-bold">Duelo de Sombras</h1>
                <div className="font-bold">Nivel: {level}</div>
            </header>

            <main className="flex-1 flex flex-col p-4 justify-between">
                {gameState === 'idle' && (
                    <GameOverlay>
                        <Swords size={64} className="text-red-500"/>
                        <h2 className="text-4xl font-black mt-4">Nivel {level}</h2>
                        <p className="text-gray-400 mt-2">Derrota a la Sombra para avanzar.</p>
                        <button onClick={startGame} className="mt-8 bg-accent-lime text-graphite font-bold py-3 px-8 rounded-lg flex items-center justify-center text-lg">
                            <Play size={20} className="mr-2"/> Luchar
                        </button>
                    </GameOverlay>
                )}
                 {gameState === 'victory' && (
                    <GameOverlay>
                        <Trophy size={64} className="text-accent-lime"/>
                        <h2 className="text-4xl font-black mt-4 text-white">¡VICTORIA!</h2>
                        <p className="text-gray-300 mt-2">Has derrotado a la Sombra del Nivel {level}.</p>
                        <button onClick={nextLevel} className="mt-8 bg-accent-lime text-graphite font-bold py-3 px-8 rounded-lg flex items-center justify-center text-lg">
                            Continuar al Nivel {level + 1}
                        </button>
                    </GameOverlay>
                )}
                {gameState === 'defeat' && (
                    <GameOverlay>
                        <XIcon size={64} className="text-red-500"/>
                        <h2 className="text-4xl font-black mt-4 text-white">DERROTA</h2>
                        <p className="text-gray-300 mt-2">La Sombra fue demasiado fuerte esta vez.</p>
                        <button onClick={startGame} className="mt-8 bg-yellow-500 text-graphite font-bold py-3 px-8 rounded-lg flex items-center justify-center text-lg">
                            <RotateCw size={20} className="mr-2"/> Reintentar
                        </button>
                    </GameOverlay>
                )}
                
                <div className="flex justify-around items-center">
                    <Fighter isPlayer health={health.player} maxHealth={maxHealth.player} animation={animations.player} />
                    <Swords size={40} className="text-gray-500"/>
                    <Fighter health={health.ai} maxHealth={maxHealth.ai} animation={animations.ai} />
                </div>

                <div className="space-y-4">
                     <div className="h-24 bg-graphite-light p-2 rounded-lg text-center flex flex-col justify-center border border-graphite-lighter">
                         {combatLog.map((msg, i) => (
                            <p key={i} className={`text-sm transition-opacity duration-300 ${i === 0 ? 'text-white font-semibold' : 'text-gray-400'}`}>{msg}</p>
                         ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => handlePlayerAction('attack')} disabled={gameState !== 'player_turn'} className="bg-red-600 p-3 rounded-lg font-bold disabled:bg-gray-600 flex flex-col items-center justify-center">
                            <Swords size={20}/>
                            <span className="text-sm">Ataque Rápido</span>
                        </button>
                        <button onClick={() => handlePlayerAction('block')} disabled={gameState !== 'player_turn'} className="bg-blue-600 p-3 rounded-lg font-bold disabled:bg-gray-600 flex flex-col items-center justify-center">
                            <Shield size={20}/>
                            <span className="text-sm">Defensa</span>
                        </button>
                        <button onClick={() => handlePlayerAction('special')} disabled={gameState !== 'player_turn'} className="bg-purple-600 p-3 rounded-lg font-bold disabled:bg-gray-600 flex flex-col items-center justify-center">
                            <Zap size={20}/>
                            <span className="text-sm">Ataque Cargado</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShadowDuel;
