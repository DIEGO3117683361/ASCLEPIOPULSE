import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Timestamp } from 'firebase/firestore';
import { ArrowLeft, Check, Search, Users, X, Clock } from 'lucide-react';
import UserProfilePicture from '../components/UserProfilePicture';

const GROUP_COLORS = ['#3e3e3e', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'];

const CreateGroup: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, users, createGroupChat } = useUser();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(GROUP_COLORS[0]);
    const [duration, setDuration] = useState(24); // in hours
    const [invitedIds, setInvitedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const otherUsers = users.filter(u => u.id !== currentUser?.id);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return [];
        return otherUsers
            .filter(u => !invitedIds.includes(u.id))
            .filter(u =>
                u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.username_unico.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 4);
    }, [searchTerm, otherUsers, invitedIds]);
    
    const toggleInvite = (id: number) => {
        if (invitedIds.includes(id)) {
            setInvitedIds(prev => prev.filter(i => i !== id));
        } else if (invitedIds.length < 9) { // 9 + creator = 10
            setInvitedIds(prev => [...prev, id]);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !name.trim()) return;

        const participant_ids = [currentUser.id, ...invitedIds];
        const unread_counts = participant_ids.reduce((acc, id) => ({...acc, [id]: 0}), {});
        
        const newGroup = {
            name,
            description,
            color,
            creator_id: currentUser.id,
            participant_ids,
            last_updated: Timestamp.now(),
            unread_counts,
            expiresAt: Timestamp.fromMillis(Date.now() + duration * 60 * 60 * 1000),
        };

        const newGroupId = await createGroupChat(newGroup);
        if (newGroupId) {
            navigate(`/group-chat/${newGroupId}`);
        } else {
            alert('Error al crear el grupo.');
        }
    };

    return (
        <div className="bg-graphite text-white">
            <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2"><ArrowLeft /></button>
                <h1 className="text-xl font-bold">Crear Nuevo Grupo</h1>
            </header>
            <main className="p-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nombre del Grupo</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Color del Ícono</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {GROUP_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-graphite-light ring-white' : ''}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Descripción (opcional)</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-2 px-4 text-white"></textarea>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center"><Clock size={14} className="mr-1.5"/> Duración del Chat</label>
                         <input type="range" min="24" max="120" step="1" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full h-2 bg-graphite-lighter rounded-lg appearance-none cursor-pointer accent-accent-lime"/>
                         <p className="text-center text-xs text-gray-300 mt-1">{duration} horas</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center"><Users size={14} className="mr-1.5"/> Invitar Amigos ({invitedIds.length + 1}/10)</label>
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                           <input type="text" placeholder="Buscar por nombre o usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 pl-10 pr-4 text-white"/>
                        </div>
                        <div className="mt-2 space-y-1">
                            {filteredUsers.map(user => (
                                <button type="button" key={user.id} onClick={() => toggleInvite(user.id)} className="w-full flex items-center p-2 rounded-md hover:bg-graphite-lighter transition">
                                    <UserProfilePicture user={user} className="w-8 h-8 mr-3"/>
                                    <span className="font-semibold">{user.nombre}</span>
                                    <span className="text-gray-400 text-sm ml-2">@{user.username_unico}</span>
                                </button>
                            ))}
                        </div>
                        {invitedIds.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {users.filter(u => invitedIds.includes(u.id)).map(u => (
                                    <div key={u.id} className="bg-graphite-lighter p-1 pr-2 rounded-full flex items-center">
                                        <UserProfilePicture user={u} className="w-5 h-5 mr-1.5"/>
                                        <span className="text-xs font-semibold">{u.nombre}</span>
                                        <button type="button" onClick={() => toggleInvite(u.id)} className="ml-1.5 text-gray-400 hover:text-white"><X size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg flex items-center justify-center transition hover:bg-lime-500">
                        <Check size={20} className="mr-2"/> Crear Grupo
                    </button>
                </form>
            </main>
        </div>
    );
};

export default CreateGroup;