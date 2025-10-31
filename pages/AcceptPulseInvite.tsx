import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Target, CheckSquare } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Exercise, PulseExerciseGoal } from '../types';
import UserProfilePicture from '../components/UserProfilePicture';

interface GoalExercise extends Exercise {
    goal_peso: number;
    goal_series: number;
    goal_reps: number;
}

type PercentageOption = 'custom' | 10 | 25 | 50;

const roundToNearest2point5 = (num: number) => Math.round(num / 2.5) * 2.5;

const AcceptPulseInvite: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { currentUser, pulses, routines, acceptPulseInvite, users } = useUser();
    
    const pulseId = parseInt(id || '');
    const pulse = pulses.find(p => p.id === pulseId);
    
    const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);
    const [goalExercises, setGoalExercises] = useState<GoalExercise[]>([]);
    const [selectedPercentage, setSelectedPercentage] = useState<PercentageOption>('custom');
    
    const pulseRoutines = useMemo(() => routines.filter(r => pulse?.routine_ids?.includes(r.id)), [routines, pulse]);
    const selectedRoutine = useMemo(() => routines.find(r => r.id === selectedRoutineId), [routines, selectedRoutineId]);

    useEffect(() => {
        if (selectedRoutine) {
            const allExercises = selectedRoutine.routineDays.flatMap(d => d.exercises);
            setGoalExercises(allExercises.map(ex => ({
                ...ex,
                goal_peso: ex.objetivo_peso,
                goal_series: ex.objetivo_series,
                goal_reps: ex.objetivo_reps,
            })));
        }
    }, [selectedRoutine]);

    const handleGoalChange = (exerciseId: number, field: string, value: string) => {
        setSelectedPercentage('custom');
        const numValue = parseInt(value) || 0;
        setGoalExercises(prev =>
            prev.map(ex => ex.id === exerciseId ? { ...ex, [field]: numValue } : ex)
        );
    };

    const handlePercentageChange = (percentage: PercentageOption) => {
        setSelectedPercentage(percentage);
        if (percentage === 'custom' || !selectedRoutine) return;

        const allExercises = selectedRoutine.routineDays.flatMap(d => d.exercises);
        const multiplier = 1 + (percentage / 100);
        
        setGoalExercises(allExercises.map(ex => ({
            ...ex,
            goal_peso: roundToNearest2point5(ex.objetivo_peso * multiplier),
            goal_series: ex.objetivo_series,
            goal_reps: ex.objetivo_reps,
        })));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !pulse || !selectedRoutineId) return;
        
        const goals: PulseExerciseGoal[] = goalExercises.map(ex => ({
            exercise_id: ex.id,
            objetivo_peso: ex.goal_peso,
            objetivo_series: ex.goal_series,
            objetivo_reps: ex.goal_reps,
        }));

        await acceptPulseInvite(pulse.id, currentUser.id, goals, selectedRoutineId);
        navigate(`/pulse/${pulse.id}`);
    };

    if (!pulse) {
        return <div className="p-4 text-center">Invitación no válida o la rutina no existe.</div>;
    }
    
    const percentageOptions: { value: PercentageOption, label: string }[] = [
        { value: 10, label: '+10%' },
        { value: 25, label: '+25%' },
        { value: 50, label: '+50%' },
    ];
    
    if (!selectedRoutineId) {
        return (
             <div className="bg-graphite text-white">
                <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                    <button onClick={() => navigate('/')} className="p-2 -ml-2 mr-2"><ArrowLeft /></button>
                    <h1 className="text-xl font-bold">Unirse a: {pulse.name}</h1>
                </header>
                 <main className="p-4">
                    <div className="text-center mb-6">
                        <CheckSquare size={40} className="mx-auto text-accent-lime"/>
                        <h2 className="text-2xl font-bold mt-2">Paso 1: Elige tu Rutina</h2>
                        <p className="text-gray-400">Selecciona la rutina que seguirás en esta competición.</p>
                    </div>
                    <div className="space-y-3">
                        {pulseRoutines.map(routine => {
                            const creator = users.find(u => u.id === routine.user_id);
                            return (
                                <button key={routine.id} onClick={() => setSelectedRoutineId(routine.id)} className="w-full bg-graphite-light p-4 rounded-lg text-left hover:bg-graphite-lighter transition-colors">
                                    <h3 className="font-bold text-white text-lg">{routine.nombre}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2">{routine.descripcion}</p>
                                    <div className="flex items-center mt-2">
                                        <UserProfilePicture user={creator} className="w-6 h-6 mr-2"/>
                                        <span className="text-xs text-gray-300">de @{creator?.username_unico}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="bg-graphite text-white">
            <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                <button onClick={() => setSelectedRoutineId(null)} className="p-2 -ml-2 mr-2"><ArrowLeft /></button>
                <h1 className="text-xl font-bold">Unirse a: {pulse.name}</h1>
            </header>

            <main className="p-4">
                <div className="text-center mb-6">
                    <Target size={40} className="mx-auto text-accent-lime"/>
                    <h2 className="text-2xl font-bold mt-2">Paso 2: Define tus Metas</h2>
                    <p className="text-gray-400">Establece tus objetivos para la rutina <span className="font-bold text-white">{selectedRoutine?.nombre}</span>.</p>
                </div>
                
                 <div className="bg-graphite-light p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                        <Target size={18} className="mr-2"/> Asistente de Metas
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">Aumenta tus metas de peso automáticamente con un solo clic.</p>
                     <div className="grid grid-cols-4 gap-2">
                        {percentageOptions.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handlePercentageChange(opt.value)}
                                className={`py-3 px-2 rounded-lg font-semibold text-sm transition ${selectedPercentage === opt.value ? 'bg-accent-lime text-graphite' : 'bg-graphite-lighter hover:bg-graphite-lighter/80'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                         <button type="button" onClick={() => setSelectedPercentage('custom')} className={`py-3 px-2 rounded-lg font-semibold text-sm transition ${selectedPercentage === 'custom' ? 'bg-sky-500 text-white' : 'bg-graphite-lighter hover:bg-graphite-lighter/80'}`}>
                            Personalizado
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {goalExercises.map(ex => (
                        <div key={ex.id} className="bg-graphite-light p-4 rounded-lg">
                            <h3 className="font-bold text-white">{ex.nombre_ejercicio}</h3>
                            <p className="text-xs text-gray-400 mb-3">Base: {ex.objetivo_series}x{ex.objetivo_reps} @ {ex.objetivo_peso}kg</p>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400">Meta Peso</label>
                                    <input type="number" value={ex.goal_peso} onChange={e => handleGoalChange(ex.id, 'goal_peso', e.target.value)} className="w-full bg-graphite border border-graphite-lighter rounded p-2 text-sm mt-1"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400">Meta Series</label>
                                    <input type="number" value={ex.goal_series} onChange={e => handleGoalChange(ex.id, 'goal_series', e.target.value)} className="w-full bg-graphite border border-graphite-lighter rounded p-2 text-sm mt-1"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400">Meta Reps</label>
                                    <input type="number" value={ex.goal_reps} onChange={e => handleGoalChange(ex.id, 'goal_reps', e.target.value)} className="w-full bg-graphite border border-graphite-lighter rounded p-2 text-sm mt-1"/>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="submit" className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg flex items-center justify-center transition hover:bg-lime-500 mt-4">
                        <Check size={20} className="mr-2"/> Guardar Metas y Unirme
                    </button>
                </form>
            </main>
        </div>
    );
};

export default AcceptPulseInvite;