import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ThumbsUp, PartyPopper, Dumbbell, CheckCircle } from 'lucide-react';
import { Exercise } from '../types';
import { useUser } from '../context/UserContext';

interface LoggedExercise extends Exercise {
    logged_peso: number;
    logged_series: number;
    logged_reps: number;
    isModified: boolean;
}

const getLocalStorageKey = (userId: number) => `inProgressPersonalLog_${userId}`;

const LogActivity: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, routines, logUserActivity } = useUser();
    
    const today = new Date().getDay();
    const currentRoutineForToday = useMemo(() => currentUser
      ? routines.find(
          r =>
            currentUser.active_routine_ids?.includes(r.id) &&
            r.routineDays?.some(d => d.dia_semana === today),
        )
      : undefined, [currentUser, routines, today]);

    const todayRoutineDay = useMemo(() => currentRoutineForToday?.routineDays.find(
      d => d.dia_semana === today,
    ), [currentRoutineForToday, today]);
    
    const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (!currentUser || !todayRoutineDay) return;

        const key = getLocalStorageKey(currentUser.id);
        const savedLog = localStorage.getItem(key);
        const todayISO = new Date().toISOString().split('T')[0];

        if (savedLog) {
            const parsedLog = JSON.parse(savedLog);
            if (parsedLog.date === todayISO && parsedLog.routineId === currentRoutineForToday?.id) {
                // Restore from localStorage
                setLoggedExercises(parsedLog.exercises);
                return;
            }
        }
        
        // Initialize new log session
        const initialExercises = todayRoutineDay.exercises.map(ex => ({
            ...ex,
            logged_peso: ex.objetivo_peso,
            logged_series: ex.objetivo_series,
            logged_reps: ex.objetivo_reps,
            isModified: false,
        }));
        setLoggedExercises(initialExercises);

    }, [currentUser, todayRoutineDay, currentRoutineForToday]);


    const handleUpdate = (id: number, field: string, value: number) => {
        setLoggedExercises(prev => {
            const updatedExercises = prev.map(ex => 
                ex.id === id ? { ...ex, [field]: value, isModified: true } : ex
            );

            // Save to localStorage immediately on each update
            if (currentUser && currentRoutineForToday) {
                const key = getLocalStorageKey(currentUser.id);
                const logData = {
                    userId: currentUser.id,
                    routineId: currentRoutineForToday.id,
                    date: new Date().toISOString().split('T')[0],
                    exercises: updatedExercises,
                    startTime: JSON.parse(localStorage.getItem(key) || '{}').startTime || Date.now(),
                };
                localStorage.setItem(key, JSON.stringify(logData));
            }

            return updatedExercises;
        });
    };

    const handleFinish = async () => {
        if (!currentUser) return;
        await logUserActivity();
        
        // Clear localStorage after successful submission
        const key = getLocalStorageKey(currentUser.id);
        localStorage.removeItem(key);

        setIsFinished(true);
    }

    if (isFinished) {
        return (
            <div className="bg-graphite text-white flex flex-col items-center justify-center p-4 text-center h-full">
                <PartyPopper size={64} className="text-accent-lime animate-bounce"/>
                <h1 className="text-3xl font-black mt-4">¡Excelente trabajo!</h1>
                <p className="text-gray-400 mt-2">Tu progreso ha sido guardado. Tu racha continúa.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="mt-8 w-full max-w-sm bg-accent-lime text-graphite font-bold py-3 rounded-lg"
                >
                    Volver al Inicio
                </button>
            </div>
        )
    }

    const LogExerciseCard: React.FC<{ exercise: LoggedExercise }> = ({ exercise }) => {
        return (
            <div className={`bg-graphite-light p-4 rounded-lg space-y-3 border-2 ${exercise.isModified ? 'border-accent-lime/50' : 'border-transparent'}`}>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">{exercise.nombre_ejercicio}</h3>
                    {exercise.isModified && <CheckCircle size={20} className="text-accent-lime"/>}
                </div>
                <p className="text-sm text-gray-400">Objetivo: {exercise.objetivo_series}x{exercise.objetivo_reps} @ {exercise.objetivo_peso}kg</p>
                
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

    return (
        <div className="bg-graphite text-white">
            <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2">
                    <ArrowLeft />
                </button>
                <h1 className="text-xl font-bold">Registrar Actividad</h1>
            </header>

            <main className="p-4 space-y-4 pb-16">
                {loggedExercises.length > 0 ? (
                    loggedExercises.map(ex => 
                        <LogExerciseCard key={ex.id} exercise={ex} />
                    )
                ) : (
                    <div className="bg-graphite-light p-4 rounded-xl shadow-lg text-center py-8">
                        <Dumbbell className="mx-auto text-gray-500 mb-2" size={40}/>
                        <h3 className="font-bold text-white">No hay entrenamiento hoy</h3>
                        <p className="text-gray-400 text-sm">No tienes ejercicios programados para hoy en tus rutinas activas.</p>
                    </div>
                )}
                
                {loggedExercises.length > 0 && (
                    <div className="pt-4">
                        <button 
                            onClick={handleFinish}
                            disabled={!loggedExercises.some(e => e.isModified)}
                            className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg flex items-center justify-center transition hover:bg-lime-500 disabled:bg-graphite-lighter disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            <Check size={20} className="mr-2"/> Finalizar y Guardar Progreso
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LogActivity;