import React, { useState, useMemo, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { User, Announcement } from '../types';
import { LogOut, Users, Megaphone, Search, X, Trash2, Edit, CheckCircle, XCircle, ToggleLeft, ToggleRight, Plus, MessageSquare, Palette, Save, ShieldCheck, Flame, Send } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import UserProfilePicture from '../components/UserProfilePicture';
import { getLevelForScore } from '../utils/levels';
import LevelBadge from '../components/LevelBadge';
import { AVATAR_OPTIONS } from '../data/avatars';
import { STICKERS } from '../data/stickers';

// Edit User Modal Component
const EditUserModal: React.FC<{ user: User; onClose: () => void; }> = ({ user, onClose }) => {
    const { adminUpdateUserStats } = useUser();
    const [score, setScore] = useState(user.asclepio_score);
    const [streak, setStreak] = useState(user.current_streak);

    const handleSave = () => {
        adminUpdateUserStats(user.id, { asclepio_score: score, current_streak: streak });
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
             <div className="bg-graphite-light rounded-lg p-6 w-full max-w-sm border border-graphite-lighter" onClick={e => e.stopPropagation()}>
                <div className="flex items-center mb-4">
                    <UserProfilePicture user={user} className="w-12 h-12 mr-3"/>
                    <div>
                        <h3 className="font-bold text-lg text-white">Editar a {user.nombre}</h3>
                        <LevelBadge level={getLevelForScore(user.asclepio_score)} />
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-400 flex items-center mb-1"><ShieldCheck size={14} className="mr-1.5"/> Asclepio Score</label>
                        <input type="number" value={score} onChange={e => setScore(Number(e.target.value))} className="w-full bg-graphite border border-graphite-lighter rounded p-2 text-white"/>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-400 flex items-center mb-1"><Flame size={14} className="mr-1.5"/> Racha Actual</label>
                        <input type="number" value={streak} onChange={e => setStreak(Number(e.target.value))} className="w-full bg-graphite border border-graphite-lighter rounded p-2 text-white"/>
                    </div>
                </div>
                <div className="flex gap-2 mt-6">
                    <button onClick={onClose} className="flex-1 bg-graphite-lighter py-2.5 rounded font-semibold">Cancelar</button>
                    <button onClick={handleSave} className="flex-1 bg-accent-lime text-graphite py-2.5 rounded font-bold flex items-center justify-center"><Save size={16} className="mr-2"/>Guardar</button>
                 </div>
             </div>
        </div>
    );
};


// User Management Component
const UserManagement: React.FC = () => {
    const { users, suspendUser, unsuspendUser, adminDeleteUser } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [action, setAction] = useState<'suspend' | 'delete' | 'edit' | null>(null);
    const [suspensionReason, setSuspensionReason] = useState('');

    const filteredUsers = useMemo(() =>
        users.filter(u => u.id !== 0).filter(u =>
            u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username_unico.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);

    const handleAction = (user: User, act: 'suspend' | 'delete' | 'edit') => {
        setSelectedUser(user);
        setAction(act);
        if (act === 'suspend') setSuspensionReason('');
    };

    const handleConfirm = () => {
        if (!selectedUser || !action) return;
        if (action === 'suspend') {
            if (suspensionReason.trim()) {
                suspendUser(selectedUser.id, suspensionReason);
            }
        } else if (action === 'delete') {
            adminDeleteUser(selectedUser.id);
        }
        closeModal();
    };

    const closeModal = () => {
        setSelectedUser(null);
        setAction(null);
        setSuspensionReason('');
    };

    return (
        <div className="space-y-4">
            {action === 'suspend' && selectedUser && (
                 <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                     <div className="bg-graphite-light rounded-lg p-6 w-full max-w-sm border border-graphite-lighter" onClick={e => e.stopPropagation()}>
                         <h3 className="font-bold text-lg mb-2">Suspender a {selectedUser.nombre}</h3>
                         <p className="text-sm text-gray-400 mb-4">Ingresa la razón de la suspensión. Esto será visible para el usuario.</p>
                         <textarea value={suspensionReason} onChange={e => setSuspensionReason(e.target.value)} rows={3} className="w-full bg-graphite border border-graphite-lighter rounded p-2 text-white" />
                         <div className="flex gap-2 mt-4">
                            <button onClick={closeModal} className="flex-1 bg-graphite-lighter py-2 rounded">Cancelar</button>
                            <button onClick={handleConfirm} className="flex-1 bg-red-600 py-2 rounded" disabled={!suspensionReason.trim()}>Suspender</button>
                         </div>
                     </div>
                 </div>
            )}
             <ConfirmationModal 
                isOpen={action === 'delete' && selectedUser !== null}
                onClose={closeModal}
                onConfirm={handleConfirm}
                title={`Eliminar a ${selectedUser?.nombre}`}
                message="Esta acción es permanente y no se puede deshacer. Todos los datos del usuario serán eliminados."
                confirmText="Sí, eliminar usuario"
            />
            {action === 'edit' && selectedUser && <EditUserModal user={selectedUser} onClose={closeModal} />}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input type="text" placeholder="Buscar usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 pl-10 pr-4 text-white" />
            </div>
            <div className="space-y-2">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-graphite-light p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                            <UserProfilePicture user={user} className="w-10 h-10 mr-3"/>
                            <div className="truncate">
                                <p className="font-bold text-white truncate">{user.nombre}</p>
                                <p className="text-xs text-gray-400 truncate">@{user.username_unico}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                            <button onClick={() => handleAction(user, 'edit')} className="bg-sky-500/20 text-sky-400 text-xs font-bold px-2 sm:px-3 py-1.5 rounded-md flex items-center"><Edit size={14} className="mr-0 sm:mr-1"/> <span className="hidden sm:inline">Editar</span></button>
                            {user.isSuspended ? (
                                <button onClick={() => unsuspendUser(user.id)} className="bg-green-500/20 text-green-400 text-xs font-bold px-2 sm:px-3 py-1.5 rounded-md flex items-center"><CheckCircle size={14} className="mr-0 sm:mr-1"/> <span className="hidden sm:inline">Reactivar</span></button>
                            ) : (
                                <button onClick={() => handleAction(user, 'suspend')} className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 sm:px-3 py-1.5 rounded-md flex items-center"><XCircle size={14} className="mr-0 sm:mr-1"/> <span className="hidden sm:inline">Suspender</span></button>
                            )}
                             <button onClick={() => handleAction(user, 'delete')} className="bg-red-500/20 text-red-400 text-xs font-bold px-2 sm:px-3 py-1.5 rounded-md flex items-center"><Trash2 size={14} className="mr-0 sm:mr-1"/> <span className="hidden sm:inline">Eliminar</span></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Announcement Management Component
const AnnouncementManagement: React.FC = () => {
    const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useUser();
    const [formData, setFormData] = useState({ title: '', content: '', link: '', linkText: '' });
    const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addAnnouncement({ ...formData, isActive: true });
        setFormData({ title: '', content: '', link: '', linkText: '' });
    };

    const handleToggleActive = (ann: Announcement) => {
        updateAnnouncement(ann.id, { isActive: !ann.isActive });
    };

    return (
        <div className="space-y-6">
             <ConfirmationModal
                isOpen={announcementToDelete !== null}
                onClose={() => setAnnouncementToDelete(null)}
                onConfirm={() => {
                    if(announcementToDelete) deleteAnnouncement(announcementToDelete);
                    setAnnouncementToDelete(null);
                }}
                title="Eliminar Anuncio"
                message="¿Estás seguro que quieres eliminar este anuncio permanentemente?"
                confirmText="Eliminar"
            />
            <form onSubmit={handleSubmit} className="bg-graphite-light p-4 rounded-lg space-y-3">
                <h3 className="font-bold text-lg">Crear Anuncio</h3>
                <input type="text" placeholder="Título" value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} required className="w-full bg-graphite border p-2 rounded"/>
                <input type="text" placeholder="URL de la Imagen" value={formData.content} onChange={e => setFormData(p => ({...p, content: e.target.value}))} required className="w-full bg-graphite border p-2 rounded"/>
                <input type="text" placeholder="URL del Enlace (opcional)" value={formData.link} onChange={e => setFormData(p => ({...p, link: e.target.value}))} className="w-full bg-graphite border p-2 rounded"/>
                <input type="text" placeholder="Texto del Botón (opcional)" value={formData.linkText} onChange={e => setFormData(p => ({...p, linkText: e.target.value}))} className="w-full bg-graphite border p-2 rounded"/>
                <button type="submit" className="w-full bg-accent-lime text-graphite font-bold py-3 rounded-lg flex items-center justify-center"><Plus size={18} className="mr-1"/> Añadir Anuncio</button>
            </form>

            <div className="space-y-2">
                <h3 className="font-bold text-lg">Anuncios Existentes</h3>
                {announcements.map(ann => (
                    <div key={ann.id} className={`bg-graphite-light p-3 rounded-lg border-l-4 ${ann.isActive ? 'border-accent-lime' : 'border-gray-600'}`}>
                        <div className="flex justify-between items-start">
                           <div>
                             <p className="font-bold text-white">{ann.title}</p>
                             <p className="text-xs text-gray-400">{ann.link}</p>
                           </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleToggleActive(ann)} title={ann.isActive ? "Desactivar" : "Activar"}>
                                    {ann.isActive ? <ToggleRight size={24} className="text-accent-lime"/> : <ToggleLeft size={24} className="text-gray-500"/>}
                                </button>
                                <button onClick={() => setAnnouncementToDelete(ann.id)} className="text-red-400 p-1"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Admin Messaging Component
const AdminMessaging: React.FC = () => {
    const { users, sendSupportMessage } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const availableUsers = useMemo(() => users.filter(u => u.id !== 0 && u.id !== -1), [users]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return [];
        return availableUsers
            .filter(u => !selectedIds.includes(u.id))
            .filter(u => u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || u.username_unico.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 5);
    }, [searchTerm, availableUsers, selectedIds]);

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSend = async () => {
        if (selectedIds.length === 0 || !message.trim()) {
            alert("Selecciona al menos un destinatario y escribe un mensaje.");
            return;
        }
        setIsSending(true);
        await sendSupportMessage(selectedIds, message);
        setIsSending(false);
        setMessage('');
        setSelectedIds([]);
        alert("Mensaje enviado con éxito.");
    };

    return (
        <div className="space-y-4">
            <div className="bg-graphite-light p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">1. Seleccionar Destinatarios</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input type="text" placeholder="Buscar usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-graphite border rounded py-2 pl-10 pr-4"/>
                </div>
                {searchTerm && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                        {filteredUsers.map(user => (
                            <button key={user.id} onClick={() => toggleSelection(user.id)} className="w-full flex items-center p-2 rounded hover:bg-graphite-lighter">
                                <UserProfilePicture user={user} className="w-8 h-8 mr-2"/>
                                <span>{user.nombre}</span>
                            </button>
                        ))}
                    </div>
                )}
                {selectedIds.length > 0 && (
                    <div className="mt-3">
                        <h4 className="text-sm font-semibold text-gray-400">Seleccionados:</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {users.filter(u => selectedIds.includes(u.id)).map(u => (
                                <div key={u.id} className="bg-graphite p-1 pr-2 rounded-full flex items-center text-sm">
                                    <UserProfilePicture user={u} className="w-5 h-5 mr-1.5"/>
                                    {u.nombre}
                                    <button onClick={() => toggleSelection(u.id)} className="ml-2 text-gray-500 hover:text-white"><X size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
             <div className="bg-graphite-light p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">2. Escribir Mensaje</h3>
                <p className="text-xs text-gray-400 mb-2">Este mensaje se enviará de parte de "Soporte Técnico".</p>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="w-full bg-graphite border rounded p-2"/>
            </div>
            <button onClick={handleSend} disabled={isSending || selectedIds.length === 0 || !message.trim()} className="w-full bg-accent-lime text-graphite font-bold py-3 rounded-lg flex items-center justify-center disabled:bg-graphite-lighter disabled:text-gray-500">
                {isSending ? 'Enviando...' : <><Send size={16} className="mr-2"/> Enviar Mensaje a {selectedIds.length} Usuario(s)</>}
            </button>
        </div>
    );
};

// Customization Management Component
const CustomizationManagement: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold mb-2">Gestión de Avatares</h2>
                <div className="bg-graphite-light p-4 rounded-lg">
                    <div className="bg-sky-500/10 border border-sky-500/30 text-sky-300 text-sm p-3 rounded-md mb-4">
                        <p className="font-bold">Nota para Desarrolladores:</p>
                        <p>Para agregar o eliminar avatares, edita el array <code className="bg-graphite px-1 rounded">AVATAR_OPTIONS</code> en el archivo <code className="bg-graphite px-1 rounded">src/data/avatars.ts</code> y vuelve a implementar la aplicación.</p>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {AVATAR_OPTIONS.map(url => (
                            <img key={url} src={url} alt="avatar" className="w-full h-auto rounded-full bg-graphite"/>
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold mb-2">Gestión de Stickers</h2>
                <div className="bg-graphite-light p-4 rounded-lg">
                     <div className="bg-sky-500/10 border border-sky-500/30 text-sky-300 text-sm p-3 rounded-md mb-4">
                        <p className="font-bold">Nota para Desarrolladores:</p>
                        <p>Para agregar o eliminar stickers, edita el array <code className="bg-graphite px-1 rounded">STICKERS</code> en el archivo <code className="bg-graphite px-1 rounded">src/data/stickers.ts</code> y vuelve a implementar la aplicación.</p>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {STICKERS.map(url => (
                            <div key={url} className="bg-graphite p-2 rounded-lg">
                                <img src={url} alt="sticker" className="w-full h-auto"/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// Main Admin Page
const Admin: React.FC = () => {
    const { currentUser, logout } = useUser();
    const [activeTab, setActiveTab] = useState<'users' | 'announcements' | 'messaging' | 'customization'>('users');

    const TABS = [
        { id: 'users', label: 'Usuarios', icon: Users },
        { id: 'announcements', label: 'Anuncios', icon: Megaphone },
        { id: 'messaging', label: 'Mensajería', icon: MessageSquare },
        { id: 'customization', label: 'Personalización', icon: Palette },
    ];

    return (
        <div className="bg-graphite text-white min-h-screen">
            <header className="p-4 flex justify-between items-center bg-graphite-light border-b border-graphite-lighter">
                <div>
                    <h1 className="text-xl font-bold">Panel de Admin</h1>
                    <p className="text-xs text-accent-lime">Hola, {currentUser?.nombre}</p>
                </div>
                <button onClick={logout} className="bg-graphite-lighter px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-red-500/20 hover:text-red-400 transition">
                    <LogOut size={16} /> Salir
                </button>
            </header>

            <nav className="flex border-b border-graphite-lighter overflow-x-auto">
                {TABS.map(tab => (
                     <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`flex-1 py-3 px-2 font-bold flex items-center justify-center gap-2 min-w-max ${activeTab === tab.id ? 'text-accent-lime border-b-2 border-accent-lime' : 'text-gray-400'}`}
                    >
                        <tab.icon size={18}/> {tab.label}
                    </button>
                ))}
            </nav>

            <main className="p-4">
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'announcements' && <AnnouncementManagement />}
                {activeTab === 'messaging' && <AdminMessaging />}
                {activeTab === 'customization' && <CustomizationManagement />}
            </main>
        </div>
    );
};

export default Admin;