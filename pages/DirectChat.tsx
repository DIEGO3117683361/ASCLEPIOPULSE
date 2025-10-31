import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Smile, Dumbbell } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { DirectChatMessage, User as UserType, Routine } from '../types';
import StickerPicker from '../components/StickerPicker';
import UserProfilePicture from '../components/UserProfilePicture';
import ShareRoutineModal from '../components/ShareRoutineModal';

const RoutineShareCard: React.FC<{ routineId: string }> = ({ routineId }) => {
    const navigate = useNavigate();
    const { routines, users, currentUser, followRoutine, unfollowRoutine } = useUser();
    const routine = routines.find(r => r.id === parseInt(routineId));
    const creator = users.find(u => u.id === routine?.user_id);

    if (!routine || !creator) {
        return <div className="p-2 text-sm text-gray-400">Rutina no disponible.</div>;
    }

    const isFollowing = currentUser?.followed_routine_ids?.includes(routine.id);
    const isOwnRoutine = currentUser?.id === routine.user_id;

    const handleFollowToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFollowing) {
            unfollowRoutine(routine.id);
        } else {
            followRoutine(routine.id);
        }
    };
    
    return (
        <div className="p-3 bg-graphite rounded-lg w-64">
            <div className="flex items-start gap-3">
                <UserProfilePicture user={creator} className="w-10 h-10 flex-shrink-0" />
                <div>
                    <p className="font-bold text-white line-clamp-1">{routine.nombre}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">de @{creator.username_unico}</p>
                </div>
            </div>
            <p className="text-xs text-gray-300 my-2 line-clamp-2">{routine.descripcion}</p>
            <div className="flex flex-col gap-2 mt-3">
                <button onClick={() => navigate(`/routine/${routine.id}`)} className="w-full bg-graphite-lighter text-white font-semibold py-2 rounded-md text-sm transition hover:bg-gray-700">
                    Ver Rutina
                </button>
                {!isOwnRoutine && (
                    <button onClick={handleFollowToggle} className={`w-full font-semibold py-2 rounded-md text-sm transition ${isFollowing ? 'bg-red-500/80 text-white' : 'bg-accent-lime text-graphite hover:bg-lime-500'}`}>
                        {isFollowing ? 'Dejar de Seguir' : 'Seguir Rutina'}
                    </button>
                )}
            </div>
        </div>
    );
};


const ChatBubble: React.FC<{ message: DirectChatMessage, isOwn: boolean, sender?: UserType }> = ({ message, isOwn, sender }) => {
    if (!sender) return null;
    const isMedia = message.type === 'sticker';
    const isRoutine = message.type === 'routine';

    return (
        <div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {!isOwn && <UserProfilePicture user={sender} className="w-8 h-8 self-end" />}
            <div className={`max-w-xs md:max-w-md p-1 rounded-2xl ${isOwn ? 'bg-accent-lime text-graphite rounded-br-none' : 'bg-graphite-light text-white rounded-bl-none'}`}>
                <div className={`p-2 ${isMedia ? 'bg-black/10 rounded-xl' : ''} ${isRoutine ? '!p-0' : ''}`}>
                    {message.type === 'text' && <p className="text-sm break-words">{message.content}</p>}
                    {message.type === 'sticker' && <img src={message.content} alt="sticker" className="w-28 h-28" />}
                    {message.type === 'routine' && <RoutineShareCard routineId={message.content} />}
                </div>
                {!isRoutine && (
                    <p className={`text-xs mt-1 px-2 pb-1 ${isOwn ? 'text-gray-700' : 'text-gray-500'} text-right`}>
                        {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </div>
        </div>
    );
};

const DirectChat: React.FC = () => {
    const { id: chatRoomId } = useParams<{ id: string }>();
    const { currentUser, users, getDirectChatMessages, sendDirectChatMessage, markChatRoomAsRead, chatRooms } = useUser();
    
    const [messages, setMessages] = useState<DirectChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isStickerPickerOpen, setStickerPickerOpen] = useState(false);
    const [isShareRoutineModalOpen, setShareRoutineModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const room = chatRooms.find(r => r.id === chatRoomId);
    const otherUserId = room?.participant_ids.find(id => id !== currentUser?.id);
    const otherUser = users.find(u => u.id === otherUserId);

    useEffect(() => {
        if (!chatRoomId) return;
        markChatRoomAsRead(chatRoomId);
        const unsubscribe = getDirectChatMessages(chatRoomId, setMessages);
        return () => unsubscribe();
    }, [chatRoomId, getDirectChatMessages, markChatRoomAsRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleSendText = () => {
        if (newMessage.trim() && chatRoomId) {
            sendDirectChatMessage(chatRoomId, 'text', newMessage.trim());
            setNewMessage('');
        }
    };

    const handleSendSticker = (stickerUrl: string) => {
        if (chatRoomId) {
            sendDirectChatMessage(chatRoomId, 'sticker', stickerUrl);
        }
    };
    
    const handleSendRoutine = (routineId: number) => {
        if (chatRoomId) {
            sendDirectChatMessage(chatRoomId, 'routine', routineId.toString());
        }
    };

    if (!otherUser || !chatRoomId) return <div className="text-center p-4">Chat no encontrado.</div>;

    return (
        <>
            <StickerPicker isOpen={isStickerPickerOpen} onClose={() => setStickerPickerOpen(false)} onSelect={handleSendSticker} />
            <ShareRoutineModal isOpen={isShareRoutineModalOpen} onClose={() => setShareRoutineModalOpen(false)} onSelect={handleSendRoutine} />
            <div className="bg-graphite text-white h-full flex flex-col">
                <header className="p-4 flex items-center bg-graphite z-10 border-b border-graphite-lighter flex-shrink-0">
                    <Link to={`/messages`} className="p-2 -ml-2 mr-2"><ArrowLeft /></Link>
                    <UserProfilePicture user={otherUser} className="w-8 h-8 mr-3" />
                    <div>
                        <h1 className="text-lg font-bold">{otherUser.nombre}</h1>
                        <p className="text-xs text-red-400">Los mensajes se eliminan en 42 horas.</p>
                    </div>
                </header>

                <main className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map(msg => (
                        <ChatBubble key={msg.id} message={msg} isOwn={msg.sender_id === currentUser?.id} sender={msg.sender_id === currentUser?.id ? currentUser : otherUser}/>
                    ))}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="bg-graphite-light border-t border-graphite-lighter flex-shrink-0">
                    <div className="flex items-center space-x-2 p-2">
                         <button onClick={() => setShareRoutineModalOpen(true)} className="p-3 text-gray-400 hover:text-white"><Dumbbell size={20} /></button>
                         <button onClick={() => setStickerPickerOpen(true)} className="p-3 text-gray-400 hover:text-white"><Smile size={20} /></button>
                        <input 
                            type="text" 
                            placeholder="Escribe un mensaje..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                            className="flex-1 bg-graphite border border-graphite-lighter rounded-full py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime"
                        />
                        <button onClick={handleSendText} className="p-3 bg-accent-lime text-graphite rounded-full">
                            <Send size={20} />
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default DirectChat;