import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { ChatMessage, User as UserType } from '../types';
import UserProfilePicture from '../components/UserProfilePicture';

const ChatBubble: React.FC<{ message: ChatMessage, isOwn: boolean, sender?: UserType }> = ({ message, isOwn, sender }) => {
    if (!sender) return null;

    return (
        <div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {!isOwn && <UserProfilePicture user={sender} className="w-8 h-8" />}
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isOwn ? 'bg-accent-lime text-graphite rounded-br-none' : 'bg-graphite-light text-white rounded-bl-none'}`}>
                {!isOwn && <p className="text-xs font-bold text-accent-lime mb-1">{sender.nombre}</p>}
                <p className="text-sm break-words">{message.text}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-gray-700' : 'text-gray-500'} text-right`}>
                    {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

const Chat: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const routineId = parseInt(id || '');
    const { routines, currentUser, users, getChatMessages, sendChatMessage } = useUser();
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const routine = routines.find(r => r.id === routineId);

    useEffect(() => {
        if (!routineId) return;
        const unsubscribe = getChatMessages(routineId, (fetchedMessages) => {
            setMessages(fetchedMessages);
        });
        return () => unsubscribe();
    }, [routineId, getChatMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleSend = () => {
        if (newMessage.trim()) {
            sendChatMessage(routineId, newMessage);
            setNewMessage('');
        }
    };

    if (!routine) return <div className="text-center p-4">Chat no encontrado.</div>;

    return (
        <div className="bg-graphite text-white h-full flex flex-col">
            <header className="p-4 flex items-center bg-graphite z-10 border-b border-graphite-lighter flex-shrink-0">
                <Link to={`/routine/${id}`} className="p-2 -ml-2 mr-2">
                    <ArrowLeft />
                </Link>
                <div>
                    <h1 className="text-lg font-bold">Chat: {routine.nombre}</h1>
                    <p className="text-xs text-red-400">Los mensajes se borran cada 42 horas (próximamente)</p>
                </div>
            </header>

            <main className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map(msg => {
                    const sender = users.find(u => u.id === msg.sender_id);
                    return <ChatBubble key={msg.id} message={msg} isOwn={msg.sender_id === currentUser?.id} sender={sender}/>
                })}
                <div ref={messagesEndRef} />
            </main>

            <footer className="bg-graphite-light p-2 border-t border-graphite-lighter flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <button className="p-3 text-gray-400 hover:text-white">
                        <Paperclip size={20} />
                    </button>
                    <input 
                        type="text" 
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-graphite border border-graphite-lighter rounded-full py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    />
                    <button onClick={handleSend} className="p-3 bg-accent-lime text-graphite rounded-full">
                        <Send size={20} />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Chat;