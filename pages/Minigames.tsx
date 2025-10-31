import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Swords } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Minigames: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useUser();
    
    const reactionGameLevel = currentUser?.minigames_progress?.reaction_game?.level || 1;
    const shadowDuelLevel = currentUser?.minigames_progress?.shadow_duel?.level || 1;

    return (
        <div className="bg-graphite text-white min-h-screen">
            <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2">
                    <ArrowLeft />
                </button>
                <h1 className="text-xl font-bold">Biblioteca de Minijuegos</h1>
            </header>

            <main className="p-4 space-y-4">
                <Link to="/minigames/reaction" className="block bg-graphite-light p-4 rounded-lg hover:bg-graphite-lighter transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-500/20 rounded-lg mr-4">
                                <Zap className="text-yellow-400" size={24}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Reflejos de Asclepio</h3>
                                <p className="text-sm text-gray-400">Toca los objetivos antes de que desaparezcan.</p>
                            </div>
                        </div>
                        <div className="text-center bg-graphite-lighter px-4 py-2 rounded-md">
                            <p className="text-xs font-semibold text-gray-400">NIVEL</p>
                            <p className="text-xl font-bold text-white">{reactionGameLevel}</p>
                        </div>
                    </div>
                </Link>
                
                <Link to="/minigames/shadow-duel" className="block bg-graphite-light p-4 rounded-lg hover:bg-graphite-lighter transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-500/20 rounded-lg mr-4">
                                <Swords className="text-red-400" size={24}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Duelo de Sombras</h3>
                                <p className="text-sm text-gray-400">Vence a tu oponente en un combate estratégico.</p>
                            </div>
                        </div>
                        <div className="text-center bg-graphite-lighter px-4 py-2 rounded-md">
                            <p className="text-xs font-semibold text-gray-400">NIVEL</p>
                            <p className="text-xl font-bold text-white">{shadowDuelLevel}</p>
                        </div>
                    </div>
                </Link>

                <div className="text-center p-8 border-2 border-dashed border-graphite-lighter rounded-lg mt-6">
                    <p className="text-gray-500">Más juegos próximamente...</p>
                </div>
            </main>
        </div>
    );
};

export default Minigames;