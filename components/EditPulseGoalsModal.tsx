import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Target, PlusCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Pulse, PulseParticipant, Exercise, PulseExerciseGoal } from '../types';
import UserProfilePicture from './UserProfilePicture';

interface GoalExercise extends Exercise {
    goal_peso: number;
    goal_series: number;
    goal_reps: number;
}

type PercentageOption = 'custom' | 10 | 25 | 50;

const roundToNearest2point5 = (num: number) => Math.round(num / 2.5) * 2.5;

interface EditPulseGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pulse: Pulse;
  participant: PulseParticipant;
}

const EditPulseGoalsModal: React.FC<EditPulseGoalsModalProps> = ({ isOpen, onClose, pulse, participant }) => {
    const { currentUser, routines, updatePulseParticipantGoals, users, addRoutineToPulse } = useUser();

    const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(participant.selected_routine_id || null);
    const [goalExercises, setGoalExercises] = useState<GoalExercise[]>([]);
    const [selectedPercentage, setSelectedPercentage] = useState<PercentageOption>('custom');

    const pulseRoutines = useMemo(() => routines.filter(r => (pulse.routine_ids || []).includes(r.id)), [routines, pulse]);
    const myRoutinesToAdd = useMemo(() => {
        if (!currentUser) return [];
        return routines.filter(r => r.user_id === currentUser.id && !(pulse.routine_ids || []).includes(r.id));
    }, [routines, pulse, currentUser]);

    const selectedRoutine = useMemo(() => routines.find(r => r.id === selectedRoutineId), [routines, selectedRoutineId]);

    useEffect(() => {
        if (selectedRoutine) {
            const allExercises = selectedRoutine.routineDays.flatMap(d => d.exercises);
            
            if (selectedRoutine.id === participant.selected_routine_id) {
                 setGoalExercises(allExercises.map(ex => {
                    const savedGoal = participant.goals.find(g => g.exercise_id === ex.id);
                    return {
                        ...ex,
                        goal_peso: savedGoal?.objetivo_peso ?? ex.objetivo_peso,
                        goal_series: savedGoal?.objetivo_series ?? ex.objetivo_series,
                        goal_reps: savedGoal?.objetivo_reps ?? ex.objetivo_reps,
                    };
                }));
            } else {
                setGoalExercises(allExercises.map(ex => ({
                    ...ex,
                    goal_peso: ex.objetivo_peso,
                    goal_series: ex.objetivo_series,
                    goal_reps: ex.objetivo_reps,
                })));
            }
        }
    }, [selectedRoutine, participant]);

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
    
    const handleAddRoutineToPulse = async (routineId: number) => {
        await addRoutineToPulse(pulse.id, routineId);
        setSelectedRoutineId(routineId);
    };

    const handleSubmit = async () => {
        if (!currentUser || !pulse || !selectedRoutineId) return;
        
        const goals: PulseExerciseGoal[] = goalExercises.map(ex => ({
            exercise_id: ex.id,
            objetivo_peso: ex.goal_peso,
            objetivo_series: ex.goal_series,
            objetivo_reps: ex.goal_reps,
        }));

        await updatePulseParticipantGoals(pulse.id, currentUser.id, goals, selectedRoutineId);
        onClose();
    };
    
    if (!isOpen) return null;
    
    const percentageOptions: { value: PercentageOption, label: string }[] = [
        { value: 10, label: '+10%' },
        { value: 25, label: '+25%' },
        { value: 50, label: '+50%' },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
             <div 
                className="bg-graphite-light rounded-lg p-4 w-full max-w-md border border-graphite-lighter shadow-xl flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{ height: '90vh', maxHeight: '700px' }}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold text-white">Editar Participación</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-graphite-lighter"><X size={20}/></button>
                </div>
                
                <div className="overflow-y-auto pr-2 -mr-2 space-y-4">
                    <div>
                        <h4 className="font-bold text-white mb-2">1. Gestiona tu Rutina</h4>
                        <div className="space-y-2 bg-graphite p-3 rounded-lg">
                            <h5 className="text-sm font-semibold text-gray-300">Rutinas en este Pulse</h5>
                             {pulseRoutines.map(routine => {
                                const creator = users.find(u => u.id === routine.user_id);
                                return (
                                    <button key={routine.id} onClick={() => setSelectedRoutineId(routine.id)} className={`w-full bg-graphite-light p-2 rounded-lg text-left transition-all border-2 ${selectedRoutineId === routine.id ? 'border-accent-lime' : 'border-transparent hover:border-graphite-lighter'}`}>
                                        <div className="flex items-center">
                                            <UserProfilePicture user={creator} className="w-8 h-8 mr-3"/>
                                            <div>
                                                 <h3 className="font-bold text-white text-sm">{routine.nombre}</h3>
                                                 <p className="text-xs text-gray-400">de @{creator?.username_unico}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                             {myRoutinesToAdd.length > 0 && (
                                <div className="mt-3">
                                    <h5 className="text-sm font-semibold text-gray-300 pt-2 border-t border-graphite-lighter">Añadir una de mis rutinas</h5>
                                     {myRoutinesToAdd.map(routine => (
                                        <button key={routine.id} onClick={() => handleAddRoutineToPulse(routine.id)} className="w-full bg-graphite-light p-2 mt-2 rounded-lg text-left transition-colors hover:bg-graphite-lighter flex items-center">
                                            <PlusCircle size={16} className="mr-3 text-accent-lime"/>
                                            <span className="font-semibold text-sm">{routine.nombre}</span>
                                        </button>
                                     ))}
                                </div>
                             )}
                        </div>
                    </div>
                    
                    {selectedRoutine && (
                        <div>
                            <h4 className="font-bold text-white mb-2">2. Ajusta tus Metas</h4>
                            <div className="bg-graphite p-3 rounded-lg mb-3">
                                <h5 className="text-sm font-semibold text-white mb-2 flex items-center"><Target size={14} className="mr-1.5"/> Asistente de Metas de Peso</h5>
                                 <div className="grid grid-cols-4 gap-2">
                                    {percentageOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handlePercentageChange(opt.value as PercentageOption)}
                                            className={`py-2 px-2 rounded-md font-semibold text-xs transition ${selectedPercentage === opt.value ? 'bg-accent-lime text-graphite' : 'bg-graphite-lighter hover:bg-graphite-lighter/80'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                     <button type="button" onClick={() => setSelectedPercentage('custom')} className={`py-2 px-2 rounded-md font-semibold text-xs transition ${selectedPercentage === 'custom' ? 'bg-sky-500 text-white' : 'bg-graphite-lighter hover:bg-graphite-lighter/80'}`}>
                                        Personal.
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {goalExercises.map(ex => (
                                    <div key={ex.id} className="bg-graphite p-3 rounded-lg">
                                        <h5 className="font-bold text-white text-sm">{ex.nombre_ejercicio}</h5>
                                        <p className="text-xs text-gray-400 mb-2">Base: {ex.objetivo_series}x{ex.objetivo_reps} @ {ex.objetivo_peso}kg</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400">Meta Peso</label>
                                                <input type="number" value={ex.goal_peso} onChange={e => handleGoalChange(ex.id, 'goal_peso', e.target.value)} className="w-full bg-graphite-lighter border-graphite-lighter border rounded p-1.5 text-xs mt-1 text-center"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400">Meta Series</label>
                                                <input type="number" value={ex.goal_series} onChange={e => handleGoalChange(ex.id, 'goal_series', e.target.value)} className="w-full bg-graphite-lighter border-graphite-lighter border rounded p-1.5 text-xs mt-1 text-center"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400">Meta Reps</label>
                                                <input type="number" value={ex.goal_reps} onChange={e => handleGoalChange(ex.id, 'goal_reps', e.target.value)} className="w-full bg-graphite-lighter border-graphite-lighter border rounded p-1.5 text-xs mt-1 text-center"/>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex-shrink-0">
                    <button 
                        onClick={handleSubmit} 
                        disabled={!selectedRoutineId}
                        className="w-full bg-accent-lime text-graphite font-bold py-3 rounded-lg flex items-center justify-center transition disabled:bg-graphite-lighter disabled:text-gray-500"
                    >
                        <Save size={16} className="mr-2"/> Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPulseGoalsModal;