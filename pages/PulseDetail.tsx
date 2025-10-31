import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Flame, X, Dumbbell, Trophy, LogOut, Swords, Calendar, Settings } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { PulseLog, Routine, User, PulseParticipant } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import UserProfilePicture from '../components/UserProfilePicture';
import EditPulseGoalsModal from '../components/EditPulseGoalsModal';

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

const PulseDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { currentUser, pulses, users, routines, leavePulse, deletePulse } = useUser();
    const [selectedParticipant, setSelectedParticipant] = useState<PulseParticipant | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    
    const pulseId = parseInt(id || '');
    const pulse = pulses.find(p => p.id === pulseId);
    
    if (!pulse || !currentUser) return <div className="p-4 text-center">Pulse no encontrado.</div>;
    
    const rankedParticipants = [...pulse.participants].sort((a, b) => b.progress - a.progress);

    const endDate = new Date(pulse.endDate);
    const daysRemaining = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));


    const selectedUser = users.find(u => u.id === selectedParticipant?.user_id);
    const selectedRoutine = routines.find(r => r.id === selectedParticipant?.selected_routine_id);
    const currentUserParticipant = pulse.participants.find(p => p.user_id === currentUser.id);
    
    const confirmLeaveOrDelete = () => {
        const isCreator = pulse.creator_id === currentUser?.id;
        if (isCreator) {
            deletePulse(pulse.id).then(() => {
                setShowConfirmModal(false);
                navigate('/vs');
            });
        } else {
            leavePulse(pulse.id).then(() => {
                setShowConfirmModal(false);
                navigate('/vs');
            });
        }
    };

    const isCreator = pulse.creator_id === currentUser.id;
    const modalTitle = isCreator ? 'Eliminar Pulse' : 'Salir del Pulse';
    const modalMessage = isCreator 
        ? '¿Estás seguro de que quieres eliminar este Pulse? Esta acción es permanente y afectará a todos los participantes.' 
        : '¿Estás seguro de que quieres salir de este Pulse? Perderás todo tu progreso.';
    const confirmText = isCreator ? 'Eliminar' : 'Salir';

    const getRankBorderStyle = (rank: number) => {
        switch (rank) {
            case 1: return "border-yellow-400";
            case 2: return "border-slate-400";
            case 3: return "border-orange-500";
            default: return "border-graphite-light";
        }
    };


    return (
        <div className="bg-graphite text-white min-h-screen">
            <ConfirmationModal 
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmLeaveOrDelete}
                title={modalTitle}
                message={modalMessage}
                confirmText={confirmText}
            />

             {selectedParticipant && selectedUser && selectedRoutine && <LogDetailModal participant={selectedParticipant} user={selectedUser} routine={selectedRoutine} onClose={() => setSelectedParticipant(null)} />}

             {currentUserParticipant && (
                <EditPulseGoalsModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    pulse={pulse}
                    participant={currentUserParticipant}
                />
            )}

            <header className="p-4 flex items-center sticky top-0 bg-graphite z-20 border-b border-graphite-lighter">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2"><ArrowLeft /></button>
                <h1 className="text-xl font-bold truncate">{pulse.name}</h1>
            </header>

            <main className="p-4 space-y-6">
                 <div className="bg-gradient-to-br from-accent-lime/10 to-graphite-light p-4 rounded-lg border border-graphite-lighter shadow-lg">
                    <h2 className="text-2xl font-black text-white">{pulse.name}</h2>
                    <p className="text-sm text-gray-300 mt-1 mb-4">{pulse.description}</p>
                    <div className="flex justify-around items-center text-center border-t border-graphite-lighter pt-3">
                         <div>
                            <p className="text-2xl font-bold flex items-center justify-center"><Flame className="text-accent-orange mr-1.5" size={20}/> {pulse.streak}</p>
                            <p className="text-xs text-gray-400 font-semibold">RACHA DE PULSE</p>
                        </div>
                         <div>
                            <p className="text-2xl font-bold flex items-center justify-center"><Calendar className="text-sky-400 mr-1.5" size={20}/> {daysRemaining > 0 ? daysRemaining : 'Finalizado'}</p>
                            <p className="text-xs text-gray-400 font-semibold">{daysRemaining > 0 ? 'DÍAS RESTANTES' : ''}</p>
                        </div>
                    </div>
                </div>

                {currentUserParticipant && (
                    <div className="bg-graphite-light p-3 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-white">Mi Participación</p>
                            <p className="text-xs text-gray-400">Ajusta tu rutina y metas para este Pulse.</p>
                        </div>
                        <button 
                            onClick={() => setEditModalOpen(true)} 
                            className="flex items-center text-sm font-semibold bg-graphite-lighter py-2 px-3 rounded-md hover:bg-accent-lime/20 hover:text-accent-lime transition-colors"
                        >
                            <Settings size={14} className="mr-1.5" /> Editar
                        </button>
                    </div>
                )}


                <div>
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center"><Trophy size={20} className="mr-2 text-accent-lime"/> Clasificación General</h2>
                    
                    <div className="space-y-2">
                        {rankedParticipants.map((p, index) => {
                            const user = users.find(u => u.id === p.user_id);
                            if (!user) return null;
                            const rank = index + 1;
                            return (
                                <button 
                                    key={p.user_id} 
                                    onClick={() => setSelectedParticipant(p)} 
                                    className={`w-full flex items-center bg-graphite-light p-3 rounded-lg hover:bg-graphite-lighter transition border-l-4 ${getRankBorderStyle(rank)}`}
                                >
                                    <span className="font-bold text-gray-400 w-8 text-center text-lg">{rank}</span>
                                    <UserProfilePicture user={user} className="w-10 h-10 mx-2"/>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="font-semibold text-white truncate">{user.nombre}</p>
                                        <div className="w-full bg-graphite-lighter rounded-full h-2.5 mt-1">
                                            <div className="bg-accent-lime h-2.5 rounded-full" style={{width: `${p.progress}%`}}></div>
                                        </div>
                                    </div>
                                    <span className="font-bold text-white ml-4 text-lg">{Math.round(p.progress)}%</span>
                                </button>
                            );
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
            </main>
        </div>
    );
};

export default PulseDetail;