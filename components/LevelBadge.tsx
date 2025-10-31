import React from 'react';
import { Level } from '../utils/levels';

interface LevelBadgeProps {
    level: Level;
    className?: string;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ level, className = '' }) => {
    const Icon = level.icon;

    return (
        <div 
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white font-bold text-sm bg-gradient-to-br shadow-lg ${level.color} ${className}`}
        >
            <Icon size={16} strokeWidth={2.5} />
            <span>{level.name}</span>
        </div>
    );
};

export default LevelBadge;
