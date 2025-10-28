import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Minus, ThumbsUp, PartyPopper, Dumbbell } from 'lucide-react';
import { Exercise, PulseExerciseLog } from '../types';
import { useUser } from '../context/UserContext';

interface LoggedExercise extends Exercise {
    logged_peso: number;
    logged_series: number;
    logged_reps: number;
}

const LogExerciseCard: React.FC<{ exercise: LoggedExercise, onUpdate: (id: number, field: string, value: number) => void }> = ({ exercise, onUpdate }) => {
    const handleIncrement = (field: keyof LoggedExercise, value: number) => {
        onUpdate(exercise.id, field, Math.max(0, (exercise[field] as number) + value));
    };

    return (
        <div className="bg-graphite-light p-4 rounded-lg space-y-3">
            <h3 className="font-bold text-white text-lg">{exercise.nombre_ejercicio}</h3>
            <p className="text-sm text-gray-400">Objetivo de hoy: {exercise.objetivo_series}x{exercise.objetivo_reps} @ {exercise.objetivo_peso}kg</p>
            
            <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                    <label className="text-xs font-semibold text-gray-400">PESO (kg)</label>
                    <div className="flex items-center justify-center mt-1">
                        <button onClick={() => handleIncrement('logged_peso', -2.5)} className="p-2 bg-graphite-lighter rounded-full"><Minus size={16}/></button>
                        <span className="w-16 text-xl font-bold text-accent-lime">{exercise.logged_peso}</span>
                        <button onClick={() => handleIncrement('logged_peso', 2.5)} className="p-2 bg-graphite-lighter rounded-full"><Plus size={16}/></button>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-400">SERIES</label>
                     <div className="flex items-center justify-center mt-1">
                        <button onClick={() => handleIncrement('logged_series', -1)} className="p-2 bg-graphite-lighter rounded-full"><Minus size={16}/></button>
                        <span className="w-12 text-xl font-bold text-accent-lime">{exercise.logged_series}</span>
                        <button onClick={() => handleIncrement('logged_series', 1)} className="p-2 bg-graphite-lighter rounded-full"><Plus size={16}/></button>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-400">REPS</label>
                     <div className="flex items-center justify-center mt-1">
                        <button onClick={() => handleIncrement('logged_reps', -1)} className="p-2 bg-graphite-lighter rounded-full"><Minus size={16}/></button>
                        <span className="w-12 text-xl font-bold text-accent-lime">{exercise.logged_reps}</span>
                        <button onClick={() => handleIncrement('logged_reps', 1)} className="p-2 bg-graphite-lighter rounded-full"><Plus size={16}/></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const LogPulseActivity: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { currentUser, pulses, routines, addPulseLog, updatePulseProgress } = useUser();
    
    const pulseId = parseInt(id || '');
    const pulse = pulses.find(p => p.id === pulseId);
    const routine = routines.find(r => r.id === pulse?.routine_id);

    const today = new Date().getDay();
    const todayRoutineDay = routine?.routineDays.find(d => d.dia_semana === today);
    
    const initialLoggedExercises = todayRoutineDay?.exercises.map(ex => ({
        ...ex,
        logged_peso: ex.objetivo_peso,
        logged_series: ex.objetivo_series,
        logged_reps: ex.objetivo_reps,
    })) || [];

    const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>(initialLoggedExercises);
    const [isFinished, setIsFinished] = useState(false);

    const handleUpdate = (id: number, field: string, value: number) => {
        setLoggedExercises(prev => 
            prev.map(ex => ex.id === id ? { ...ex, [field]: value } : ex)
        );
    };

    const handleSave = async () => {
        if (!currentUser || !pulse || !routine) return;
        
        const exercise_logs: PulseExerciseLog[] = loggedExercises.map(ex => ({
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

        // After logging, update the progress
        await updatePulseProgress(pulse.id, currentUser.id, exercise_logs, routine);

        setIsFinished(true);
    };

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

            <main className="p-4 space-y-4">
                {loggedExercises.length > 0 ? (
                    <>
                        {loggedExercises.map(ex => <LogExerciseCard key={ex.id} exercise={ex} onUpdate={handleUpdate} />)}
                         <button onClick={handleSave} className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg flex items-center justify-center transition hover:bg-lime-500 mt-4">
                            <Check size={20} className="mr-2"/> Guardar Progreso en Pulse
                        </button>
                    </>
                ) : (
                    <div className="bg-graphite-light p-4 rounded-xl shadow-lg text-center py-8">
                        <Dumbbell className="mx-auto text-gray-500 mb-2" size={40}/>
                        <h3 className="font-bold text-white">No hay entrenamiento hoy</h3>
                        <p className="text-gray-400 text-sm">No hay ejercicios programados para hoy en este Pulse.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LogPulseActivity;