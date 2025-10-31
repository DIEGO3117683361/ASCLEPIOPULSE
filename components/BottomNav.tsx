import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, User, Swords, MessageSquare } from 'lucide-react';
import { useUser } from '../context/UserContext';

const BottomNav: React.FC = () => {
    const { currentUser, totalUnreadCount } = useUser();

    const navItems = [
        { path: '/', icon: Home, label: 'Inicio' },
        { path: '/explore', icon: Compass, label: 'Explorar' },
        { path: '/messages', icon: MessageSquare, label: 'Mensajes', badge: totalUnreadCount > 0 },
        { path: '/vs', icon: Swords, label: 'VS' },
        { path: `/profile/${currentUser?.id || 1}`, icon: User, label: 'Perfil' },
    ];

    const activeLinkClass = "text-accent-lime";
    const inactiveLinkClass = "text-gray-400 hover:text-white";

    return (
        <nav className="bg-graphite-light border-t border-graphite-lighter p-2 w-full flex-shrink-0">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex flex-col items-center justify-center w-1/5 transition-colors duration-200 relative ${isActive ? activeLinkClass : inactiveLinkClass}`
                        }
                    >
                        {item.badge && (
                           <span className="absolute top-0 right-1/2 translate-x-4 w-2 h-2 bg-accent-orange rounded-full"></span>
                        )}
                        <item.icon size={24} strokeWidth={2.5}/>
                        <span className="text-xs mt-1 font-semibold">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;