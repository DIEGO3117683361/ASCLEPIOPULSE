import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { User } from '../types';
import UserProfilePicture from './UserProfilePicture';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  userIds: number[];
}

const FollowListModal: React.FC<FollowListModalProps> = ({ isOpen, onClose, title, userIds }) => {
  const { users, currentUser, followUser, unfollowUser } = useUser();

  if (!isOpen) return null;

  const userList = users.filter(u => userIds.includes(u.id));

  const FollowButton: React.FC<{ user: User }> = ({ user }) => {
    if (user.id === currentUser?.id) return null;

    const isFollowing = currentUser?.following?.includes(user.id);

    const handleFollow = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      followUser(user.id);
    };

    const handleUnfollow = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      unfollowUser(user.id);
    };

    if (isFollowing) {
      return (
        <button onClick={handleUnfollow} className="bg-graphite-lighter text-gray-300 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-red-500/20 hover:text-red-400 transition">
          Siguiendo
        </button>
      );
    }
    return (
      <button onClick={handleFollow} className="bg-accent-lime text-graphite text-xs font-bold px-3 py-1.5 rounded-md hover:bg-lime-500 transition">
        Seguir
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-graphite-light rounded-lg p-4 w-full max-w-sm border border-graphite-lighter shadow-xl flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '70vh' }}
      >
        <div className="flex justify-between items-center mb-4 px-2 flex-shrink-0">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-graphite-lighter"><X size={20}/></button>
        </div>
        <div className="overflow-y-auto space-y-2 pr-1">
          {userList.length > 0 ? userList.map(u => (
            <Link to={`/profile/${u.id}`} onClick={onClose} key={u.id} className="flex items-center p-2 rounded-md hover:bg-graphite-lighter transition">
              <UserProfilePicture user={u} className="w-10 h-10 mr-3"/>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{u.nombre}</p>
                <p className="text-xs text-gray-400 truncate">@{u.username_unico}</p>
              </div>
              <FollowButton user={u} />
            </Link>
          )) : <p className="text-center text-gray-400 text-sm py-4">No hay usuarios para mostrar.</p>}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;