import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Trash2, GripVertical, Info } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Routine, RoutineDay, Exercise as ExerciseType } from '../types';
import ExerciseLibraryModal from '../components/ExerciseLibraryModal';
import { exercises as exerciseLibrary } from '../data/exercises';

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const fullDayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const getLocalStorageKey = (userId: number, routineId: string | undefined) => `inProgressRoutine_v2_${userId}_${routineId || 'new'}`;

const CreateEditRoutine: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { currentUser, routines, addRoutine, updateRoutine } = useUser();

    const [step, setStep] = useState(1);
    const isEditMode = id !== undefined;
    const routineId = parseInt(id || '');
    const existingRoutine = isEditMode ? routines.find(r => r.id === routineId) : undefined;

    const [routine, setRoutine] = useState<Omit<Routine, 'id' | 'user_id' | 'followers'>>({
        nombre: '',
        descripcion: '',
        is_public: true,
        routineDays: [],
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLibraryOpen, setLibraryOpen] = useState(false);
    const [activeDay, setActiveDay] = useState(1); // Monday
    const [draggedItem, setDraggedItem] = useState<ExerciseType | null>(null);

    useEffect(() => {
        if (!currentUser) return;
        const key = getLocalStorageKey(currentUser.id, id);
        const savedDraft = localStorage.getItem(key);

        if (savedDraft) {
            const parsedDraft = JSON.parse(savedDraft);
            setRoutine(parsedDraft.routine);
            setStep(parsedDraft.step);
            if(parsedDraft.routine.routineDays.length > 0) {
              const firstDay = parsedDraft.routine.routineDays.sort((a: RoutineDay, b: RoutineDay) => a.dia_semana - b.dia_semana)[0];
              setActiveDay(firstDay.dia_semana);
            }
        } else if (isEditMode && existingRoutine) {
            if (existingRoutine.user_id !== currentUser?.id) {
                navigate(`/profile/${currentUser?.id}`);
            }
            setRoutine(existingRoutine);
            setStep(2); // Go directly to editor in edit mode
             if(existingRoutine.routineDays.length > 0) {
              const firstDay = existingRoutine.routineDays.sort((a, b) => a.dia_semana - b.dia_semana)[0];
              setActiveDay(firstDay.dia_semana);
            }
        }
        setIsLoaded(true);
    }, [isEditMode, existingRoutine, currentUser, navigate, id]);

    useEffect(() => {
        if (!isLoaded || !currentUser) return;
        const key = getLocalStorageKey(currentUser.id, id);
        const draft = { routine, step };
        localStorage.setItem(key, JSON.stringify(draft));
    }, [routine, step, isLoaded, currentUser, id]);

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleDayTabClick = (dayIndex: number) => {
        setActiveDay(dayIndex);
        if (!routine.routineDays.some(d => d.dia_semana === dayIndex)) {
            const newDay: RoutineDay = {
                id: Date.now(),
                dia_semana: dayIndex,
                exercises: [],
            };
            setRoutine(prev => ({
                ...prev,
                routineDays: [...prev.routineDays, newDay].sort((a, b) => a.dia_semana - b.dia_semana)
            }));
        }
    };
    
    const removeDay = (dayIndex: number) => {
        setRoutine(prev => {
            const newRoutineDays = prev.routineDays.filter(d => d.dia_semana !== dayIndex);
            if (newRoutineDays.length > 0 && activeDay === dayIndex) {
                 setActiveDay(newRoutineDays[0].dia_semana);
            } else if (newRoutineDays.length === 0) {
                setActiveDay(1); // Reset to Monday if no days left
            }
            return { ...prev, routineDays: newRoutineDays };
        });
    };

    const handleAddExercises = (exerciseNames: string[]) => {
        const newExercises: ExerciseType[] = exerciseNames.map(name => ({
            id: Date.now() + Math.random(),
            nombre_ejercicio: name,
            orden: (routine.routineDays.find(d => d.dia_semana === activeDay)?.exercises.length || 0) + 1,
            objetivo_peso: 20,
            objetivo_series: 3,
            objetivo_reps: 10,
        }));

        setRoutine(prev => ({
            ...prev,
            routineDays: prev.routineDays.map(d =>
                d.dia_semana === activeDay
                    ? { ...d, exercises: [...d.exercises, ...newExercises] }
                    : d
            )
        }));
    };
    
    const updateExercise = (exId: number, field: string, value: string) => {
        const isNumeric = ['objetivo_peso', 'objetivo_series', 'objetivo_reps'].includes(field);
        const processedValue = isNumeric ? parseFloat(value) : value;

        setRoutine(prev => ({
            ...prev,
            routineDays: prev.routineDays.map(d => {
                if (d.dia_semana === activeDay) {
                    return {
                        ...d,
                        exercises: d.exercises.map(ex => ex.id === exId ? { ...ex, [field]: processedValue } : ex)
                    };
                }
                return d;
            })
        }));
    };

    const removeExercise = (exId: number) => {
        setRoutine(prev => ({
            ...prev,
            routineDays: prev.routineDays.map(d =>
                d.dia_semana === activeDay
                    ? { ...d, exercises: d.exercises.filter(ex => ex.id !== exId) }
                    : d
            )
        }));
    };
    
     const handleDragStart = (e: React.DragEvent<HTMLDivElement>, exercise: ExerciseType) => {
        setDraggedItem(exercise);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.style.borderTop = '2px solid #bef264';
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.borderTop = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetExercise: ExerciseType) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetExercise.id) return;
        
        e.currentTarget.style.borderTop = '';

        setRoutine(prev => {
            const newRoutine = { ...prev };
            const dayToUpdate = newRoutine.routineDays.find(d => d.dia_semana === activeDay);
            if (!dayToUpdate) return prev;

            let exercises = [...dayToUpdate.exercises];
            const dragIndex = exercises.findIndex(ex => ex.id === draggedItem.id);
            const targetIndex = exercises.findIndex(ex => ex.id === targetExercise.id);
            
            // Remove dragged item and insert it before the target
            const [removed] = exercises.splice(dragIndex, 1);
            exercises.splice(targetIndex, 0, removed);
            
            dayToUpdate.exercises = exercises.map((ex, index) => ({...ex, orden: index + 1}));

            return {
                ...newRoutine,
                routineDays: newRoutine.routineDays.map(d => d.dia_semana === activeDay ? dayToUpdate : d)
            };
        });
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
        setDraggedItem(null);
    };

    const handleSubmitRoutine = () => {
        if (!currentUser) return;
        
        const key = getLocalStorageKey(currentUser.id, id);

        if (isEditMode && existingRoutine) {
            updateRoutine({ ...routine, id: existingRoutine.id, user_id: existingRoutine.user_id, followers: existingRoutine.followers });
            localStorage.removeItem(key);
            navigate(`/routine/${existingRoutine.id}`);
        } else {
            addRoutine(routine);
            localStorage.removeItem(key);
            navigate(`/profile/${currentUser?.id}`);
        }
    };
    
    if (!isLoaded) {
        return <div className="bg-graphite text-white min-h-screen flex items-center justify-center"><p>Cargando editor...</p></div>;
    }

    const currentDayData = routine.routineDays.find(d => d.dia_semana === activeDay);
    
    return (
        <>
        <ExerciseLibraryModal
            isOpen={isLibraryOpen}
            onClose={() => setLibraryOpen(false)}
            onAddExercises={handleAddExercises}
            existingExercises={currentDayData?.exercises.map(e => e.nombre_ejercicio) || []}
        />
        <div className="bg-graphite text-white flex flex-col h-screen">
            <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter flex-shrink-0">
                <button onClick={() => step === 1 ? navigate(-1) : setStep(1)} className="p-2 -ml-2 mr-2">
                    <ArrowLeft />
                </button>
                <h1 className="text-xl font-bold">{isEditMode ? 'Editar Rutina' : 'Crear Rutina'}</h1>
            </header>

            {step === 1 && (
                <main className="p-4 flex-1">
                    <form onSubmit={handleInfoSubmit} className="space-y-6">
                         <div className="text-center">
                            <Info size={40} className="mx-auto text-accent-lime"/>
                            <h2 className="text-2xl font-bold mt-2">Información Básica</h2>
                            <p className="text-gray-400 text-sm">Dale un nombre y una descripción a tu nueva rutina.</p>
                        </div>
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-400 mb-1">Nombre de la Rutina</label>
                            <input type="text" name="nombre" value={routine.nombre} onChange={e => setRoutine(p => ({...p, nombre: e.target.value}))} required className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white" />
                        </div>
                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                            <textarea name="descripcion" value={routine.descripcion} onChange={e => setRoutine(p => ({...p, descripcion: e.target.value}))} rows={3} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg flex items-center justify-center">
                            Siguiente
                        </button>
                    </form>
                </main>
            )}

            {step === 2 && (
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="px-4 pt-4 flex-shrink-0">
                        <div className="flex justify-between items-center mb-2">
                             <h2 className="text-lg font-bold text-white">Planificador de Días</h2>
                             <button onClick={handleSubmitRoutine} className="bg-accent-lime text-graphite font-bold py-2 px-4 rounded-lg flex items-center text-sm"><Check size={16} className="mr-1"/> Guardar Rutina</button>
                        </div>
                        <div className="flex space-x-2 border-b border-graphite-lighter">
                            {dayNames.map((day, index) => {
                                const dayExists = routine.routineDays.some(d => d.dia_semana === index);
                                return (
                                <button key={index} onClick={() => handleDayTabClick(index)} className={`py-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeDay === index ? 'text-accent-lime border-accent-lime' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
                                    {day}
                                    {dayExists && <div className="w-1.5 h-1.5 bg-accent-lime rounded-full mx-auto mt-0.5"></div>}
                                </button>
                            )})}
                        </div>
                    </div>
                    <main className="flex-1 p-4 overflow-y-auto space-y-4">
                        <div className="flex justify-between items-center">
                           <h3 className="font-bold text-white">{fullDayNames[activeDay]}</h3>
                           {currentDayData && <button onClick={() => removeDay(activeDay)} className="text-red-400 text-xs font-semibold flex items-center"><Trash2 size={12} className="mr-1"/> Borrar día</button>}
                        </div>
                       
                        {currentDayData && currentDayData.exercises.length > 0 && (
                            <div className="space-y-2">
                                {currentDayData.exercises.map(ex => (
                                    <div 
                                        key={ex.id} 
                                        className="bg-graphite-light p-3 rounded-lg flex gap-2 items-center"
                                        draggable
                                        onDragStart={e => handleDragStart(e, ex)}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={e => handleDrop(e, ex)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <GripVertical className="text-gray-500 cursor-move flex-shrink-0"/>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <input type="text" value={ex.nombre_ejercicio} onChange={e => updateExercise(ex.id, 'nombre_ejercicio', e.target.value)} className="w-full bg-graphite border border-graphite-lighter rounded p-2 text-sm font-semibold"/>
                                                <button type="button" onClick={() => removeExercise(ex.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={16}/></button>
                                            </div>
                                             <div className="grid grid-cols-3 gap-2">
                                                 <input type="number" placeholder="kg" value={isNaN(ex.objetivo_peso as number) ? '' : ex.objetivo_peso} onChange={e => updateExercise(ex.id, 'objetivo_peso', e.target.value)} className="bg-graphite border border-graphite-lighter rounded p-2 text-sm text-center"/>
                                                 <input type="number" placeholder="series" value={isNaN(ex.objetivo_series as number) ? '' : ex.objetivo_series} onChange={e => updateExercise(ex.id, 'objetivo_series', e.target.value)} className="bg-graphite border border-graphite-lighter rounded p-2 text-sm text-center"/>
                                                 <input type="number" placeholder="reps" value={isNaN(ex.objetivo_reps as number) ? '' : ex.objetivo_reps} onChange={e => updateExercise(ex.id, 'objetivo_reps', e.target.value)} className="bg-graphite border border-graphite-lighter rounded p-2 text-sm text-center"/>
                                             </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {currentDayData && (
                             <button type="button" onClick={() => setLibraryOpen(true)} className="w-full bg-graphite-light border-2 border-dashed border-graphite-lighter text-gray-300 font-bold py-3 rounded-lg flex items-center justify-center transition hover:bg-graphite-lighter hover:text-white">
                                <Plus size={20} className="mr-2"/> Añadir Ejercicios
                            </button>
                        )}
                    </main>
                </div>
            )}
        </div>
        </>
    );
};

export default CreateEditRoutine;