import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Minus, ThumbsUp, PartyPopper, Dumbbell } from 'lucide-react';
import { Exercise } from '../types';
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
            <p className="text-sm text-gray-400">Objetivo: {exercise.objetivo_series}x{exercise.objetivo_reps} @ {exercise.objetivo_peso}kg</p>
            
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

const LogActivity: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, routines, logUserActivity } = useUser();
    
    const today = new Date().getDay();
    const currentRoutineForToday = currentUser
      ? routines.find(
          r =>
            currentUser.active_routine_ids?.includes(r.id) &&
            r.routineDays?.some(d => d.dia_semana === today),
        )
      : undefined;

    const todayRoutineDay = currentRoutineForToday?.routineDays.find(
      d => d.dia_semana === today,
    );
    
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

    const handleFinish = async () => {
        await logUserActivity();
        setIsFinished(true);
    }

    if (isFinished) {
        return (
            <div className="bg-graphite text-white flex flex-col items-center justify-center p-4 text-center h-full">
                <PartyPopper size={64} className="text-accent-lime animate-bounce"/>
                <h1 className="text-3xl font-black mt-4">¡Excelente trabajo!</h1>
                <p className="text-gray-400 mt-2">Tu progreso ha sido guardado. Tu racha continúa.</p>
                <div className="mt-6 bg-graphite-light p-4 rounded-lg w-full max-w-sm">
                    <p className="font-bold flex items-center justify-center"><ThumbsUp size={16} className="mr-2 text-accent-orange"/> ¡Nuevo PR en Press de Banca!</p>
                    <p className="text-sm text-gray-300">Has levantado 2.5kg más que tu último récord.</p>
                </div>
                <button 
                    onClick={() => navigate('/')}
                    className="mt-8 w-full max-w-sm bg-accent-lime text-graphite font-bold py-3 rounded-lg"
                >
                    Volver al Inicio
                </button>
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

            <main className="p-4 space-y-4">
                {loggedExercises.length > 0 ? (
                    loggedExercises.map(ex => 
                        <LogExerciseCard key={ex.id} exercise={ex} onUpdate={handleUpdate} />
                    )
                ) : (
                    <div className="bg-graphite-light p-4 rounded-xl shadow-lg text-center py-8">
                        <Dumbbell className="mx-auto text-gray-500 mb-2" size={40}/>
                        <h3 className="font-bold text-white">No hay entrenamiento hoy</h3>
                        <p className="text-gray-400 text-sm">No tienes ejercicios programados para hoy en tus rutinas activas.</p>
                    </div>
                )}
                
                <button 
                    onClick={handleFinish}
                    disabled={loggedExercises.length === 0}
                    className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg flex items-center justify-center transition hover:bg-lime-500 disabled:bg-graphite-lighter disabled:text-gray-500 disabled:cursor-not-allowed mt-4"
                >
                    <Check size={20} className="mr-2"/> Guardar Progreso
                </button>
            </main>
        </div>
    );
};

export default LogActivity;