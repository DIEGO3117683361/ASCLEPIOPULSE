import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { useUser } from '../context/UserContext';
import UserProfilePicture from './UserProfilePicture';

interface ShareRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (routineId: number) => void;
}

const ShareRoutineModal: React.FC<ShareRoutineModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { currentUser, users, routines } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  const shareableRoutines = useMemo(() => {
    if (!currentUser) return [];
    const created = routines.filter(r => r.user_id === currentUser.id);
    const followed = routines.filter(r => currentUser.followed_routine_ids?.includes(r.id));
    const all = [...created, ...followed];
    // Remove duplicates
    return all.filter((routine, index, self) =>
      index === self.findIndex((r) => r.id === routine.id)
    );
  }, [currentUser, routines]);

  const filteredRoutines = useMemo(() => {
    return shareableRoutines.filter(r => 
      r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shareableRoutines, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-graphite-light rounded-lg p-4 w-full max-w-sm border border-graphite-lighter shadow-xl flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '70vh' }}
      >
        <div className="flex justify-between items-center mb-4 px-2 flex-shrink-0">
          <h3 className="text-xl font-bold text-white">Compartir Rutina</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-graphite-lighter"><X size={20}/></button>
        </div>
        <div className="relative mb-3 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar rutina..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-graphite border border-graphite-lighter rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-lime"
          />
        </div>
        <div className="overflow-y-auto space-y-2 pr-1">
          {filteredRoutines.length > 0 ? filteredRoutines.map(routine => {
            const creator = users.find(u => u.id === routine.user_id);
            return (
              <button 
                key={routine.id} 
                onClick={() => { onSelect(routine.id); onClose(); }} 
                className="w-full flex items-start text-left p-2 rounded-md hover:bg-graphite-lighter transition"
              >
                <UserProfilePicture user={creator} className="w-10 h-10 mr-3 flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{routine.nombre}</p>
                  <p className="text-xs text-gray-400 truncate">de @{creator?.username_unico}</p>
                </div>
              </button>
            )
          }) : (
            <p className="text-center text-gray-400 text-sm py-4">No se encontraron rutinas.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareRoutineModal;