import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { User } from '../types';
import { AVATAR_OPTIONS } from '../data/avatars';
import { X, ArrowLeft, Award, Smile, Type, Palette } from 'lucide-react';
import UserProfilePicture from './UserProfilePicture';

interface ProfilePictureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    user: Partial<User>;
}

const CREATOR_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];
const EMOJI_OPTIONS = ['💪', '🔥', '🏆', '🚀', '⚡️', '😎', '❤️', '🧠', '👑', '🎯', '💯', '✅'];

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({ isOpen, onClose, onSelect, user }) => {
    const [view, setView] = useState<'main' | 'avatars' | 'emojiCreator' | 'letterCreator'>('main');
    const [creatorColor, setCreatorColor] = useState(CREATOR_COLORS[0]);
    const [creatorEmoji, setCreatorEmoji] = useState('');
    const [creatorLetter, setCreatorLetter] = useState('');

    const { updateProfilePicture } = useUser();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    if (!isOpen) return null;

    const generateAndSaveAvatar = async (text: string, isEmoji: boolean) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 128;
        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = creatorColor;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        
        if (isEmoji) {
            ctx.font = `${size * 0.6}px sans-serif`;
            ctx.fillText(text, size / 2, size / 2 + 2); // Small offset for better emoji centering
        } else {
            ctx.font = `bold ${size * 0.55}px sans-serif`;
            ctx.fillText(text, size / 2, size / 2);
        }

        const dataUrl = canvas.toDataURL('image/png');
        await updateProfilePicture(dataUrl);
        onSelect(dataUrl);
        handleClose();
    };

    const handleSelectAvatar = async (url: string) => {
        await updateProfilePicture(url);
        onSelect(url);
        handleClose();
    };

    const handleSelectBadge = async () => {
        await updateProfilePicture('BADGE');
        onSelect('BADGE');
        handleClose();
    };

    const resetState = () => {
        setView('main');
        setCreatorColor(CREATOR_COLORS[0]);
        setCreatorEmoji('');
        setCreatorLetter('');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
                {view !== 'main' && (
                    <button onClick={() => setView('main')} className="p-1 mr-2 rounded-full hover:bg-graphite-lighter"><ArrowLeft size={20}/></button>
                )}
                <h3 className="text-xl font-bold text-white">Foto de Perfil</h3>
            </div>
            <button onClick={handleClose} className="p-1 rounded-full hover:bg-graphite-lighter"><X size={20}/></button>
        </div>
    );

    const MainView = () => (
        <div className="space-y-3">
            <button onClick={() => setView('avatars')} className="w-full flex items-center text-left bg-graphite-lighter p-3 rounded-lg hover:bg-graphite-lighter/80 transition">
                <Smile size={24} className="mr-3 text-accent-lime"/>
                <div>
                    <p className="font-semibold">Elegir un avatar</p>
                    <p className="text-xs text-gray-400">Selecciona de nuestra colección predefinida.</p>
                </div>
            </button>
            <button onClick={handleSelectBadge} className="w-full flex items-center text-left bg-graphite-lighter p-3 rounded-lg hover:bg-graphite-lighter/80 transition">
                <Award size={24} className="mr-3 text-accent-orange"/>
                <div>
                    <p className="font-semibold">Usar mi insignia de nivel</p>
                    <p className="text-xs text-gray-400">Muestra el ícono de tu nivel actual.</p>
                </div>
                <UserProfilePicture user={{...user, foto_url: 'BADGE'}} className="w-10 h-10 ml-auto" />
            </button>
            <div className="bg-graphite-lighter p-3 rounded-lg space-y-3">
                 <button onClick={() => setView('emojiCreator')} className="w-full flex items-center text-left bg-graphite p-3 rounded-lg hover:bg-graphite/80 transition">
                    <Palette size={24} className="mr-3 text-fuchsia-400"/>
                    <div>
                        <p className="font-semibold">Crear con Emoji</p>
                        <p className="text-xs text-gray-400">Combina un emoji con un color de fondo.</p>
                    </div>
                </button>
                 <button onClick={() => setView('letterCreator')} className="w-full flex items-center text-left bg-graphite p-3 rounded-lg hover:bg-graphite/80 transition">
                    <Type size={24} className="mr-3 text-sky-400"/>
                    <div>
                        <p className="font-semibold">Crear con Inicial</p>
                        <p className="text-xs text-gray-400">Usa la inicial de tu nombre y un fondo.</p>
                    </div>
                </button>
            </div>
        </div>
    );
    
    const AvatarsView = () => (
         <div className="grid grid-cols-4 gap-3">
            {AVATAR_OPTIONS.map(url => (
                <button key={url} onClick={() => handleSelectAvatar(url)} className="rounded-full p-1 transition bg-transparent hover:bg-accent-lime">
                    <img src={url} alt="avatar" className="w-full h-full rounded-full bg-graphite"/>
                </button>
            ))}
        </div>
    );

    const EmojiCreatorView = () => (
        <div className="space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: creatorColor }}>
                <span style={{ fontSize: '48px' }}>{creatorEmoji}</span>
            </div>
            <div>
                <p className="text-sm font-semibold mb-2 text-gray-300">1. Elige un color de fondo</p>
                <div className="flex flex-wrap gap-2">
                    {CREATOR_COLORS.map(c => <button key={c} onClick={() => setCreatorColor(c)} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${creatorColor === c ? 'ring-2 ring-offset-2 ring-offset-graphite-light ring-white' : ''}`} style={{ backgroundColor: c }} />)}
                </div>
            </div>
            <div>
                <p className="text-sm font-semibold mb-2 text-gray-300">2. Elige un emoji</p>
                <div className="grid grid-cols-6 gap-2 bg-graphite p-2 rounded-lg">
                    {EMOJI_OPTIONS.map(e => <button key={e} onClick={() => setCreatorEmoji(e)} className={`p-2 rounded-md text-2xl transition ${creatorEmoji === e ? 'bg-accent-lime/20' : 'hover:bg-graphite-lighter'}`}>{e}</button>)}
                </div>
            </div>
            <button onClick={() => generateAndSaveAvatar(creatorEmoji, true)} disabled={!creatorEmoji} className="w-full bg-accent-lime text-graphite font-bold py-2 rounded-lg transition disabled:bg-graphite-lighter disabled:text-gray-500">Guardar Avatar</button>
        </div>
    );
    
    const LetterCreatorView = () => (
         <div className="space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: creatorColor }}>
                <span className="text-5xl font-bold text-white">{creatorLetter}</span>
            </div>
            <div>
                <p className="text-sm font-semibold mb-2 text-gray-300">1. Elige un color de fondo</p>
                <div className="flex flex-wrap gap-2">
                    {CREATOR_COLORS.map(c => <button key={c} onClick={() => setCreatorColor(c)} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${creatorColor === c ? 'ring-2 ring-offset-2 ring-offset-graphite-light ring-white' : ''}`} style={{ backgroundColor: c }} />)}
                </div>
            </div>
             <div>
                <p className="text-sm font-semibold mb-2 text-gray-300">2. Escribe una inicial</p>
                <input type="text" maxLength={1} value={creatorLetter} onChange={e => setCreatorLetter(e.target.value.toUpperCase())} className="w-full bg-graphite border border-graphite-lighter text-center text-4xl font-bold p-2 rounded-lg text-white" />
            </div>
            <button onClick={() => generateAndSaveAvatar(creatorLetter, false)} disabled={!creatorLetter} className="w-full bg-accent-lime text-graphite font-bold py-2 rounded-lg transition disabled:bg-graphite-lighter disabled:text-gray-500">Guardar Avatar</button>
        </div>
    );
    
    const renderContent = () => {
        switch (view) {
            case 'avatars': return <AvatarsView />;
            case 'emojiCreator': return <EmojiCreatorView />;
            case 'letterCreator': return <LetterCreatorView />;
            case 'main':
            default: return <MainView />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div 
                className="bg-graphite-light rounded-lg p-4 w-full max-w-sm border border-graphite-lighter shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                {renderHeader()}
                {renderContent()}
            </div>
        </div>
    );
};

export default ProfilePictureModal;
