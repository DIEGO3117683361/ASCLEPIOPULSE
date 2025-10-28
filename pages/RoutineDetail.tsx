import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Users, MessageSquare, Check, Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { RoutineDay } from '../types';
import UserProfilePicture from '../components/UserProfilePicture';

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const DayCard: React.FC<{ day: RoutineDay, isOpen: boolean, onToggle: () => void }> = ({ day, isOpen, onToggle }) => {
    return (
        <div className="bg-graphite-light rounded-lg overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 text-left flex justify-between items-center">
                <h3 className="font-bold text-white">{dayNames[day.dia_semana]}</h3>
                <span className="text-xs text-gray-400">{day.exercises.length} ejercicios</span>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 border-t border-graphite-lighter">
                    <ul className="space-y-2 mt-3">
                        {day.exercises.map(ex => (
                            <li key={ex.id} className="text-sm text-gray-300 flex justify-between">
                               <span>{ex.nombre_ejercicio}</span>
                               <span className="font-mono text-gray-400">{ex.objetivo_series}x{ex.objetivo_reps} @ {ex.objetivo_peso}kg</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
};

const RoutineDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { routines, users, currentUser, followRoutine, unfollowRoutine } = useUser();
    const [openDayId, setOpenDayId] = useState<number | null>(null);
    
    const routineId = parseInt(id || '');
    const routine = routines.find(r => r.id === routineId);
    const creator = users.find(u => u.id === routine?.user_id);

    if (!routine || !creator) {
        return <div className="p-4 text-center">Rutina no encontrada.</div>;
    }

    const isFollowing = currentUser?.followed_routine_ids?.includes(routine.id);
    const isCreator = currentUser?.id === creator.id;

    const handleFollowToggle = () => {
        if (isFollowing) {
            unfollowRoutine(routine.id);
        } else {
            followRoutine(routine.id);
        }
    };
    
    const handleToggleDay = (dayId: number) => {
        setOpenDayId(prevId => prevId === dayId ? null : dayId);
    };

    return (
        <div className="bg-graphite text-white">
            <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2">
                    <ArrowLeft />
                </button>
                <h1 className="text-xl font-bold truncate">{routine.nombre}</h1>
            </header>

            <main className="p-4 space-y-6">
                <div>
                    <p className="text-gray-300 mb-2">{routine.descripcion}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <Link to={`/profile/${creator.id}`} className="flex items-center hover:text-white">
                            <UserProfilePicture user={creator} className="w-6 h-6 mr-2" />
                            <span>@{creator.username_unico}</span>
                        </Link>
                        <div className="flex items-center">
                            <Users size={14} className="mr-1.5" />
                            <span>{routine.followers} seguidores</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="font-bold text-white text-lg">Plan de Entrenamiento</h2>
                    {routine.routineDays.sort((a, b) => a.dia_semana - b.dia_semana).map(day => (
                        <DayCard key={day.id} day={day} isOpen={openDayId === day.id} onToggle={() => handleToggleDay(day.id)}/>
                    ))}
                </div>

                <div className="flex items-center space-x-2 pt-4">
                    <Link to={`/chat/${routine.id}`} className="flex-1 bg-graphite-lighter text-white font-bold py-3 rounded-lg flex items-center justify-center transition hover:bg-gray-700">
                        <MessageSquare size={20} className="mr-2"/> Chat
                    </Link>
                     {!isCreator && (
                        <button onClick={handleFollowToggle} className={`flex-1 font-bold py-3 rounded-lg flex items-center justify-center transition ${isFollowing ? 'bg-red-500/80 text-white' : 'bg-accent-lime text-graphite hover:bg-lime-500'}`}>
                           {isFollowing ? <Check size={20} className="mr-2"/> : <Plus size={20} className="mr-2"/>}
                           {isFollowing ? 'Siguiendo' : 'Seguir Rutina'}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RoutineDetail;