import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Users, TrendingUp, ShieldCheck, MessageSquare } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Routine, User } from '../types';
import UserProfilePicture from '../components/UserProfilePicture';

const RoutineCard: React.FC<{routine: Routine, creator: User | undefined}> = ({ routine, creator }) => {
    return (
        <Link to={`/routine/${routine.id}`} className="block bg-graphite-light p-4 rounded-lg hover:bg-graphite-lighter transition-colors duration-200">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-bold text-white">{routine.nombre}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{routine.descripcion}</p>
                </div>
                <div className="flex items-center text-sm text-gray-400 ml-2 flex-shrink-0">
                    <Users size={14} className="mr-1" />
                    {routine.followers}
                </div>
            </div>
            {creator && (
                <div className="flex items-center mt-3">
                    <UserProfilePicture user={creator} className="w-6 h-6 mr-2" />
                    <span className="text-xs font-medium text-gray-300">@{creator.username_unico}</span>
                </div>
            )}
        </Link>
    );
}

const ProfileCard: React.FC<{user: User}> = ({ user }) => {
    const { currentUser, getOrCreateChatRoom } = useUser();
    const navigate = useNavigate();

    const handleMessageClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentUser?.id === user.id) return;

        const chatRoomId = await getOrCreateChatRoom(user.id);
        if (chatRoomId) {
            navigate(`/direct-chat/${chatRoomId}`);
        }
    };

    const isCurrentUser = currentUser?.id === user.id;

    return (
        <Link to={`/profile/${user.id}`} className="block bg-graphite-light p-4 rounded-lg hover:bg-graphite-lighter transition-colors duration-200">
            <div className="flex items-center">
                <UserProfilePicture user={user} className="w-12 h-12 mr-4" />
                <div className="flex-1">
                    <h3 className="font-bold text-white">{user.nombre}</h3>
                    <p className="text-sm text-gray-400">@{user.username_unico}</p>
                </div>
                {!isCurrentUser && (
                    <button onClick={handleMessageClick} className="p-2 rounded-full bg-graphite-lighter hover:bg-accent-lime/20 text-gray-300 hover:text-accent-lime mr-2">
                        <MessageSquare size={20} />
                    </button>
                )}
                <div className="flex items-center bg-graphite-lighter px-3 py-1 rounded-full">
                    <ShieldCheck size={14} className="text-accent-lime mr-1.5" />
                    <span className="text-sm font-bold text-white">{user.asclepio_score}</span>
                </div>
            </div>
        </Link>
    );
}

const Explore: React.FC = () => {
    const [activeTab, setActiveTab] = useState('routines');
    const { users, routines } = useUser();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-white mb-4">Explorar</h1>
            
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                    type="text"
                    placeholder="Buscar rutinas o usuarios..."
                    className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime"
                />
            </div>

            <div className="flex border-b border-graphite-lighter mb-4">
                <button 
                    onClick={() => setActiveTab('routines')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'routines' ? 'text-accent-lime border-b-2 border-accent-lime' : 'text-gray-400'}`}
                >
                    Rutinas
                </button>
                <button 
                    onClick={() => setActiveTab('profiles')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'profiles' ? 'text-accent-lime border-b-2 border-accent-lime' : 'text-gray-400'}`}
                >
                    Perfiles
                </button>
            </div>
            
            {activeTab === 'routines' && (
                <div>
                    <div className="flex items-center text-lg font-bold text-white mb-4">
                        <TrendingUp className="text-accent-lime mr-2" size={24}/>
                        <h2>Rutinas Populares</h2>
                    </div>
                    <div className="space-y-4">
                        {routines.map(routine => {
                            const creator = users.find(u => u.id === routine.user_id);
                            return <RoutineCard key={routine.id} routine={routine} creator={creator} />
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'profiles' && (
                <div>
                    <div className="flex items-center text-lg font-bold text-white mb-4">
                        <Users className="text-accent-lime mr-2" size={24}/>
                        <h2>Perfiles Destacados</h2>
                    </div>
                    <div className="space-y-4">
                        {users.map(user => <ProfileCard key={user.id} user={user} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Explore;