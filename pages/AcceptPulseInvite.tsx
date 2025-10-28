import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Target } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Pulse, Routine, Exercise, PulseExerciseGoal } from '../types';

interface GoalExercise extends Exercise {
    goal_peso: number;
    goal_series: number;
    goal_reps: number;
}

const AcceptPulseInvite: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { currentUser, pulses, routines, acceptPulseInvite } = useUser();
    
    const pulseId = parseInt(id || '');
    const pulse = pulses.find(p => p.id === pulseId);
    const routine = routines.find(r => r.id === pulse?.routine_id);

    const [goalExercises, setGoalExercises] = useState<GoalExercise[]>([]);

    useEffect(() => {
        if (routine) {
            const allExercises = routine.routineDays.flatMap(d => d.exercises);
            setGoalExercises(allExercises.map(ex => ({
                ...ex,
                goal_peso: ex.objetivo_peso,
                goal_series: ex.objetivo_series,
                goal_reps: ex.objetivo_reps,
            })));
        }
    }, [routine]);

    const handleGoalChange = (exerciseId: number, field: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setGoalExercises(prev =>
            prev.map(ex => ex.id === exerciseId ? { ...ex, [field]: numValue } : ex)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !pulse) return;
        
        const goals: PulseExerciseGoal[] = goalExercises.map(ex => ({
            exercise_id: ex.id,
            objetivo_peso: ex.goal_peso,
            objetivo_series: ex.goal_series,
            objetivo_reps: ex.goal_reps,
        }));

        await acceptPulseInvite(pulse.id, currentUser.id, goals);
        navigate(`/pulse/${pulse.id}`);
    };

    if (!pulse || !routine) {
        return <div className="p-4 text-center">Invitación no válida o la rutina no existe.</div>;
    }

    return (
        <div className="bg-graphite text-white">
            <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 mr-2"><ArrowLeft /></button>
                <h1 className="text-xl font-bold">Unirse a: {pulse.name}</h1>
            </header>

            <main className="p-4">
                <div className="text-center mb-6">
                    <Target size={40} className="mx-auto text-accent-lime"/>
                    <h2 className="text-2xl font-bold mt-2">Define tus Metas</h2>
                    <p className="text-gray-400">Establece tus objetivos para el final de la competición. ¡A por todas!</p>
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