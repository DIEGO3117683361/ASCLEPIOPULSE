import {
    Shield,
    Hammer,
    Wind,
    Sword,
    Sunrise,
    Dumbbell,
    Target,
    TrendingUp,
    Mountain,
    Bone,
    Flame,
    Zap,
    Crown,
    LucideIcon
} from 'lucide-react';

export interface Level {
    name: string;
    minScore: number;
    color: string;
    icon: LucideIcon;
}

export const LEVELS: Level[] = [
    { name: 'Recluta', minScore: 0, color: 'from-slate-400 to-slate-600', icon: Shield },
    { name: 'Aprendiz del hierro', minScore: 11, color: 'from-stone-500 to-stone-700', icon: Hammer },
    { name: 'Calentamiento', minScore: 21, color: 'from-sky-400 to-sky-600', icon: Wind },
    { name: 'Guerrero novato', minScore: 31, color: 'from-emerald-400 to-emerald-600', icon: Sword },
    { name: 'Fuerza naciente', minScore: 41, color: 'from-lime-400 to-lime-600', icon: Sunrise },
    { name: 'Entrenado', minScore: 51, color: 'from-yellow-400 to-yellow-600', icon: Dumbbell },
    { name: 'Disciplinado', minScore: 61, color: 'from-orange-400 to-orange-600', icon: Target },
    { name: 'Cazador de PRs', minScore: 71, color: 'from-red-500 to-red-700', icon: TrendingUp },
    { name: 'Aspirante al Olimpo', minScore: 101, color: 'from-purple-500 to-purple-700', icon: Mountain },
    { name: 'Bestia', minScore: 111, color: 'from-indigo-500 to-indigo-700', icon: Bone },
    { name: 'Fénix', minScore: 121, color: 'from-amber-500 to-red-600', icon: Flame },
    { name: 'Titán', minScore: 181, color: 'from-cyan-400 to-blue-600', icon: Zap },
    { name: 'ASCLEPIO PRIME', minScore: 201, color: 'from-pink-500 via-red-500 to-yellow-500', icon: Crown },
];

export const getLevelForScore = (score: number): Level => {
    let currentLevel = LEVELS[0];
    for (const level of LEVELS) {
        if (score >= level.minScore) {
            currentLevel = level;
        } else {
            break;
        }
    }
    return currentLevel;
};
