import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Edit, Save, Trash2, LogOut, UserPlus, Search, X, Users, Check } from 'lucide-react';
import UserProfilePicture from '../components/UserProfilePicture';
import ConfirmationModal from '../components/ConfirmationModal';

const GROUP_COLORS = ['#3e3e3e', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'];

const GroupSettings: React.FC = () => {
    const navigate = useNavigate();
    const { id: roomId } = useParams<{ id: string }>();
    const { currentUser, users, groupChatRooms, updateGroupInfo, leaveGroup, deleteGroup, addParticipantsToGroup } = useUser();

    const room = groupChatRooms.find(r => r.id === roomId);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(room?.name || '');
    const [description, setDescription] = useState(room?.description || '');
    const [color, setColor] = useState(room?.color || GROUP_COLORS[0]);
    
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newParticipantIds, setNewParticipantIds] = useState<number[]>([]);

    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'leave' | 'delete' | null>(null);

    const participants = useMemo(() => {
        return users.filter(u => room?.participant_ids.includes(u.id));
    }, [users, room]);

    const availableUsers = useMemo(() => {
        if (!room) return [];
        return users.filter(u => !room.participant_ids.includes(u.id) && u.id !== currentUser?.id);
    }, [users, room, currentUser]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return [];
        return availableUsers
            .filter(u => u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || u.username_unico.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 5);
    }, [searchTerm, availableUsers]);

    if (!room || !currentUser) return <div className="p-4 text-center">Grupo no encontrado.</div>;
    const isCreator = currentUser.id === room.creator_id;

    const handleSave = async () => {
        if (roomId && (name.trim() !== room.name || description.trim() !== room.description || color !== room.color)) {
            await updateGroupInfo(roomId, { name: name.trim(), description: description.trim(), color });
        }
        setIsEditing(false);
    };

    const handleConfirmAction = async () => {
        if (!roomId) return;
        if (confirmAction === 'leave') {
            await leaveGroup(roomId);
            navigate('/messages');
        } else if (confirmAction === 'delete' && isCreator) {
            await deleteGroup(roomId);
            navigate('/messages');
        }
        setConfirmModalOpen(false);
        setConfirmAction(null);
    };

    const handleAddParticipants = async () => {
        if (roomId && newParticipantIds.length > 0) {
            await addParticipantsToGroup(roomId, newParticipantIds);
        }
        setIsAdding(false);
        setNewParticipantIds([]);
        setSearchTerm('');
    };
    
    const toggleNewParticipant = (id: number) => {
        setNewParticipantIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };


    return (
        <>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmAction}
                title={confirmAction === 'delete' ? "Eliminar Grupo" : "Salir del Grupo"}
                message={confirmAction === 'delete' ? "¿Estás seguro de que quieres eliminar este grupo permanentemente?" : "¿Estás seguro de que quieres salir de este grupo?"}
                confirmText={confirmAction === 'delete' ? "Eliminar" : "Salir"}
            />
            <div className="bg-graphite text-white">
                <header className="p-4 flex items-center justify-between sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                    <div className="flex items-center">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2"><ArrowLeft /></button>
                        <h1 className="text-xl font-bold">Ajustes del Grupo</h1>
                    </div>
                </header>

                <main className="p-4 space-y-6">
                    <div className="bg-graphite-light p-4 rounded-lg">
                        <div className="flex items-start">
                             {!isEditing && <UserProfilePicture group={room} className="w-16 h-16 mr-4 flex-shrink-0" />}
                             <div className="flex-1">
                                {isEditing ? (
                                    <div className="w-full space-y-3">
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-graphite border rounded p-2 text-lg font-bold" />
                                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-graphite border rounded p-2 text-sm" rows={2}></textarea>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Color del Ícono</label>
                                            <div className="flex flex-wrap gap-2">
                                                {GROUP_COLORS.map(c => (
                                                    <button key={c} type="button" onClick={() => setColor(c)} className={`w-7 h-7 rounded-full transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-graphite-light ring-white' : ''}`} style={{ backgroundColor: c }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{room.name}</h2>
                                        <p className="text-gray-400 text-sm">{room.description}</p>
                                    </div>
                                )}
                            </div>

                            {isCreator && (
                                <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="p-2 ml-2 text-gray-300 hover:text-white flex-shrink-0">
                                    {isEditing ? <Save /> : <Edit />}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-graphite-light p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-white text-lg flex items-center"><Users className="mr-2"/> Participantes ({participants.length}/10)</h3>
                            {isCreator && participants.length < 10 && <button onClick={() => setIsAdding(!isAdding)} className="text-sm font-semibold text-accent-lime">{isAdding ? 'Cancelar' : 'Añadir'}</button>}
                        </div>
                        {isAdding && (
                            <div className="mb-4 p-3 bg-graphite rounded-lg">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                    <input type="text" placeholder="Buscar para añadir..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-graphite-light border rounded py-2 pl-10 pr-4"/>
                                </div>
                                <div className="mt-2 space-y-1">
                                    {filteredUsers.map(user => (
                                        <button key={user.id} onClick={() => toggleNewParticipant(user.id)} className={`w-full flex items-center p-2 rounded-md transition ${newParticipantIds.includes(user.id) ? 'bg-accent-lime/20' : 'hover:bg-graphite-light'}`}>
                                            <UserProfilePicture user={user} className="w-8 h-8 mr-2"/>
                                            <span>{user.nombre}</span>
                                            {newParticipantIds.includes(user.id) && <Check className="ml-auto text-accent-lime"/>}
                                        </button>
                                    ))}
                                </div>
                                {newParticipantIds.length > 0 && <button onClick={handleAddParticipants} className="w-full bg-accent-lime text-graphite font-bold py-2 rounded-md mt-3 text-sm">Añadir ({newParticipantIds.length})</button>}
                            </div>
                        )}
                        <div className="space-y-2">
                            {participants.map(p => (
                                <Link to={`/profile/${p.id}`} key={p.id} className="flex items-center p-2 rounded-md hover:bg-graphite-lighter">
                                    <UserProfilePicture user={p} className="w-10 h-10 mr-3"/>
                                    <div>
                                        <p className="font-semibold text-white">{p.nombre}</p>
                                        <p className="text-xs text-gray-400">@{p.username_unico}</p>
                                    </div>
                                    {p.id === room.creator_id && <span className="ml-auto text-xs font-bold bg-accent-lime/20 text-accent-lime px-2 py-1 rounded-full">Admin</span>}
                                </Link>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        {!isCreator && (
                            <button onClick={() => { setConfirmAction('leave'); setConfirmModalOpen(true); }} className="w-full bg-red-500/20 text-red-400 font-bold py-3 rounded-lg flex items-center justify-center transition hover:bg-red-500/30">
                                <LogOut size={16} className="mr-2"/> Salir del Grupo
                            </button>
                        )}
                        {isCreator && (
                            <button onClick={() => { setConfirmAction('delete'); setConfirmModalOpen(true); }} className="w-full bg-red-500/20 text-red-400 font-bold py-3 rounded-lg flex items-center justify-center transition hover:bg-red-500/30">
                                <Trash2 size={16} className="mr-2"/> Eliminar Grupo
                            </button>
                        )}
                    </div>

                </main>
            </div>
        </>
    );
};

export default GroupSettings;