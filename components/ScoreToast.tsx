import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowUp } from 'lucide-react';

type ScoreUpdateType = { points: number; message: string; newTotal: number } | null;

interface ScoreToastProps {
  scoreUpdate: ScoreUpdateType;
  onClose: () => void;
}

const ScoreToast: React.FC<ScoreToastProps> = ({ scoreUpdate, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (scoreUpdate) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                // Allow animation to finish before clearing data
                setTimeout(onClose, 300); 
            }, 4000); 
            
            return () => clearTimeout(timer);
        }
    }, [scoreUpdate, onClose]);

    if (!scoreUpdate) return null;

    return (
        <div 
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
        >
            <div className="bg-graphite-lighter border-2 border-accent-lime/50 rounded-xl shadow-2xl p-4 flex items-center space-x-4">
                <div className="bg-accent-lime/20 p-3 rounded-full">
                    <ShieldCheck className="text-accent-lime" size={28} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center">
                       <h3 className="font-bold text-white text-lg flex items-center">
                           <ArrowUp size={16} className="mr-1"/> +{scoreUpdate.points} Puntos
                       </h3>
                    </div>
                    <p className="text-sm text-gray-300">{scoreUpdate.message}</p>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Nuevo total: {scoreUpdate.newTotal}</p>
                </div>
            </div>
        </div>
    );
};

export default ScoreToast;
