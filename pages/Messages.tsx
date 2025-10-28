import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import UserProfilePicture from '../components/UserProfilePicture';

const Messages: React.FC = () => {
    const { currentUser, users, chatRooms, groupChatRooms } = useUser();

    if (!currentUser) return null;

    const combinedChats = [
        ...chatRooms.map(room => ({ ...room, isGroup: false })),
        ...groupChatRooms.map(room => ({ ...room, isGroup: true }))
    ].sort((a, b) => b.last_updated.toMillis() - a.last_updated.toMillis());

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center">
                    <MessageSquare className="mr-2 text-accent-lime"/> Mensajes
                </h1>
                <Link to="/group/create" className="bg-accent-lime text-graphite font-bold py-2 px-3 rounded-lg flex items-center text-sm transition hover:bg-lime-500">
                    <Plus size={16} className="mr-1"/> Crear Grupo
                </Link>
            </div>

            {combinedChats.length > 0 ? (
                <div className="space-y-3">
                    {combinedChats.map(room => {
                        const isUnread = room.unread_counts[currentUser.id] > 0;
                        
                        if (room.isGroup) {
                            // Group Chat Item
                            return (
                                <Link 
                                    key={room.id} 
                                    to={`/group-chat/${room.id}`}
                                    className={`block p-3 rounded-lg transition-colors duration-200 flex items-center space-x-4 ${isUnread ? 'bg-sky-500/10 hover:bg-sky-500/20' : 'bg-graphite-light hover:bg-graphite-lighter'}`}
                                >
                                    <div className="relative">
                                        <UserProfilePicture group={room} className="w-12 h-12" />
                                        {isUnread && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-accent-orange ring-2 ring-graphite-light"></span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className={`font-bold text-white truncate ${isUnread ? 'font-extrabold' : ''}`}>{room.name}</p>
                                            <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{room.last_updated.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <p className={`text-sm text-gray-400 truncate ${isUnread ? 'text-gray-200' : ''}`}>
                                            {room.last_message ? `${room.last_message.sender_id === currentUser.id ? 'Tú' : room.last_message.sender_name}: ${room.last_message.content}` : '...'}
                                        </p>
                                    </div>
                                </Link>
                            );
                        } else {
                            // Direct Chat Item
                            const otherUserId = room.participant_ids.find(id => id !== currentUser.id);
                            const otherUser = users.find(u => u.id === otherUserId);
                            if (!otherUser) return null;

                            return (
                                <Link 
                                    key={room.id} 
                                    to={`/direct-chat/${room.id}`}
                                    className={`block p-3 rounded-lg transition-colors duration-200 flex items-center space-x-4 ${isUnread ? 'bg-sky-500/10 hover:bg-sky-500/20' : 'bg-graphite-light hover:bg-graphite-lighter'}`}
                                >
                                    <div className="relative">
                                        <UserProfilePicture user={otherUser} className="w-12 h-12 flex-shrink-0" />
                                        {isUnread && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-accent-orange ring-2 ring-graphite-light"></span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className={`font-bold text-white truncate ${isUnread ? 'font-extrabold' : ''}`}>{otherUser.nombre}</p>
                                            <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{room.last_updated.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <p className={`text-sm text-gray-400 truncate ${isUnread ? 'text-gray-200' : ''}`}>
                                            {room.last_message?.sender_id === currentUser.id && 'Tú: '}
                                            {room.last_message?.content || '...'}
                                        </p>
                                    </div>
                                </Link>
                            );
                        }
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-graphite-light rounded-lg">
                    <MessageSquare className="mx-auto text-gray-500 mb-2" size={40}/>
                    <h3 className="font-bold text-white">Bandeja de entrada vacía</h3>
                    <p className="text-gray-400 text-sm mt-1">Inicia una conversación o crea un grupo.</p>
                </div>
            )}
        </div>
    );
};

export default Messages;