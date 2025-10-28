import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

type StreakMilestoneType = { type: 'personal' | 'pulse', days: number, pulseName?: string } | null;

interface StreakToastProps {
  streakMilestone: StreakMilestoneType;
  onClose: () => void;
}

const StreakToast: React.FC<StreakToastProps> = ({ streakMilestone, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (streakMilestone) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); 
            }, 5000); // Show for 5 seconds
            
            return () => clearTimeout(timer);
        }
    }, [streakMilestone, onClose]);

    if (!streakMilestone) return null;

    const message = streakMilestone.type === 'pulse'
        ? `¡El Pulse "${streakMilestone.pulseName}" lleva ${streakMilestone.days} días de racha!`
        : `¡Felicidades! Llevas ${streakMilestone.days} días de racha. ¡Sigue así!`;

    return (
        <div 
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
        >
            <div className="bg-graphite-lighter border-2 border-accent-orange/50 rounded-xl shadow-2xl p-4 flex items-center space-x-4">
                <div className="bg-accent-orange/20 p-3 rounded-full">
                    <Flame className="text-accent-orange" size={28} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">
                        ¡Racha Imparable!
                    </h3>
                    <p className="text-sm text-gray-300">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default StreakToast;
