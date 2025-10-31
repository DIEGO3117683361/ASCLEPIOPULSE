import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ThumbsUp, PartyPopper, Dumbbell, CheckCircle } from 'lucide-react';
import { Exercise, PulseExerciseLog } from '../types';
import { useUser } from '../context/UserContext';

interface LoggedExercise extends Exercise {
    logged_peso: number;
    logged_series: number;
    logged_reps: number;
    isModified: boolean;
}

const getLocalStorageKey = (userId: number, pulseId: number) => `inProgressPulseLog_${userId}_${pulseId}`;

const LogPulseActivity: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { currentUser, pulses, routines, addPulseLog, updatePulseProgress } = useUser();
    
    const pulseId = parseInt(id || '');
    const pulse = useMemo(() => pulses.find(p => p.id === pulseId), [pulses, pulseId]);
    
    const participant = useMemo(() => pulse?.participants.find(p => p.user_id === currentUser?.id), [pulse, currentUser]);
    const routine = useMemo(() => routines.find(r => r.id === participant?.selected_routine_id), [routines, participant]);

    const today = new Date().getDay();
    const todayRoutineDay = useMemo(() => routine?.routineDays.find(d => d.dia_semana === today), [routine, today]);
    
    const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (!currentUser || !todayRoutineDay || !pulse) return;

        const key = getLocalStorageKey(currentUser.id, pulse.id);
        const savedLog = localStorage.getItem(key);
        const todayISO = new Date().toISOString().split('T')[0];

        if (savedLog) {
            const parsedLog = JSON.parse(savedLog);
            if (parsedLog.date === todayISO) {
                setLoggedExercises(parsedLog.exercises);
                return;
            }
        }
        
        const initialExercises = todayRoutineDay.exercises.map(ex => ({
            ...ex,
            logged_peso: ex.objetivo_peso,
            logged_series: ex.objetivo_series,
            logged_reps: ex.objetivo_reps,
            isModified: false,
        }));
        setLoggedExercises(initialExercises);

    }, [currentUser, todayRoutineDay, pulse]);

    const handleUpdate = (id: number, field: string, value: number) => {
        setLoggedExercises(prev => {
            const updatedExercises = prev.map(ex => 
                ex.id === id ? { ...ex, [field]: value, isModified: true } : ex
            );

            if (currentUser && pulse) {
                const key = getLocalStorageKey(currentUser.id, pulse.id);
                const logData = {
                    userId: currentUser.id,
                    pulseId: pulse.id,
                    date: new Date().toISOString().split('T')[0],
                    exercises: updatedExercises,
                    startTime: JSON.parse(localStorage.getItem(key) || '{}').startTime || Date.now(),
                };
                localStorage.setItem(key, JSON.stringify(logData));
            }
            return updatedExercises;
        });
    };

    const handleSave = async () => {
        if (!currentUser || !pulse || !routine) return;
        
        const modifiedExercises = loggedExercises.filter(ex => ex.isModified);
        if(modifiedExercises.length === 0) {
             setIsFinished(true);
             return;
        }

        const exercise_logs: PulseExerciseLog[] = modifiedExercises.map(ex => ({
            exercise_id: ex.id,
            nombre_ejercicio: ex.nombre_ejercicio,
            logged_peso: ex.logged_peso,
            logged_series: ex.logged_series,
            logged_reps: ex.logged_reps,
        }));
        
        await addPulseLog({
            pulse_id: pulse.id,
            user_id: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            exercise_logs,
        });

        await updatePulseProgress(pulse.id, currentUser.id, exercise_logs, routine);

        const key = getLocalStorageKey(currentUser.id, pulse.id);
        localStorage.removeItem(key);

        setIsFinished(true);
    };
    
    const LogExerciseCard: React.FC<{ exercise: LoggedExercise }> = ({ exercise }) => {
        return (
             <div className={`bg-graphite-light p-4 rounded-lg space-y-3 border-2 ${exercise.isModified ? 'border-accent-lime/50' : 'border-transparent'}`}>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">{exercise.nombre_ejercicio}</h3>
                    {exercise.isModified && <CheckCircle size={20} className="text-accent-lime"/>}
                </div>
                <p className="text-sm text-gray-400">Objetivo de hoy: {exercise.objetivo_series}x{exercise.objetivo_reps} @ {exercise.objetivo_peso}kg</p>
                
                 <div className="grid grid-cols-3 gap-3 text-center">
                    {['peso', 'series', 'reps'].map(field => {
                        const step = field === 'peso' ? 2.5 : 1;
                        const key = `logged_${field}` as keyof LoggedExercise;
                        return (
                             <div key={field}>
                                <label className="text-xs font-semibold text-gray-400 uppercase">{field} {field === 'peso' && '(kg)'}</label>
                                <div className="flex items-center justify-center mt-1">
                                    <button onClick={() => handleUpdate(exercise.id, key, Math.max(0, (exercise[key] as number) - step))} className="p-2 bg-graphite-lighter rounded-full text-white">-</button>
                                    <span className="w-16 text-xl font-bold text-accent-lime tabular-nums">{exercise[key]}</span>
                                    <button onClick={() => handleUpdate(exercise.id, key, (exercise[key] as number) + step)} className="p-2 bg-graphite-lighter rounded-full text-white">+</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    if (isFinished) {
        return (
            <div className="bg-graphite text-white flex flex-col items-center justify-center p-4 text-center h-full">
                <PartyPopper size={64} className="text-accent-lime animate-bounce"/>
                <h1 className="text-3xl font-black mt-4">¡Progreso Registrado!</h1>
                <p className="text-gray-400 mt-2">Tu esfuerzo ha sido añadido al Pulse. ¡Sigue así!</p>
                <button onClick={() => navigate(`/pulse/${pulseId}`)} className="mt-8 w-full max-w-sm bg-accent-lime text-graphite font-bold py-3 rounded-lg">
                    Ver el Pulse
                </button>
            </div>
        )
    }

    return (
        <div className="bg-graphite text-white">
            <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2"><ArrowLeft /></button>
                <h1 className="text-xl font-bold truncate">Registrar en: {pulse?.name}</h1>
            </header>

            <main className="p-4 space-y-4 pb-16">
                {loggedExercises.length > 0 ? (
                    loggedExercises.map(ex => <LogExerciseCard key={ex.id} exercise={ex} />)
                ) : (
                    <div className="bg-graphite-light p-4 rounded-xl shadow-lg text-center py-8">
                        <Dumbbell className="mx-auto text-gray-500 mb-2" size={40}/>
                        <h3 className="font-bold text-white">No hay entrenamiento hoy</h3>
                        <p className="text-gray-400 text-sm">No hay ejercicios programados para hoy en la rutina que elegiste para este Pulse.</p>
                    </div>
                )}

                {loggedExercises.length > 0 &&
                    <div className="pt-4">
                        <button 
                            onClick={handleSave} 
                            disabled={!loggedExercises.some(e => e.isModified)}
                            className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg flex items-center justify-center transition hover:bg-lime-500 disabled:bg-graphite-lighter disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            <Check size={20} className="mr-2"/> Finalizar y Guardar en Pulse
                        </button>
                    </div>
                }
            </main>
        </div>
    );
};

export default LogPulseActivity;