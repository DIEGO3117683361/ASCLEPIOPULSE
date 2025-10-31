import React from 'react';
import { X, CheckCircle, Lock, Award } from 'lucide-react';
import { User } from '../types';
import { useUser } from '../context/UserContext';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const achievementsList = [
    { id: 'create_routine', title: 'Creador de Rutinas', description: 'Crea tu primera rutina.', points: 2, check: (user: User, routines: any[]) => routines.some(r => r.user_id === user.id) },
    { id: 'streak_4_days', title: 'Creando el Hábito', description: 'Alcanza una racha de 4 días de entrenamiento.', points: 5, check: (user: User) => (user.achievements?.streak_4_days || user.current_streak >= 4) },
    { id: 'join_pulse', title: 'Competidor', description: 'Únete o crea tu primer Pulse.', points: 7, check: (user: User, routines: any[], pulses: any[]) => pulses.some(p => p.participants.some((participant: any) => participant.user_id === user.id)) },
    { id: 'streak_10_days', title: 'Racha de Acero', description: 'Alcanza una racha de 10 días.', points: 10, check: (user: User) => (user.achievements?.streak_10_days || user.current_streak >= 10) },
    { id: 'streak_30_days', title: 'Máquina Imparable', description: 'Alcanza una racha de 30 días.', points: 5, check: (user: User) => (user.achievements?.streak_30_days || user.current_streak >= 30) },
    { id: 'streak_60_days', title: 'Leyenda Viviente', description: 'Alcanza una racha de 60 días.', points: 10, check: (user: User) => (user.achievements?.streak_60_days || user.current_streak >= 60) },
    { id: 'get_follower', title: 'Influencer Fitness', description: 'Consigue que alguien siga una de tus rutinas.', points: 2, check: (user: User, routines: any[]) => routines.some(r => r.user_id === user.id && r.followers > 0) },
    { id: 'minigame_level_3', title: 'Gamer Atlético', description: 'Alcanza el nivel 3 en cualquier minijuego.', points: 3, check: (user: User) => !!user.achievements?.minigame_level_3 },
    { id: 'win_pulse', title: 'Campeón de Pulse', description: 'Gana una competición Pulse.', points: 20, check: () => false }, // Logic to be implemented
];


const AchievementItem: React.FC<{ title: string, description: string, points: number, isCompleted: boolean }> = ({ title, description, points, isCompleted }) => (
    <div className={`flex items-start p-3 rounded-lg transition-colors ${isCompleted ? 'bg-green-500/10' : 'bg-graphite'}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-graphite-lighter text-gray-500'}`}>
            {isCompleted ? <CheckCircle size={24} /> : <Lock size={24} />}
        </div>
        <div className="flex-1">
            <h4 className={`font-bold ${isCompleted ? 'text-white' : 'text-gray-300'}`}>{title}</h4>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className="text-right ml-2">
            <p className={`font-bold text-lg ${isCompleted ? 'text-green-400' : 'text-gray-500'}`}>+{points}</p>
            <p className="text-xs text-gray-500">puntos</p>
        </div>
    </div>
);

const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, user }) => {
    const { routines, pulses } = useUser();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-graphite-light rounded-lg p-4 w-full max-w-md border border-graphite-lighter shadow-xl flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{ maxHeight: '80vh' }}
            >
                <div className="flex justify-between items-center mb-4 px-2 flex-shrink-0">
                    <h3 className="text-xl font-bold text-white flex items-center"><Award size={20} className="mr-2 text-accent-lime"/> Logros</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-graphite-lighter"><X size={20}/></button>
                </div>
                <div className="overflow-y-auto space-y-2 pr-1">
                    {achievementsList.map(ach => (
                        <AchievementItem 
                            key={ach.id}
                            title={ach.title}
                            description={ach.description}
                            points={ach.points}
                            isCompleted={!!ach.check(user, routines, pulses)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AchievementsModal;