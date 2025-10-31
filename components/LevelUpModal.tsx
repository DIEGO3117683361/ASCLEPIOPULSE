import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Level } from '../utils/levels';
import LevelBadge from './LevelBadge';

type LevelUpType = { oldLevel: Level, newLevel: Level } | null;

interface LevelUpModalProps {
    levelUp: LevelUpType;
    onClose: () => void;
}

const Particle: React.FC = () => {
    const style = {
        '--x': `${(Math.random() - 0.5) * 300}px`,
        '--y': `${(Math.random() - 0.5) * 300}px`,
        top: '50%',
        left: '50%',
        background: `hsl(${Math.random() * 60 + 30}, 100%, 70%)`,
        animationDelay: `${Math.random() * 0.2}s`,
    } as React.CSSProperties;

    return <div className="particle" style={style}></div>;
};

const LevelUpModal: React.FC<LevelUpModalProps> = ({ levelUp, onClose }) => {

    useEffect(() => {
        if (levelUp) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [levelUp, onClose]);

    if (!levelUp) return null;

    const { oldLevel, newLevel } = levelUp;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 level-up-modal-backdrop">
            <div className="bg-graphite-light rounded-2xl w-full max-w-sm border-2 border-graphite-lighter shadow-2xl text-center p-8 relative overflow-hidden level-up-modal-content">
                <div className="particle-container">
                    {Array.from({ length: 30 }).map((_, i) => <Particle key={i} />)}
                </div>

                <h2 className="text-3xl font-black tracking-tight text-white level-up-text">¡Subiste de Nivel!</h2>
                
                <div className="my-8 flex items-center justify-center gap-2">
                    <LevelBadge level={oldLevel} />
                    <ArrowRight size={24} className="text-gray-400 flex-shrink-0" />
                    <LevelBadge level={newLevel} className="level-up-badge" />
                </div>

                <p className="text-gray-300 level-up-text" style={{ animationDelay: '0.7s' }}>
                    Alcanzaste el rango de <span className="font-bold text-white">{newLevel.name}</span>.
                </p>
                <p className="text-gray-400 text-sm mt-1 level-up-text" style={{ animationDelay: '0.9s' }}>
                    ¡Sigue así!
                </p>

                <button
                    onClick={onClose}
                    className="mt-8 w-full bg-accent-lime text-graphite font-bold py-3 rounded-lg level-up-text"
                    style={{ animationDelay: '1.1s' }}
                >
                    Continuar
                </button>
            </div>
        </div>
    );
};

export default LevelUpModal;
