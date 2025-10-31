import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Flame, TrendingUp, ShieldCheck } from 'lucide-react';

const Welcome: React.FC = () => {
    
    const iconClasses = "absolute text-graphite-lighter animate-fade-in";
    
    const icons = [
        { icon: Dumbbell, size: 40, top: '15%', left: '10%', animationDelay: '300ms' },
        { icon: Flame, size: 32, top: '20%', right: '15%', animationDelay: '500ms' },
        { icon: TrendingUp, size: 36, bottom: '25%', left: '20%', animationDelay: '700ms' },
        { icon: ShieldCheck, size: 44, bottom: '30%', right: '10%', animationDelay: '900ms' },
        { icon: Dumbbell, size: 28, top: '40%', left: '25%', animationDelay: '1100ms' },
        { icon: Flame, size: 38, bottom: '15%', right: '35%', animationDelay: '1300ms' },
    ];

    return (
        <div className="bg-graphite text-white min-h-screen flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            {icons.map((item, index) => (
                <item.icon key={index} size={item.size} className={iconClasses} style={{ top: item.top, left: item.left, right: item.right, bottom: item.bottom, animationDelay: item.animationDelay }}/>
            ))}

            <div className="z-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
                 <h1 className="text-5xl font-black tracking-tighter text-white">ASCLEPIO</h1>
                 <p className="text-accent-lime font-semibold">PULSE</p>
            </div>
            
            <div className="mt-8 z-10 animate-fade-in" style={{ animationDelay: '1500ms' }}>
                <h2 className="text-2xl font-bold">Bienvenido a tu nuevo viaje</h2>
                <p className="text-gray-400 mt-2 max-w-xs mx-auto">Monitorea, compite y conquista tus metas de fitness.</p>
            </div>

            <div 
                className="z-10 mt-12 w-full max-w-xs flex flex-col items-center animate-fade-in-up" 
                style={{ animationDelay: '1800ms' }}>
                <Link 
                    to="/create-profile"
                    className="w-full bg-accent-lime text-graphite font-bold py-4 px-12 rounded-lg transition hover:bg-lime-500"
                >
                    Crear mi cuenta
                </Link>
                 <Link 
                    to="/login"
                    className="mt-4 text-sm text-gray-400 hover:text-white"
                >
                    Iniciar sesión
                </Link>
            </div>


             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
                .animate-fade-in-up {
                     animation: fade-in-up 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Welcome;