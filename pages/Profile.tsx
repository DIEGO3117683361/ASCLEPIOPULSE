import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, ShieldCheck, Flame, User as UserIcon, Dumbbell, Compass, Users, CheckCircle, Circle, Trash2, Instagram, Facebook, Twitter } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Routine, User } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import AchievementsModal from '../components/AchievementsModal';
import LevelBadge from '../components/LevelBadge';
import { getLevelForScore } from '../utils/levels';
import LevelsModal from '../components/LevelsModal';
import UserProfilePicture from '../components/UserProfilePicture';
import FollowListModal from '../components/FollowListModal';

const TikTokIcon: React.FC<{size?: number}> = ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8.5a4 4 0 0 1-8 0V3H6v12a5 5 0 0 0 5 5h1a5 5 0 0 0 5-5V3h-2v5.5Z"/>
        <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
    </svg>
);


const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { users, currentUser, routines, logout, followRoutine, unfollowRoutine, toggleActiveRoutine, deleteRoutine, followUser, unfollowUser } = useUser();
    
    const [routineToDelete, setRoutineToDelete] = useState<number | null>(null);
    const [isAchievementsModalOpen, setAchievementsModalOpen] = useState(false);
    const [isLevelsModalOpen, setLevelsModalOpen] = useState(false);
    const [isFollowModalOpen, setFollowModalOpen] = useState(false);
    const [followModalData, setFollowModalData] = useState<{ title: string; userIds: number[] } | null>(null);

    const userId = parseInt(id || '');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return <div className="p-4 text-center">Usuario no encontrado.</div>;
    }

    const isCurrentUserProfile = currentUser?.id === user.id;
    const userRoutines = routines.filter(r => r.user_id === user.id);
    const followedRoutines = routines.filter(r => currentUser?.followed_routine_ids?.includes(r.id) && r.user_id !== currentUser.id);

    const handleLogout = () => {
        logout();
        navigate('/welcome');
    };

    const handleDeleteClick = (routineId: number) => {
        setRoutineToDelete(routineId);
    };

    const confirmDeleteRoutine = () => {
        if (routineToDelete !== null) {
            deleteRoutine(routineToDelete);
            setRoutineToDelete(null);
        }
    };
    
    const handleFollowModal = (type: 'followers' | 'following') => {
        if (type === 'followers') {
            setFollowModalData({ title: 'Seguidores', userIds: user.followers || [] });
        } else {
            setFollowModalData({ title: 'Siguiendo', userIds: user.following || [] });
        }
        setFollowModalOpen(true);
    };

    const hasSocials = user.socials && Object.values(user.socials).some(val => val);

    return (
        <>
            <ConfirmationModal
                isOpen={routineToDelete !== null}
                onClose={() => setRoutineToDelete(null)}
                onConfirm={confirmDeleteRoutine}
                title="Eliminar Rutina"
                message="¿Estás seguro de que quieres eliminar esta rutina? Esta acción es permanente y no se puede deshacer."
                confirmText="Eliminar"
            />
            <AchievementsModal
                isOpen={isAchievementsModalOpen}
                onClose={() => setAchievementsModalOpen(false)}
                user={user}
            />
            <LevelsModal
                isOpen={isLevelsModalOpen}
                onClose={() => setLevelsModalOpen(false)}
                userScore={user.asclepio_score}
            />
            <FollowListModal
                isOpen={isFollowModalOpen}
                onClose={() => setFollowModalOpen(false)}
                title={followModalData?.title || ''}
                userIds={followModalData?.userIds || []}
            />
            <div className="p-4 space-y-6">
                <header className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <UserProfilePicture user={user} className="w-20 h-20 border-4 border-graphite-light" />
                        <div>
                            <h1 className="text-2xl font-bold text-white">{user.nombre}</h1>
                            <p className="text-gray-400">@{user.username_unico}</p>
                            <div className="mt-2">
                                <button onClick={() => setLevelsModalOpen(true)} className="transition-transform hover:scale-105">
                                    <LevelBadge level={getLevelForScore(user.asclepio_score)} />
                                </button>
                            </div>
                        </div>
                    </div>
                    {isCurrentUserProfile && (
                         <div className="flex space-x-2">
                            <Link to="/profile/edit" className="p-2 bg-graphite-light rounded-full text-gray-300 hover:text-white">
                                <Settings size={20} />
                            </Link>
                            <button onClick={handleLogout} className="p-2 bg-graphite-light rounded-full text-gray-300 hover:text-red-400">
                               <LogOut size={20} />
                            </button>
                        </div>
                    )}
                </header>
                
                {(user.bio || hasSocials) && (
                    <div>
                        {user.bio && <p className="text-gray-300 text-sm">{user.bio}</p>}
                        {hasSocials && (
                            <div className="flex items-center space-x-4 mt-3">
                                {user.socials?.instagram && (
                                    <a href={`https://instagram.com/${user.socials.instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                        <Instagram size={22} />
                                    </a>
                                )}
                                {user.socials?.facebook && (
                                    <a href={user.socials.facebook.startsWith('http') ? user.socials.facebook : `https://${user.socials.facebook}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                        <Facebook size={22} />
                                    </a>
                                )}
                                {user.socials?.x && (
                                    <a href={`https://x.com/${user.socials.x}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                        <Twitter size={22} />
                                    </a>
                                )}
                                {user.socials?.tiktok && (
                                    <a href={`https://tiktok.com/@${user.socials.tiktok}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                        <TikTokIcon size={22} />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                <div className="flex items-center justify-center space-x-8 py-2 bg-graphite-light rounded-lg">
                    <button onClick={() => handleFollowModal('followers')} className="text-center hover:bg-graphite-lighter p-2 rounded-md">
                        <p className="text-lg font-bold text-white">{(user.followers || []).length}</p>
                        <p className="text-sm text-gray-400">Seguidores</p>
                    </button>
                    <button onClick={() => handleFollowModal('following')} className="text-center hover:bg-graphite-lighter p-2 rounded-md">
                        <p className="text-lg font-bold text-white">{(user.following || []).length}</p>
                        <p className="text-sm text-gray-400">Siguiendo</p>
                    </button>
                </div>
                
                {!isCurrentUserProfile && currentUser && (
                    <div className="mt-4">
                        {currentUser.following?.includes(user.id) ? (
                            <button
                                onClick={() => unfollowUser(user.id)}
                                className="w-full bg-graphite-lighter text-gray-300 font-bold py-3 rounded-lg transition hover:bg-red-500/20 hover:text-red-400"
                            >
                                Siguiendo
                            </button>
                        ) : (
                            <button
                                onClick={() => followUser(user.id)}
                                className="w-full bg-accent-lime text-graphite font-bold py-3 rounded-lg transition hover:bg-lime-500"
                            >
                                Seguir
                            </button>
                        )}
                    </div>
                )}


                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setAchievementsModalOpen(true)} className="bg-graphite-light p-4 rounded-lg flex items-center space-x-3 text-left">
                        <ShieldCheck className="text-accent-lime" size={32} />
                        <div>
                            <p className="text-xs text-gray-400">Asclepio Score</p>
                            <p className="text-xl font-bold text-white">{user.asclepio_score}</p>
                        </div>
                    </button>
                    <div className="bg-graphite-light p-4 rounded-lg flex items-center space-x-3">
                        <Flame className="text-accent-orange" size={32} />
                        <div>
                            <p className="text-xs text-gray-400">Racha Actual</p>
                            <p className="text-xl font-bold text-white">{user.current_streak} días</p>
                        </div>
                    </div>
                </div>

                 {isCurrentUserProfile && (
                    <div>
                        <h2 className="font-bold text-white text-lg mb-4">Rutinas Seguidas</h2>
                        {followedRoutines.length > 0 ? (
                            <div className="space-y-3">
                                {followedRoutines.map(r => {
                                    const creator = users.find(u => u.id === r.user_id);
                                    const isActive = currentUser.active_routine_ids?.includes(r.id);
                                    return (
                                    <div key={r.id} className="bg-graphite-light p-4 rounded-lg">
                                        <h3 className="font-bold text-white">{r.nombre}</h3>
                                        {creator && <p className="text-xs text-gray-400">de @{creator.username_unico}</p>}
                                        <div className="border-t border-graphite-lighter mt-3 pt-3 flex items-center space-x-2">
                                            <button onClick={() => toggleActiveRoutine(r.id)} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition flex items-center justify-center ${isActive ? 'bg-accent-lime/20 text-accent-lime' : 'bg-graphite-lighter text-gray-300'}`}>
                                               {isActive ? <CheckCircle size={16} className="mr-1.5"/> : <Circle size={16} className="mr-1.5"/>}
                                               {isActive ? 'Activada' : 'Activar'}
                                            </button>
                                            <Link to={`/routine/${r.id}`} className="flex-[0.75] text-center text-sm font-semibold bg-graphite-lighter text-gray-300 py-2 rounded-md hover:bg-graphite-lighter/80 transition">Ver</Link>
                                            <button onClick={() => unfollowRoutine(r.id)} className="flex-[0.75] text-center text-sm font-semibold bg-red-500/20 text-red-400 py-2 rounded-md hover:bg-red-500/40 transition">Dejar de Seguir</button>
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>
                        ) : (
                             <div className="text-center py-6 bg-graphite-light rounded-lg">
                                <Compass className="mx-auto text-gray-500 mb-2" size={32}/>
                                <p className="text-gray-400 text-sm">No estás siguiendo ninguna rutina de otros.</p>
                                 <Link to="/explore" className="text-sm font-semibold text-accent-lime hover:underline mt-2 inline-block">Explorar rutinas</Link>
                            </div>
                        )}
                    </div>
                )}


                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-white text-lg">{isCurrentUserProfile ? 'Mis Rutinas Creadas' : `Rutinas de ${user.nombre}`}</h2>
                         {isCurrentUserProfile && (
                             <Link to="/routine/create" className="text-sm font-semibold text-accent-lime hover:underline">Crear nueva</Link>
                         )}
                    </div>
                    {userRoutines.length > 0 ? (
                        <div className="space-y-3">
                            {userRoutines.map(r => {
                                const isFollowedByCurrentUser = currentUser?.followed_routine_ids?.includes(r.id);
                                const isActive = currentUser?.active_routine_ids?.includes(r.id);
                                return (
                                   <Link key={r.id} to={`/routine/${r.id}`} className="block bg-graphite-light p-4 rounded-lg hover:bg-graphite-lighter transition-colors">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-white">{r.nombre}</h3>
                                            {isActive && isCurrentUserProfile && <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Activa</span>}
                                        </div>
                                        <p className="text-sm text-gray-400 line-clamp-2">{r.descripcion}</p>
                                        <div className="border-t border-graphite-lighter mt-3 pt-3 flex items-center space-x-2">
                                            {!isCurrentUserProfile && (
                                                !isFollowedByCurrentUser ? (
                                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); followRoutine(r.id); }} className="flex-1 text-center text-sm font-semibold bg-accent-lime/20 text-accent-lime py-2 rounded-md hover:bg-accent-lime/40 transition">Seguir Rutina</button>
                                                ) : (
                                                     <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); unfollowRoutine(r.id); }} className="flex-1 text-center text-sm font-semibold bg-red-500/20 text-red-400 py-2 rounded-md hover:bg-red-500/40 transition">Dejar de Seguir</button>
                                                )
                                            )}
                                            {isCurrentUserProfile && (
                                                <>
                                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleActiveRoutine(r.id);}} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition ${isActive ? 'bg-accent-lime/20 text-accent-lime' : 'bg-graphite-lighter text-gray-300'}`}>
                                                        {isActive ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                    <Link to={`/routine/edit/${r.id}`} onClick={(e) => e.stopPropagation()} className="flex-1 text-center text-sm font-semibold bg-graphite-lighter text-gray-300 py-2 rounded-md hover:bg-graphite-lighter/80 transition">Editar</Link>
                                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteClick(r.id); }} className="flex-1 text-center text-sm font-semibold bg-red-500/20 text-red-400 py-2 rounded-md hover:bg-red-500/40 transition flex items-center justify-center"><Trash2 size={14} className="mr-1.5"/>Eliminar</button>
                                                </>
                                            )}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-graphite-light rounded-lg">
                            <Dumbbell className="mx-auto text-gray-500 mb-2" size={32}/>
                            <p className="text-gray-400 text-sm">{isCurrentUserProfile ? 'Aún no has creado ninguna rutina.' : 'Este usuario no ha creado rutinas.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Profile;
