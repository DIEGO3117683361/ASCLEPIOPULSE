import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Routine, RoutineDay, Exercise } from '../types';

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const CreateEditRoutine: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { currentUser, routines, addRoutine, updateRoutine } = useUser();
    
    const isEditMode = id !== undefined;
    const routineId = parseInt(id || '');
    const existingRoutine = isEditMode ? routines.find(r => r.id === routineId) : undefined;
    
    const [routine, setRoutine] = useState<Omit<Routine, 'id' | 'user_id' | 'followers'>>({
        nombre: '',
        descripcion: '',
        is_public: true,
        routineDays: [],
    });

    useEffect(() => {
        if (isEditMode && existingRoutine) {
            if (existingRoutine.user_id !== currentUser?.id) {
                navigate(`/profile/${currentUser?.id}`); // Redirect if not creator
            }
            setRoutine(existingRoutine);
        }
    }, [isEditMode, existingRoutine, currentUser, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRoutine(prev => ({ ...prev, [name]: value }));
    };

    const addDay = () => {
        const newDay: RoutineDay = {
            id: Date.now(),
            dia_semana: 1, // Default to Monday
            exercises: [],
        };
        setRoutine(prev => ({ ...prev, routineDays: [...prev.routineDays, newDay]}));
    };

    const updateDay = (dayId: number, dia_semana: number) => {
        setRoutine(prev => ({
            ...prev,
            routineDays: prev.routineDays.map(d => d.id === dayId ? { ...d, dia_semana } : d)
        }));
    };
    
    const removeDay = (dayId: number) => {
        setRoutine(prev => ({ ...prev, routineDays: prev.routineDays.filter(d => d.id !== dayId)}));
    };

    const addExercise = (dayId: number) => {
        const newExercise: Exercise = {
            id: Date.now(),
            nombre_ejercicio: '',
            orden: 1,
            objetivo_peso: 20,
            objetivo_series: 3,
            objetivo_reps: 10,
        };
        setRoutine(prev => ({
            ...prev,
            routineDays: prev.routineDays.map(d => d.id === dayId ? { ...d, exercises: [...d.exercises, newExercise] } : d)
        }));
    };

    const updateExercise = (dayId: number, exId: number, field: string, value: string) => {
        const isNumeric = ['objetivo_peso', 'objetivo_series', 'objetivo_reps', 'orden'].includes(field);
        const processedValue = isNumeric ? parseFloat(value) || 0 : value;

        setRoutine(prev => ({
            ...prev,
            routineDays: prev.routineDays.map(d => {
                if (d.id === dayId) {
                    return {
                        ...d,
                        exercises: d.exercises.map(ex => ex.id === exId ? { ...ex, [field]: processedValue } : ex)
                    };
                }
                return d;
            })
        }));
    };
    
    const removeExercise = (dayId: number, exId: number) => {
        setRoutine(prev => ({
            ...prev,
            routineDays: prev.routineDays.map(d => d.id === dayId ? { ...d, exercises: d.exercises.filter(ex => ex.id !== exId) } : d)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && existingRoutine) {
            updateRoutine(routine as Routine);
            navigate(`/routine/${existingRoutine.id}`);
        } else {
            addRoutine(routine);
            navigate(`/profile/${currentUser?.id}`);
        }
    };
    
    return (
        <div className="bg-graphite text-white">
            <header className="p-4 flex items-center sticky top-0 bg-graphite z-10 border-b border-graphite-lighter">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2">
                    <ArrowLeft />
                </button>
                <h1 className="text-xl font-bold">{isEditMode ? 'Editar Rutina' : 'Crear Nueva Rutina'}</h1>
            </header>

            <main className="p-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-400 mb-1">Nombre de la Rutina</label>
                        <input type="text" name="nombre" value={routine.nombre} onChange={handleInputChange} required className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime" />
                    </div>
                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                        <textarea name="descripcion" value={routine.descripcion} onChange={handleInputChange} rows={3} className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime"></textarea>
                    </div>

                    <div className="space-y-4">
                        {routine.routineDays.map(day => (
                            <div key={day.id} className="bg-graphite-light p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <select value={day.dia_semana} onChange={e => updateDay(day.id, parseInt(e.target.value))} className="bg-graphite-lighter border border-graphite-lighter rounded p-2 text-white font-bold">
                                        {dayNames.map((name, index) => <option key={index} value={index}>{name}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeDay(day.id)} className="p-2 text-red-400"><Trash2 size={18} /></button>
                                </div>
                                <div className="space-y-2">
                                    {day.exercises.map(ex => (
                                        <div key={ex.id} className="grid grid-cols-12 gap-2 items-center border-t border-graphite-lighter pt-2">
                                            <input type="text" placeholder="Nombre Ejercicio" value={ex.nombre_ejercicio} onChange={e => updateExercise(day.id, ex.id, 'nombre_ejercicio', e.target.value)} className="col-span-11 bg-graphite border border-graphite-lighter rounded p-2 text-sm"/>
                                            <button type="button" onClick={() => removeExercise(day.id, ex.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={16}/></button>
                                            <input type="number" placeholder="kg" value={ex.objetivo_peso} onChange={e => updateExercise(day.id, ex.id, 'objetivo_peso', e.target.value)} className="col-span-4 bg-graphite border border-graphite-lighter rounded p-2 text-sm"/>
                                            <input type="number" placeholder="series" value={ex.objetivo_series} onChange={e => updateExercise(day.id, ex.id, 'objetivo_series', e.target.value)} className="col-span-4 bg-graphite border border-graphite-lighter rounded p-2 text-sm"/>
                                            <input type="number" placeholder="reps" value={ex.objetivo_reps} onChange={e => updateExercise(day.id, ex.id, 'objetivo_reps', e.target.value)} className="col-span-4 bg-graphite border border-graphite-lighter rounded p-2 text-sm"/>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={() => addExercise(day.id)} className="mt-3 text-accent-lime text-sm font-semibold flex items-center"><Plus size={16} className="mr-1"/> Añadir Ejercicio</button>
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={addDay} className="w-full bg-graphite-light text-white font-bold py-3 rounded-lg flex items-center justify-center transition hover:bg-graphite-lighter">
                       <Plus size={20} className="mr-2"/> Añadir Día de Entrenamiento
                    </button>
                    
                    <button type="submit" className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg flex items-center justify-center transition hover:bg-lime-500">
                        <Check size={20} className="mr-2"/> {isEditMode ? 'Actualizar Rutina' : 'Guardar Rutina'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default CreateEditRoutine;