import React, { useState, useMemo } from 'react';
import { X, Search, CheckSquare, Square } from 'lucide-react';
import { exercises as exerciseLibrary, ExerciseCategory } from '../data/exercises';

interface ExerciseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercises: (exerciseNames: string[]) => void;
  existingExercises: string[];
}

const categories: ExerciseCategory[] = ["Pecho", "Espalda", "Pierna", "Hombro", "Bíceps", "Tríceps", "Abdomen", "Cardio"];

const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({ isOpen, onClose, onAddExercises, existingExercises }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'Todos'>('Todos');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const filteredExercises = useMemo(() => {
    let exercises = exerciseLibrary;
    if (selectedCategory !== 'Todos') {
        exercises = exercises.filter(ex => ex.category === selectedCategory);
    }
    if (searchTerm) {
        exercises = exercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return exercises.filter(ex => !existingExercises.includes(ex.name));
  }, [searchTerm, selectedCategory, existingExercises]);

  const toggleExerciseSelection = (name: string) => {
    setSelectedExercises(prev => 
        prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleAddClick = () => {
    onAddExercises(selectedExercises);
    setSelectedExercises([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-graphite-light rounded-lg p-4 w-full max-w-md border border-graphite-lighter shadow-xl flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ height: '90vh', maxHeight: '600px' }}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-xl font-bold text-white">Biblioteca de Ejercicios</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-graphite-lighter"><X size={20}/></button>
        </div>
        <div className="relative mb-2 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar ejercicio..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-graphite border border-graphite-lighter rounded-lg py-2 pl-10 pr-4 text-white"
          />
        </div>
        <div className="flex-shrink-0 mb-3 overflow-x-auto pb-2 -mx-4 px-4">
             <div className="flex space-x-2">
                <button onClick={() => setSelectedCategory('Todos')} className={`py-1.5 px-3 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === 'Todos' ? 'bg-accent-lime text-graphite' : 'bg-graphite-lighter text-gray-300'}`}>Todos</button>
                {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`py-1.5 px-3 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-accent-lime text-graphite' : 'bg-graphite-lighter text-gray-300'}`}>{cat}</button>
                ))}
             </div>
        </div>

        <div className="overflow-y-auto space-y-1 flex-1 -mr-2 pr-2">
          {filteredExercises.map(ex => (
            <button 
                key={ex.name} 
                onClick={() => toggleExerciseSelection(ex.name)}
                className="w-full flex items-center text-left p-2 rounded-md hover:bg-graphite-lighter/50 transition-colors"
            >
                {selectedExercises.includes(ex.name) ? <CheckSquare size={20} className="text-accent-lime mr-3 flex-shrink-0"/> : <Square size={20} className="text-gray-500 mr-3 flex-shrink-0"/>}
                <span className="font-semibold text-white">{ex.name}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex-shrink-0">
            <button 
                onClick={handleAddClick} 
                disabled={selectedExercises.length === 0}
                className="w-full bg-accent-lime text-graphite font-bold py-3 rounded-lg flex items-center justify-center disabled:bg-graphite-lighter disabled:text-gray-500"
            >
                Añadir ({selectedExercises.length}) Ejercicios
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibraryModal;