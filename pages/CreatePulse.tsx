import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Swords, UserPlus, Search, X, CheckSquare, Square } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Pulse, PulseParticipant, Routine, User } from '../types';
import UserProfilePicture from '../components/UserProfilePicture';


const CreatePulse: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, users, routines, addPulse } = useUser();
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [durationMonths, setDurationMonths] = useState('1');
    const [selectedRoutineIds, setSelectedRoutineIds] = useState<number[]>([]);
    const [invitedUserIds, setInvitedUserIds] = useState<number[]>([]);
    const [inviteSearchTerm, setInviteSearchTerm] = useState('');
    const [routineSearchTerm, setRoutineSearchTerm] = useState('');
    
    const userRoutines = useMemo(() => routines.filter(r => r.user_id === currentUser?.id), [routines, currentUser]);
    const followedRoutines = useMemo(() => routines.filter(r => currentUser?.followed_routine_ids?.includes(r.id) && r.user_id !== currentUser.id), [routines, currentUser]);
    const allSelectableRoutines = useMemo(() => [...userRoutines, ...followedRoutines], [userRoutines, followedRoutines]);
    
    const filteredRoutines = useMemo(() => {
        return allSelectableRoutines.filter(r => r.nombre.toLowerCase().includes(routineSearchTerm.toLowerCase()));
    }, [allSelectableRoutines, routineSearchTerm]);

    const otherUsers = users.filter(u => u.id !== currentUser?.id);

    const handleToggleInvite = (userId: number) => {
        setInvitedUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleToggleRoutine = (routineId: number) => {
        setSelectedRoutineIds(prev =>
            prev.includes(routineId) ? prev.filter(id => id !== routineId) : [...prev, routineId]
        );
    };
    
    const filteredInviteUsers = useMemo(() => {
        if (!inviteSearchTerm) return [];
        return otherUsers.filter(user => 
            user.nombre.toLowerCase().includes(inviteSearchTerm.toLowerCase()) || 
            user.username_unico.toLowerCase().includes(inviteSearchTerm.toLowerCase())
        ).slice(0, 5);
    }, [inviteSearchTerm, otherUsers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || selectedRoutineIds.length === 0 || !currentUser) {
            alert("Por favor completa el nombre y selecciona al menos una rutina.");
            return;
        }

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + parseInt(durationMonths));

        const creatorParticipant: PulseParticipant = {
            user_id: currentUser.id,
            goals: [],
            progress: 0,
            last_logged_stats: {},
        };

        const newPulseData: Omit<Pulse, 'id' | 'creator_id' | 'streak' | 'last_activity_date'> = {
            name,
            description,
            routine_ids: selectedRoutineIds,
            participants: [creatorParticipant],
            invited_ids: invitedUserIds,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        };

        const newPulseId = await addPulse(newPulseData as Omit<Pulse, 'id'>);
        if (newPulseId) {
            navigate(`/pulse/set-goals/${newPulseId}`);
        } else {
            alert("Hubo un error al crear el Pulse. Inténtalo de nuevo.");
        }
    };

    return (
        <div className="bg-graphite text-white">
            <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2"><ArrowLeft /></button>
                <h1 className="text-xl font-bold">Crear Nuevo Pulse</h1>
            </header>

            <main className="p-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nombre del Pulse</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white"></textarea>
                    </div>
                     <div className="grid grid-cols-1 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-400 mb-1">Duración</label>
                            <select value={durationMonths} onChange={e => setDurationMonths(e.target.value)} required className="w-full bg-graphite-light border border-graphite-lighter rounded-lg p-3 text-white">
                                {Array.from({ length: 20 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{m} mes{m > 1 ? 'es' : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Rutinas para la Competición ({selectedRoutineIds.length})</label>
                        {allSelectableRoutines.length > 0 ? (
                             <div className="bg-graphite-light p-3 rounded-lg">
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input type="text" placeholder="Buscar rutina..." value={routineSearchTerm} onChange={e => setRoutineSearchTerm(e.target.value)} className="w-full bg-graphite border border-graphite-lighter rounded-md py-2 pl-9 pr-4 text-white text-sm" />
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {filteredRoutines.map(r => {
                                        const creator = users.find(u => u.id === r.user_id);
                                        return (
                                            <button type="button" key={r.id} onClick={() => handleToggleRoutine(r.id)} className="w-full flex items-center text-left p-2 rounded-md hover:bg-graphite-lighter/50 transition-colors">
                                                {selectedRoutineIds.includes(r.id) ? <CheckSquare size={20} className="text-accent-lime mr-3"/> : <Square size={20} className="text-gray-500 mr-3"/>}
                                                <div>
                                                    <p className="font-semibold">{r.nombre}</p>
                                                    <p className="text-xs text-gray-400">de @{creator?.username_unico}</p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                             <div className="text-center p-4 bg-graphite-light rounded-lg border border-dashed border-graphite-lighter">
                                <p className="text-gray-400 text-sm">Debes crear o seguir una rutina para poder iniciar un Pulse.</p>
                                <div className="flex justify-center gap-4 mt-2">
                                    <Link to="/routine/create" className="text-accent-lime font-semibold inline-block text-sm hover:underline">
                                        Crear rutina
                                    </Link>
                                    <Link to="/explore" className="text-accent-lime font-semibold inline-block text-sm hover:underline">
                                        Explorar rutinas
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-2 flex items-center"><UserPlus size={20} className="mr-2"/> Invitar Amigos</h3>
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o usuario..."
                                value={inviteSearchTerm}
                                onChange={e => setInviteSearchTerm(e.target.value)}
                                className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 pl-10 pr-4 text-white"
                            />
                        </div>
                        <div className="space-y-1 mt-2">
                           {inviteSearchTerm && filteredInviteUsers.map(user => (
                                <button type="button" key={user.id} onClick={() => handleToggleInvite(user.id)}
                                    className={`w-full text-left p-2 rounded-md flex items-center transition ${invitedUserIds.includes(user.id) ? 'bg-accent-lime/20' : 'hover:bg-graphite-lighter'}`}>
                                    <UserProfilePicture user={user} className="w-8 h-8 rounded-full mr-3"/>
                                    <span>{user.nombre} <span className="text-gray-400 text-sm">@{user.username_unico}</span></span>
                                    <div className={`w-5 h-5 rounded-full ml-auto border-2 flex items-center justify-center ${invitedUserIds.includes(user.id) ? 'bg-accent-lime border-accent-lime' : 'border-gray-500'}`}>
                                       {invitedUserIds.includes(user.id) && <Check size={12} className="text-graphite"/>}
                                    </div>
                                </button>
                            ))}
                        </div>
                         {invitedUserIds.length > 0 && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-300 mb-2">Invitados:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {users.filter(u => invitedUserIds.includes(u.id)).map(user => (
                                        <div key={user.id} className="bg-graphite-lighter rounded-full flex items-center p-1 pr-2">
                                            <UserProfilePicture user={user} className="w-5 h-5 rounded-full mr-2"/>
                                            <span className="text-xs font-semibold">{user.nombre}</span>
                                            <button type="button" onClick={() => handleToggleInvite(user.id)} className="ml-1.5 text-gray-400 hover:text-white"><X size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                     <button type="submit" className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg flex items-center justify-center transition hover:bg-lime-500" disabled={allSelectableRoutines.length === 0}>
                        <Swords size={20} className="mr-2"/> Siguiente
                    </button>
                </form>
            </main>
        </div>
    );
};

export default CreatePulse;