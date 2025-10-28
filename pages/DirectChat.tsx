import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Smile, Image as ImageIcon } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { DirectChatMessage, User as UserType } from '../types';
import StickerPicker from '../components/StickerPicker';
import UserProfilePicture from '../components/UserProfilePicture';

const ChatBubble: React.FC<{ message: DirectChatMessage, isOwn: boolean, sender?: UserType }> = ({ message, isOwn, sender }) => {
    if (!sender) return null;
    const isMedia = message.type === 'image' || message.type === 'sticker';

    return (
        <div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {!isOwn && <UserProfilePicture user={sender} className="w-8 h-8 self-end" />}
            <div className={`max-w-xs md:max-w-md p-1 rounded-2xl ${isOwn ? 'bg-accent-lime text-graphite rounded-br-none' : 'bg-graphite-light text-white rounded-bl-none'}`}>
                <div className={`p-2 ${isMedia ? 'bg-black/10 rounded-xl' : ''}`}>
                    {message.type === 'text' && <p className="text-sm break-words">{message.content}</p>}
                    {message.type === 'image' && <img src={message.content} alt="chat" className="rounded-lg max-w-full h-auto" />}
                    {message.type === 'sticker' && <img src={message.content} alt="sticker" className="w-28 h-28" />}
                </div>
                <p className={`text-xs mt-1 px-2 pb-1 ${isOwn ? 'text-gray-700' : 'text-gray-500'} text-right`}>
                    {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

const DirectChat: React.FC = () => {
    const { id: chatRoomId } = useParams<{ id: string }>();
    const { currentUser, users, getDirectChatMessages, sendDirectChatMessage, uploadImageForChat, markChatRoomAsRead, chatRooms } = useUser();
    
    const [messages, setMessages] = useState<DirectChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isStickerPickerOpen, setStickerPickerOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && chatRoomId) {
            setIsUploading(true);
            const imageUrl = await uploadImageForChat(file);
            if (imageUrl) {
                await sendDirectChatMessage(chatRoomId, 'image', imageUrl);
            }
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (!otherUser || !chatRoomId) return <div className="text-center p-4">Chat no encontrado.</div>;

    return (
        <>
            <StickerPicker isOpen={isStickerPickerOpen} onClose={() => setStickerPickerOpen(false)} onSelect={handleSendSticker} />
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
                     {isUploading && (
                        <div className="flex justify-end">
                            <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-accent-lime/50 text-graphite rounded-br-none">
                                <p className="text-sm italic">Subiendo imagen...</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="bg-graphite-light p-2 border-t border-graphite-lighter flex-shrink-0">
                    <div className="flex items-center space-x-2">
                         <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                         <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-white"><ImageIcon size={20} /></button>
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