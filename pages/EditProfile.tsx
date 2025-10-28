import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { User } from '../types';
import DeleteAccountModal from '../components/DeleteAccountModal';
import ProfilePictureModal from '../components/ProfilePictureModal';
import UserProfilePicture from '../components/UserProfilePicture';


const EditProfile: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, users, updateUser, deleteUserAccount } = useUser();
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isPictureModalOpen, setPictureModalOpen] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');


    useEffect(() => {
        if (currentUser) {
            setFormData(currentUser);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!formData.username_unico || !currentUser) {
            setUsernameStatus('idle');
            return;
        }
        if (formData.username_unico.toLowerCase() === currentUser.username_unico.toLowerCase()) {
            setUsernameStatus('idle'); // It's their own username
            return;
        }
        if (formData.username_unico.length < 3) {
            setUsernameStatus('idle');
            return;
        }

        setUsernameStatus('checking');
        const handler = setTimeout(() => {
            const isTaken = users.some(u => u.id !== currentUser.id && u.username_unico.toLowerCase() === formData.username_unico.toLowerCase());
            setUsernameStatus(isTaken ? 'taken' : 'available');
        }, 500);

        return () => clearTimeout(handler);
    }, [formData.username_unico, users, currentUser]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const processedValue = type === 'number' ? Number(value) : (name === 'username_unico' ? value.trim() : value);
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };
    
    const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            socials: {
                ...prev.socials,
                [name]: value.trim()
            }
        }));
    };

    const handlePictureSelect = (url: string) => {
        setFormData(prev => ({ ...prev, foto_url: url }));
        setPictureModalOpen(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        if (usernameStatus === 'taken') return;
        
        await updateUser(formData);
        navigate(`/profile/${currentUser.id}`);
    };

    const handleConfirmDelete = async (pin: string) => {
        const success = await deleteUserAccount(pin);
        if (success) {
            setDeleteModalOpen(false);
            navigate('/welcome', { replace: true });
        } else {
            alert("PIN incorrecto. No se pudo eliminar la cuenta.");
        }
    };

    if (!currentUser) {
        return <div>Cargando...</div>;
    }

    const isSubmitDisabled = usernameStatus === 'taken' || usernameStatus === 'checking';

    return (
        <>
            <DeleteAccountModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />
            <ProfilePictureModal 
                isOpen={isPictureModalOpen}
                onClose={() => setPictureModalOpen(false)}
                onSelect={handlePictureSelect}
                user={currentUser}
            />
            <div className="bg-graphite text-white">
                <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2">
                        <ArrowLeft />
                    </button>
                    <h1 className="text-xl font-bold">Editar Perfil</h1>
                </header>

                <main className="p-4">
                    <form onSubmit={handleSubmit} id="edit-profile-form" className="space-y-6">
                        <div className="text-center">
                            <button type="button" onClick={() => setPictureModalOpen(true)} className="relative group">
                                <UserProfilePicture user={formData} className="w-24 h-24 mx-auto border-4 border-graphite-light"/>
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold">Cambiar</span>
                                </div>
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                            <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleInputChange} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Usuario</label>
                            <input type="text" name="username_unico" minLength={3} value={formData.username_unico || ''} onChange={handleInputChange} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white"/>
                             <div className="h-4 mt-1">
                                {usernameStatus === 'checking' && <p className="text-xs text-gray-400">Verificando...</p>}
                                {usernameStatus === 'available' && <p className="text-xs text-green-400">¡Disponible!</p>}
                                {usernameStatus === 'taken' && <p className="text-xs text-red-400">Este nombre de usuario ya está en uso.</p>}
                                {usernameStatus === 'idle' && formData.username_unico && formData.username_unico.length < 3 && <p className="text-xs text-yellow-400">Mínimo 3 caracteres.</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                            <textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} maxLength={150} rows={3} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-2 px-4 text-white" placeholder="Una corta descripción sobre ti..."></textarea>
                            <p className="text-right text-xs text-gray-500 mt-1">{(formData.bio || '').length} / 150</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Peso (kg)</label>
                                <input type="number" name="peso" value={formData.peso || ''} onChange={handleInputChange} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Altura (cm)</label>
                                <input type="number" name="altura" value={formData.altura || ''} onChange={handleInputChange} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white"/>
                            </div>
                        </div>

                         <div>
                            <h3 className="text-lg font-bold text-white mb-2">Redes Sociales</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Instagram</label>
                                    <input type="text" name="instagram" value={formData.socials?.instagram || ''} onChange={handleSocialsChange} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-2 px-4 text-white" placeholder="Tu usuario de Instagram"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Facebook</label>
                                    <input type="text" name="facebook" value={formData.socials?.facebook || ''} onChange={handleSocialsChange} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-2 px-4 text-white" placeholder="URL de tu perfil de Facebook"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">X (Twitter)</label>
                                    <input type="text" name="x" value={formData.socials?.x || ''} onChange={handleSocialsChange} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-2 px-4 text-white" placeholder="Tu usuario de X"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">TikTok</label>
                                    <input type="text" name="tiktok" value={formData.socials?.tiktok || ''} onChange={handleSocialsChange} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-2 px-4 text-white" placeholder="Tu usuario de TikTok"/>
                                </div>
                            </div>
                        </div>
                    </form>
                    
                    <div className="mt-6">
                        <button type="submit" form="edit-profile-form" disabled={isSubmitDisabled} className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg flex items-center justify-center transition hover:bg-lime-500 disabled:bg-graphite-lighter disabled:text-gray-500 disabled:cursor-not-allowed">
                            <Check size={20} className="mr-2"/> Guardar Cambios
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-graphite-lighter">
                        <h2 className="text-lg font-bold text-red-400">Zona de Peligro</h2>
                        <p className="text-sm text-gray-400 mt-1 mb-3">Esta acción es permanente y no se puede deshacer. Perderás todo tu progreso y datos.</p>
                        <button
                            type="button"
                            onClick={() => setDeleteModalOpen(true)}
                            className="w-full bg-red-500/20 text-red-400 font-bold py-3 rounded-lg flex items-center justify-center transition hover:bg-red-500/30"
                        >
                            Eliminar mi cuenta
                        </button>
                    </div>
                </main>
            </div>
        </>
    );
};

export default EditProfile;
