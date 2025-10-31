import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Dumbbell, Calendar, CheckCircle, Plus, Compass, Swords, ArrowRight, ExternalLink, MessageSquare, Bell } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Exercise, Routine, RoutineDay, Announcement, ChatRoom, Pulse } from '../types';

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const showNotification = (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) {
        console.error("This browser does not support desktop notification.");
        return;
    }
    if (Notification.permission === "granted") {
        new Notification(title, options);
    }
};

const NotificationPermissionCard: React.FC = () => {
    const [permission, setPermission] = useState(Notification.permission);

    if (permission !== 'default') {
        return null;
    }

    const requestPermission = () => {
        Notification.requestPermission().then(setPermission);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500/20 to-graphite-light p-4 rounded-xl shadow-lg border border-indigo-500/30">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h2 className="text-lg font-bold text-white">¡No te pierdas de nada!</h2>
                    <p className="text-sm text-indigo-400 flex items-center">
                        <Bell size={14} className="mr-1"/> Activa las notificaciones
                    </p>
                </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">Recibe alertas de mensajes, retos y rachas para mantenerte al día.</p>
            <button onClick={requestPermission} className="block w-full text-center bg-indigo-500 text-white font-bold py-3 rounded-lg transition hover:bg-indigo-600 flex items-center justify-center">
               Activar Notificaciones <ArrowRight size={16} className="ml-2"/>
            </button>
        </div>
    );
};

const AnnouncementCard: React.FC<{ announcement: Announcement }> = ({ announcement }) => (
    <div className="bg-graphite-light rounded-xl overflow-hidden shadow-lg border border-graphite-lighter">
        <img src={announcement.content} alt={announcement.title} className="w-full h-32 object-cover" />
        <div className="p-4">
            <h2 className="font-bold text-lg text-white">{announcement.title}</h2>
            {announcement.link && announcement.linkText && (
                <a 
                    href={announcement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center mt-3 w-full bg-accent-lime text-graphite font-bold py-3 rounded-lg transition hover:bg-lime-500 text-sm"
                >
                    {announcement.linkText} <ExternalLink size={16} className="ml-2"/>
                </a>
            )}
        </div>
    </div>
);

const UnreadMessagesCard: React.FC = () => (
    <div className="bg-gradient-to-br from-sky-500/20 to-graphite-light p-4 rounded-xl shadow-lg border border-sky-500/30">
        <div className="flex items-center justify-between mb-3">
            <div>
                <h2 className="text-lg font-bold text-white">¡Nuevos mensajes!</h2>
                <p className="text-sm text-sky-400 flex items-center">
                    <MessageSquare size={14} className="mr-1"/> Tienes conversaciones sin leer
                </p>
            </div>
        </div>
        <p className="text-sm text-gray-300 mb-4">Revisa tu bandeja de entrada para no perderte nada.</p>
        <Link to={`/messages`} className="block w-full text-center bg-sky-500 text-white font-bold py-3 rounded-lg transition hover:bg-sky-600 flex items-center justify-center">
           Ver mis mensajes <ArrowRight size={16} className="ml-2"/>
        </Link>
    </div>
);


const ExerciseCard: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
    <div className="bg-graphite-light p-4 rounded-lg flex items-center justify-between">
        <div>
            <h4 className="font-bold text-white">{exercise.nombre_ejercicio}</h4>
            <p className="text-sm text-gray-400">
                {exercise.objetivo_series} series x {exercise.objetivo_reps} reps @ {exercise.objetivo_peso}kg
            </p>
        </div>
        <Dumbbell className="text-accent-lime" size={24} />
    </div>
);

interface TodayRoutineCardProps {
    routine: Routine;
    todayRoutineDay: RoutineDay;
    isLogInProgress: boolean;
}

const TodayRoutineCard: React.FC<TodayRoutineCardProps> = ({ routine, todayRoutineDay, isLogInProgress }) => (
    <div className="bg-graphite-light p-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-lg font-bold text-white">{routine.nombre}</h2>
                 <p className="text-sm text-accent-lime flex items-center">
                    <Calendar size={14} className="mr-1"/> Hoy toca
                </p>
            </div>
            <Link to={`/routine/${routine.id}`} className="text-xs font-semibold text-accent-lime hover:underline">Ver rutina completa</Link>
        </div>
        <div className="space-y-3">
            {todayRoutineDay.exercises.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
            <Link to="/log-activity" className={`block w-full text-center font-bold py-4 rounded-lg mt-4 transition flex items-center justify-center ${isLogInProgress ? 'bg-accent-orange text-white hover:bg-orange-500' : 'bg-accent-lime text-graphite hover:bg-lime-500'}`}>
               <Plus size={20} className="mr-2"/> {isLogInProgress ? 'Continuar Registrando' : 'Registrar Actividad'}
            </Link>
        </div>
    </div>
);

interface PulseHomeCardProps {
    pulseId: number;
    pulseName: string;
    isLogInProgress: boolean;
}

const PulseHomeCard: React.FC<PulseHomeCardProps> = ({ pulseId, pulseName, isLogInProgress }) => (
    <div className="bg-gradient-to-br from-accent-lime/20 to-graphite-light p-4 rounded-xl shadow-lg border border-accent-lime/30">
        <div className="flex items-center justify-between mb-3">
            <div>
                <h2 className="text-lg font-bold text-white">{pulseName}</h2>
                <p className="text-sm text-accent-lime flex items-center">
                    <Swords size={14} className="mr-1"/> ¡Día de competición!
                </p>
            </div>
            <Link to={`/pulse/${pulseId}`} className="text-xs font-semibold text-accent-lime hover:underline">Ver Pulse</Link>
        </div>
        <p className="text-sm text-gray-300 mb-4">Es tu turno de registrar y sumar al progreso del equipo.</p>
        <Link to={`/pulse/${pulseId}/log`} className={`block w-full text-center font-bold py-4 rounded-lg transition flex items-center justify-center ${isLogInProgress ? 'bg-accent-orange text-white hover:bg-orange-500' : 'bg-accent-lime text-graphite hover:bg-lime-500'}`}>
           <Plus size={20} className="mr-2"/> {isLogInProgress ? 'Continuar Registrando' : 'Registrar en Pulse'}
        </Link>
    </div>
);

const PulseInvitationCard: React.FC<{ pulseId: number, pulseName: string, inviterName: string }> = ({ pulseId, pulseName, inviterName }) => (
    <div className="bg-gradient-to-br from-accent-orange/20 to-graphite-light p-4 rounded-xl shadow-lg border border-accent-orange/30">
        <div className="mb-3">
            <h2 className="text-lg font-bold text-white">¡Te han retado!</h2>
            <p className="text-sm text-accent-orange flex items-center">
                <Swords size={14} className="mr-1"/> Nueva invitación a Pulse
            </p>
        </div>
        <p className="text-sm text-gray-300 mb-4"><b>{inviterName}</b> te ha invitado a unirte a la competición <b>"{pulseName}"</b>. ¿Te mides?</p>
        <div className="flex space-x-2">
             <Link to={`/pulse/accept/${pulseId}`} className="flex-1 text-center bg-accent-lime text-graphite font-bold py-3 rounded-lg transition hover:bg-lime-500 flex items-center justify-center">
               Aceptar Reto <ArrowRight size={16} className="ml-2"/>
            </Link>
             <button className="flex-1 text-center bg-graphite-lighter text-gray-300 font-bold py-3 rounded-lg transition hover:bg-graphite-lighter/80">
               Rechazar
            </button>
        </div>
    </div>
);

const Home: React.FC = () => {
    const { currentUser, routines, pulses, users, announcements, totalUnreadCount } = useUser();
    const prevInvitationsRef = useRef<Pulse[]>([]);
    const [isPersonalLogInProgress, setIsPersonalLogInProgress] = useState(false);
    const [inProgressPulseId, setInProgressPulseId] = useState<number | null>(null);

    
    useEffect(() => {
        if (currentUser) {
            const todayISO = new Date().toISOString().split('T')[0];
            
            // Check for personal log
            const personalKey = `inProgressPersonalLog_${currentUser.id}`;
            const personalLog = localStorage.getItem(personalKey);
            if (personalLog) {
                const parsed = JSON.parse(personalLog);
                if (parsed.date === todayISO) {
                    setIsPersonalLogInProgress(true);
                }
            }

            // Check for any pulse log
            const userPulses = pulses.filter(p => p.participants?.some(part => part.user_id === currentUser.id));
            for (const pulse of userPulses) {
                 const pulseKey = `inProgressPulseLog_${currentUser.id}_${pulse.id}`;
                 const pulseLog = localStorage.getItem(pulseKey);
                 if (pulseLog) {
                     const parsed = JSON.parse(pulseLog);
                     if (parsed.date === todayISO) {
                         setInProgressPulseId(pulse.id);
                         break;
                     }
                 }
            }
        }
    }, [currentUser, pulses]);
    
    if (!currentUser) {
        return <div>Cargando...</div>;
    }
    
    const today = new Date().getDay();

    const activeAnnouncements = announcements.filter(a => a.isActive);

    // Routine logic
    const activeRoutines = routines.filter(r => currentUser.active_routine_ids?.includes(r.id));
    const routinesForToday = activeRoutines
        .map(routine => {
            const todayRoutineDay = routine.routineDays.find(d => d.dia_semana === today);
            return todayRoutineDay ? { routine, todayRoutineDay } : null;
        })
        .filter(Boolean);

    // Pulse logic
    const userPulses = pulses.filter(p => p.participants?.some(participant => participant.user_id === currentUser.id));
    const pulsesForToday = userPulses
        .map(pulse => {
// FIX: Corrected logic to check participant's selected routine for today's workout.
            const participant = pulse.participants.find(p => p.user_id === currentUser.id);
            if (!participant?.selected_routine_id) return null;
            const routine = routines.find(r => r.id === participant.selected_routine_id);
            const hasWorkoutToday = routine?.routineDays.some(d => d.dia_semana === today);
            return hasWorkoutToday ? pulse : null;
        })
        .filter((p): p is Pulse => p !== null);

    // Invitation logic
    const pulseInvitations = pulses.filter(p => p.invited_ids?.includes(currentUser.id));

    useEffect(() => {
        const prevIds = new Set(prevInvitationsRef.current.map(p => p.id));
        const newInvitations = pulseInvitations.filter(p => !prevIds.has(p.id));

        if (newInvitations.length > 0) {
            newInvitations.forEach(invitation => {
                const inviter = users.find(u => u.id === invitation.creator_id);
                showNotification(
                    `${inviter?.nombre || 'Alguien'} te ha retado!`,
                    { 
                        body: `Te invitó a unirte al Pulse "${invitation.name}".`,
                        icon: inviter?.foto_url
                    }
                );
            });
        }
        
        prevInvitationsRef.current = pulseInvitations;
    }, [pulseInvitations, users]);


    return (
        <div className="p-4 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Hola, {currentUser.nombre}</h1>
                    <p className="text-gray-400">¡Listo para romperla hoy!</p>
                </div>
                <div className="flex items-center space-x-2 bg-graphite-light px-3 py-2 rounded-full">
                    <Flame className="text-accent-orange" size={20} />
                    <span className="font-bold text-white">{currentUser.current_streak}</span>
                    <span className="text-sm text-gray-400">días</span>
                </div>
            </header>
            
            <NotificationPermissionCard />

            {activeAnnouncements.map(announcement => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}

            {totalUnreadCount > 0 && <UnreadMessagesCard />}

            {pulseInvitations.length > 0 && (
                pulseInvitations.map(p => {
                    const inviter = users.find(u => u.id === p.creator_id);
                    return p && <PulseInvitationCard key={p.id} pulseId={p.id} pulseName={p.name} inviterName={inviter?.nombre ?? 'Alguien'} />
                })
            )}

            {pulsesForToday.length > 0 && (
                pulsesForToday.map(p => <PulseHomeCard key={p.id} pulseId={p.id} pulseName={p.name} isLogInProgress={inProgressPulseId === p.id} />)
            )}

            {activeRoutines.length === 0 && pulsesForToday.length === 0 && pulseInvitations.length === 0 && activeAnnouncements.length === 0 && totalUnreadCount === 0 ? (
                 <div className="bg-graphite-light p-4 rounded-xl shadow-lg text-center py-8">
                    <Compass className="mx-auto text-gray-500 mb-2" size={40}/>
                    <h3 className="font-bold text-white">No tienes rutinas activas</h3>
                    <p className="text-gray-400 text-sm mb-4">¡Explora y encuentra tu próxima rutina para activarla!</p>
                    <Link to="/explore" className="inline-block bg-accent-lime text-graphite font-bold py-2 px-4 rounded-lg transition hover:bg-lime-500 text-sm">
                       Explorar Rutinas
                    </Link>
                </div>
            ) : routinesForToday.length > 0 ? (
                routinesForToday.map(item => 
                    item && <TodayRoutineCard key={item.routine.id} routine={item.routine} todayRoutineDay={item.todayRoutineDay} isLogInProgress={isPersonalLogInProgress} />
                )
            ) : (
                pulsesForToday.length === 0 && (
                    <div className="bg-graphite-light p-4 rounded-xl shadow-lg text-center py-8">
                        <CheckCircle className="mx-auto text-gray-500 mb-2" size={40}/>
                        <h3 className="font-bold text-white">Día de descanso</h3>
                        <p className="text-gray-400 text-sm">¡Aprovecha para recuperar!</p>
                    </div>
                )
            )}
            
            <div className="mt-2 text-center">
                <p className="text-xs text-gray-600 font-semibold">Desarrollado por <span className="text-gray-500">ASCLEPIO</span></p>
            </div>
        </div>
    );
};

export default Home;