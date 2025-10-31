import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { User } from '../types';
import { AVATAR_OPTIONS } from '../data/avatars';
import ProfilePictureModal from '../components/ProfilePictureModal';
import UserProfilePicture from '../components/UserProfilePicture';

const CreateProfile: React.FC = () => {
    const navigate = useNavigate();
    const { createUser, users } = useUser();
    const [formData, setFormData] = useState({
        nombre: '',
        username_unico: '',
        telefono: '',
        pin: '',
    });
    const [fotoUrl, setFotoUrl] = useState(AVATAR_OPTIONS[0]);
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [error, setError] = useState('');
    const [isPictureModalOpen, setPictureModalOpen] = useState(false);

    useEffect(() => {
        if (!formData.username_unico || formData.username_unico.length < 3) {
            setUsernameStatus('idle');
            return;
        }
        setUsernameStatus('checking');
        const handler = setTimeout(() => {
            const isTaken = users.some(u => u.username_unico.toLowerCase() === formData.username_unico.toLowerCase());
            setUsernameStatus(isTaken ? 'taken' : 'available');
        }, 500);

        return () => clearTimeout(handler);
    }, [formData.username_unico, users]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.trim() }));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.nombre || !formData.username_unico || !formData.telefono || !formData.pin) {
            setError("Todos los campos son obligatorios.");
            return;
        }
        if (usernameStatus !== 'available') {
            setError("El nombre de usuario no está disponible o es inválido.");
            return;
        }

        const newUser: Omit<User, 'id'> = {
            ...formData,
            edad: 0,
            peso: 0,
            altura: 0,
            veces_semana: 0,
            suplementos: { creatina: false, proteina: false, otros: [] },
            foto_url: fotoUrl,
            perfil_publico: true,
            current_streak: 0,
            asclepio_score: 0,
            followed_routine_ids: [],
            active_routine_ids: [],
            achievements: {},
            bio: '',
            socials: {},
            followers: [],
            following: [],
        };
        
        const createdUser = await createUser(newUser);

        if (createdUser) {
            navigate('/');
        } else {
            setError("No se pudo crear el perfil. Inténtalo de nuevo.");
        }
    };

    const isSubmitDisabled = usernameStatus === 'taken' || usernameStatus === 'checking' || formData.username_unico.length < 3;

    const tempUserForDisplay = {
        foto_url: fotoUrl,
        asclepio_score: 0,
        nombre: formData.nombre
    };

    return (
        <>
        <ProfilePictureModal
            isOpen={isPictureModalOpen}
            onClose={() => setPictureModalOpen(false)}
            onSelect={setFotoUrl}
            user={{ asclepio_score: 0 }}
        />
        <div className="bg-graphite text-white">
             <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                <Link to="/welcome" className="p-2 -ml-2 mr-2">
                    <ArrowLeft />
                </Link>
                <h1 className="text-xl font-bold">Crear Perfil</h1>
            </header>
            
            <main className="p-4">
                 <div className="text-center mb-6">
                     <UserPlus size={48} className="mx-auto text-accent-lime"/>
                     <h2 className="text-2xl font-bold mt-4">Únete a la comunidad</h2>
                     <p className="text-gray-400">Completa tus datos para empezar.</p>
                </div>
                
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Elige tu foto de perfil</label>
                        <button type="button" onClick={() => setPictureModalOpen(true)} className="relative group">
                            <UserProfilePicture user={tempUserForDisplay} className="w-24 h-24" />
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold">Cambiar</span>
                            </div>
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Usuario único</label>
                        <input type="text" name="username_unico" value={formData.username_unico} onChange={handleChange} required minLength={3} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime" />
                        <div className="h-4 mt-1">
                            {usernameStatus === 'checking' && <p className="text-xs text-gray-400">Verificando...</p>}
                            {usernameStatus === 'available' && <p className="text-xs text-green-400">¡Disponible!</p>}
                            {usernameStatus === 'taken' && <p className="text-xs text-red-400">Este nombre de usuario ya está en uso.</p>}
                            {usernameStatus === 'idle' && formData.username_unico.length > 0 && formData.username_unico.length < 3 && <p className="text-xs text-yellow-400">Mínimo 3 caracteres.</p>}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
                        <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">PIN (4 dígitos)</label>
                        <input type="password" name="pin" value={formData.pin} onChange={handleChange} maxLength={4} required className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime" />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button onClick={handleCreate} type="submit" disabled={isSubmitDisabled} className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg flex items-center justify-center transition hover:bg-lime-500 disabled:bg-graphite-lighter disabled:text-gray-500 disabled:cursor-not-allowed mt-6">
                        Crear y Entrar
                    </button>
                </form>
            </main>
        </div>
        </>
    );
};

export default CreateProfile;