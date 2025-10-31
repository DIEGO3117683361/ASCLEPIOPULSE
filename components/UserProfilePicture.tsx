import React from 'react';
import { User as UserIcon, Users as GroupIcon } from 'lucide-react';
import { User, GroupChatRoom } from '../types';
import { getLevelForScore } from '../utils/levels';

interface UserProfilePictureProps {
  user?: Partial<User> | undefined | null;
  group?: Partial<GroupChatRoom> | undefined | null;
  className?: string;
}

const UserProfilePicture: React.FC<UserProfilePictureProps> = ({ user, group, className = '' }) => {
  const defaultClasses = 'rounded-full object-cover';

  if (group) {
    const groupDefaultClasses = 'rounded-full flex items-center justify-center';
    const bgColor = group.color || '#3e3e3e'; // Default to graphite-lighter

    return (
        <div style={{ backgroundColor: bgColor }} className={`${groupDefaultClasses} ${className}`}>
            <GroupIcon className="text-gray-200 w-3/5 h-3/5" />
        </div>
    );
  }

  if (!user) {
    return (
      <div className={`${defaultClasses} flex items-center justify-center bg-graphite-light ${className}`}>
        <UserIcon className="text-gray-400 w-3/5 h-3/5" />
      </div>
    );
  }

  if (user.foto_url === 'BADGE') {
    const level = getLevelForScore(user.asclepio_score ?? 0);
    const LevelIcon = level.icon;
    return (
      <div className={`${defaultClasses} flex items-center justify-center bg-gradient-to-br ${level.color} ${className}`}>
        <LevelIcon className="text-white w-3/5 h-3/5" />
      </div>
    );
  }

  if (user.foto_url && (user.foto_url.startsWith('http') || user.foto_url.startsWith('data:'))) {
    return <img src={user.foto_url} alt={user.nombre || 'User'} className={`${defaultClasses} ${className}`} />;
  }

  // Default placeholder if foto_url is missing or invalid
  return (
    <div className={`${defaultClasses} flex items-center justify-center bg-graphite-light ${className}`}>
      <UserIcon className="text-gray-400 w-3/5 h-3/5" />
    </div>
  );
};

export default UserProfilePicture;