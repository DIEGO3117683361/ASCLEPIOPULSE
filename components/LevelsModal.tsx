import React from 'react';
import { X, CheckCircle, Lock, Award } from 'lucide-react';
import { LEVELS, getLevelForScore } from '../utils/levels';

interface LevelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userScore: number;
}

const LevelsModal: React.FC<LevelsModalProps> = ({ isOpen, onClose, userScore }) => {
    if (!isOpen) return null;

    const currentUserLevel = getLevelForScore(userScore);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-graphite-light rounded-lg p-4 w-full max-w-md border border-graphite-lighter shadow-xl flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{ maxHeight: '80vh' }}
            >
                <div className="flex justify-between items-center mb-4 px-2 flex-shrink-0">
                    <h3 className="text-xl font-bold text-white flex items-center"><Award size={20} className="mr-2 text-accent-lime"/> Niveles de Asclepio</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-graphite-lighter"><X size={20}/></button>
                </div>
                <div className="overflow-y-auto space-y-2 pr-1">
                    {LEVELS.map(level => {
                        const isUnlocked = userScore >= level.minScore;
                        const isCurrent = level.name === currentUserLevel.name;
                        
                        let statusIcon;
                        let statusColorClass;

                        if (isCurrent) {
                            statusIcon = <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-accent-lime/20 text-accent-lime`}><level.icon size={24} /></div>;
                            statusColorClass = 'bg-accent-lime/10 border-l-4 border-accent-lime';
                        } else if (isUnlocked) {
                             statusIcon = <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-green-500/20 text-green-400"><CheckCircle size={24} /></div>;
                             statusColorClass = 'bg-graphite';
                        } else {
                            statusIcon = <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-graphite-lighter text-gray-500"><Lock size={24} /></div>;
                            statusColorClass = 'bg-graphite opacity-60';
                        }

                        return (
                            <div key={level.name} className={`flex items-center p-3 rounded-lg transition-colors ${statusColorClass}`}>
                                {statusIcon}
                                <div className="flex-1">
                                    <h4 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{level.name}</h4>
                                    <p className="text-sm text-gray-400">Puntaje requerido: {level.minScore}+</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LevelsModal;
