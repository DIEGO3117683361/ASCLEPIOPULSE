import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, X, Dumbbell, ChevronDown, Trophy, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { PulseLog, Routine, User, PulseParticipant } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import UserProfilePicture from '../components/UserProfilePicture';

const LogDetailModal: React.FC<{ participant: PulseParticipant, user: User, routine: Routine, onClose: () => void }> = ({ participant, user, routine, onClose }) => {
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-graphite-light rounded-lg p-4 w-full max-w-sm border border-graphite-lighter">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <UserProfilePicture user={user} className="w-8 h-8 mr-2"/>
                        <h3 className="font-bold text-white">{user.nombre}</h3>
                    </div>
                    <button onClick={onClose}><X/></button>
                </div>
                <p className="text-sm text-gray-400 mb-2">Metas vs. Último Registro:</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {routine.routineDays.flatMap(day => day.exercises).map(ex => {
                         const goal = participant.goals.find(g => g.exercise_id === ex.id);
                         const lastLog = participant.last_logged_stats[ex.id];
                         if (!goal) return null;

                         return (
                            <div key={ex.id} className="bg-graphite p-2 rounded-md text-sm">
                                <p className="font-semibold text-gray-200">{ex.nombre_ejercicio}</p>
                                <p className="text-gray-400">Meta: {goal.objetivo_series}x{goal.objetivo_reps} @ {goal.objetivo_peso}kg</p>
                                {lastLog ? (
                                    <p className="text-accent-lime">Último: {lastLog.series}x{lastLog.reps} @ {lastLog.peso}kg</p>
                                ) : (
                                     <p className="text-gray-500">Aún no registrado</p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

const ExerciseStats: React.FC<{ routine: Routine, participants: PulseParticipant[], users: User[] }> = ({ routine, participants, users }) => {
    const [expandedExerciseId, setExpandedExerciseId] = useState<number | null>(null);
    const allExercises = useMemo(() => routine.routineDays.flatMap(day => day.exercises), [routine]);

    const toggleExercise = (id: number) => {
        setExpandedExerciseId(prev => (prev === id ? null : id));
    };

    return (
        <div className="space-y-2">
            {allExercises.map(ex => (
                <div key={ex.id} className="bg-graphite-light rounded-lg">
                    <button onClick={() => toggleExercise(ex.id)} className="w-full p-3 flex justify-between items-center text-left">
                        <span className="font-bold text-white">{ex.nombre_ejercicio}</span>
                        <ChevronDown className={`transition-transform ${expandedExerciseId === ex.id ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedExerciseId === ex.id && (
                        <div className="px-3 pb-3 border-t border-graphite-lighter space-y-2">
                            {participants.map(p => {
                                const user = users.find(u => u.id === p.user_id);
                                const lastLog = p.last_logged_stats[ex.id];
                                return (
                                    <div key={p.user_id} className="flex items-center justify-between text-sm pt-2">
                                        <div className="flex items-center">
                                            <UserProfilePicture user={user} className="w-6 h-6 mr-2"/>
                                            <span>{user?.nombre}</span>
                                        </div>
                                        {lastLog ? (
                                            <span className="font-mono text-gray-300">{lastLog.series}x{lastLog.reps} @ {lastLog.peso}kg</span>
                                        ) : (
                                            <span className="text-xs text-gray-500">Sin registro</span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};


const PulseDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { currentUser, pulses, users, routines, leavePulse, deletePulse } = useUser();
    const [selectedParticipant, setSelectedParticipant] = useState<PulseParticipant | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const pulseId = parseInt(id || '');
    const pulse = pulses.find(p => p.id === pulseId);
    
    if (!pulse || !currentUser) return <div className="p-4 text-center">Pulse no encontrado.</div>;
    
    const routine = routines.find(r => r.id === pulse.routine_id);
    const rankedParticipants = [...pulse.participants].sort((a, b) => b.progress - a.progress);

    const isWeekend = [0, 6].includes(new Date().getDay());

    const progressColors = ['bg-accent-lime', 'bg-yellow-400', 'bg-sky-400', 'bg-orange-400', 'bg-red-500', 'bg-fuchsia-500', 'bg-teal-400'];

    if(!routine) return <div className="p-4 text-center">Rutina del Pulse no encontrada.</div>;

    const selectedUser = users.find(u => u.id === selectedParticipant?.user_id);
    
    const confirmLeaveOrDelete = () => {
        const isCreator = pulse.creator_id === currentUser?.id;
        if (isCreator) {
            deletePulse(pulse.id).then(() => {
                setShowConfirmModal(false);
                navigate('/vs');
            });
        } else {
            leavePulse(pulse.id);
            setShowConfirmModal(false);
        }
    };

    const isCreator = pulse.creator_id === currentUser.id;
    const modalTitle = isCreator ? 'Eliminar Pulse' : 'Salir del Pulse';
    const modalMessage = isCreator 
        ? '¿Estás seguro de que quieres eliminar este Pulse? Esta acción es permanente y afectará a todos los participantes.' 
        : '¿Estás seguro de que quieres salir de este Pulse? Perderás todo tu progreso.';
    const confirmText = isCreator ? 'Eliminar' : 'Salir';

    return (
        <div className="bg-graphite text-white">
            <ConfirmationModal 
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmLeaveOrDelete}
                title={modalTitle}
                message={modalMessage}
                confirmText={confirmText}
            />

             {selectedParticipant && selectedUser && <LogDetailModal participant={selectedParticipant} user={selectedUser} routine={routine} onClose={() => setSelectedParticipant(null)} />}

            <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2"><ArrowLeft /></button>
                <h1 className="text-xl font-bold truncate">{pulse.name}</h1>
            </header>

            <main className="p-4 space-y-6">
                 <div className="bg-graphite-light p-4 rounded-lg flex justify-between items-center">
                    <p className="text-sm text-gray-300 flex-1 pr-4">{pulse.description}</p>
                    <div className="text-center">
                        <Flame className="text-accent-orange mx-auto" size={28}/>
                        <p className="text-xl font-bold">{pulse.streak}</p>
                        <p className="text-xs text-gray-400">Racha</p>
                    </div>
                </div>

                {isWeekend && rankedParticipants.length >= 3 && (
                    <div className="bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-yellow-500/20 p-4 rounded-lg border border-yellow-400/30">
                        <h3 className="font-bold text-lg text-yellow-300 flex items-center mb-2"><Trophy size={20} className="mr-2"/> MVP de la Semana</h3>
                        <div className="flex justify-around text-center text-sm">
                           {[1, 0, 2].map((i) => {
                               const p = rankedParticipants[i];
                               const u = users.find(u => u.id === p.user_id);
                               if (!u) return null;
                               const medal = i === 1 ? '🥈' : i === 0 ? '🥇' : '🥉';
                               return (
                                   <div key={p.user_id}>
                                       <UserProfilePicture user={u} className="w-10 h-10 mx-auto border-2 border-yellow-400/50"/>
                                       <p className="font-semibold mt-1">{medal} {u?.nombre}</p>
                                   </div>
                               );
                           })}
                        </div>
                    </div>
                )}

                <div>
                    <h2 className="font-bold text-white text-lg mb-3">Ranking de Progreso</h2>
                     <div className="space-y-4">
                        {rankedParticipants.map((p, index) => {
                            const user = users.find(u => u.id === p.user_id);
                            if (!user) return null;
                            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                            return (
                                <div key={p.user_id} className="w-full">
                                    <button onClick={() => setSelectedParticipant(p)} className="w-full text-left group">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center flex-1 min-w-0">
                                                <span className="w-6 font-bold text-center shrink-0">{medal || <span className="text-gray-500 text-sm">#{index + 1}</span>}</span>
                                                <UserProfilePicture user={user} className="w-8 h-8 mr-2 ml-2 shrink-0 border-2 border-transparent group-hover:border-accent-lime/50 transition-colors"/>
                                                <span className="font-semibold truncate">{user.nombre}</span>
                                            </div>
                                            <span className="text-sm font-bold ml-2">{Math.round(p.progress)}%</span>
                                        </div>
                                        <div className="w-full bg-graphite-lighter rounded-full h-3.5">
                                            <div 
                                                className={`${progressColors[index % progressColors.length]} h-3.5 rounded-full transition-all duration-500`} 
                                                style={{width: `${p.progress}%`}}>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                 {pulse.participants.some(p => p.user_id === currentUser.id) && (
                    <div className="mt-4 pt-4 border-t border-graphite-lighter">
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="w-full bg-red-500/20 text-red-400 font-bold py-3 rounded-lg flex items-center justify-center transition hover:bg-red-500/30"
                        >
                           <LogOut size={16} className="mr-2"/> {pulse.creator_id === currentUser.id ? 'Eliminar Pulse' : 'Salir del Pulse'}
                        </button>
                    </div>
                )}


                 <div>
                    <h2 className="font-bold text-white text-lg mb-3">Estadísticas por Ejercicio</h2>
                    <ExerciseStats routine={routine} participants={pulse.participants} users={users} />
                </div>
            </main>
        </div>
    );
};

export default PulseDetail;