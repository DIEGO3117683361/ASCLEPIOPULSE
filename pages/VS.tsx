import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Swords, Flame } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Pulse } from '../types';
import UserProfilePicture from '../components/UserProfilePicture';

const PulseCard: React.FC<{ pulse: Pulse }> = ({ pulse }) => {
    const { users } = useUser();
    const participantUsers = pulse.participants.map(p => users.find(u => u.id === p.user_id)).filter(Boolean);

    return (
        <Link to={`/pulse/${pulse.id}`} className="block bg-graphite-light p-4 rounded-lg hover:bg-graphite-lighter transition-colors duration-200">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-white text-lg">{pulse.name}</h3>
                <div className="flex items-center space-x-1 bg-graphite-lighter px-2 py-1 rounded-full">
                    <Flame className="text-accent-orange" size={14} />
                    <span className="font-bold text-white text-sm">{pulse.streak}</span>
                </div>
            </div>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{pulse.description}</p>
            <div className="flex items-center space-x-[-8px] mt-4">
                {participantUsers.slice(0, 5).map(p => p && (
                    <UserProfilePicture key={p.id} user={p} className="w-8 h-8 border-2 border-graphite-light" />
                ))}
                {participantUsers.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-graphite-lighter flex items-center justify-center text-xs font-bold text-gray-300 border-2 border-graphite-light">
                        +{participantUsers.length - 5}
                    </div>
                )}
            </div>
        </Link>
    );
};

const VS: React.FC = () => {
    const { currentUser, pulses } = useUser();
    
    if (!currentUser) return null;

    const userPulses = pulses.filter(p => p.participants?.some(participant => participant.user_id === currentUser.id));

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center"><Swords className="mr-2 text-accent-lime"/> Versus</h1>
                <Link to="/pulse/create" className="bg-accent-lime text-graphite font-bold py-2 px-4 rounded-lg flex items-center text-sm transition hover:bg-lime-500">
                    <Plus size={16} className="mr-1"/> Crear Pulse
                </Link>
            </div>

            {userPulses.length > 0 ? (
                <div className="space-y-4">
                    {userPulses.map(pulse => <PulseCard key={pulse.id} pulse={pulse} />)}
                </div>
            ) : (
                <div className="text-center py-12 bg-graphite-light rounded-lg">
                    <Swords className="mx-auto text-gray-500 mb-2" size={40}/>
                    <h3 className="font-bold text-white">No estás en ninguna competición</h3>
                    <p className="text-gray-400 text-sm mt-1">¡Crea un nuevo "Pulse" y reta a tus amigos!</p>
                </div>
            )}
        </div>
    );
};

export default VS;