export type ExerciseCategory = "Pecho" | "Espalda" | "Pierna" | "Hombro" | "Bíceps" | "Tríceps" | "Abdomen" | "Cardio";

export interface LibraryExercise {
    name: string;
    category: ExerciseCategory;
}

export const exercises: LibraryExercise[] = [
    // Pecho
    { name: 'Press de Banca con Barra', category: 'Pecho' },
    { name: 'Press de Banca Inclinado con Barra', category: 'Pecho' },
    { name: 'Press de Banca Declinado con Barra', category: 'Pecho' },
    { name: 'Press de Banca con Mancuernas', category: 'Pecho' },
    { name: 'Press Inclinado con Mancuernas', category: 'Pecho' },
    { name: 'Aperturas con Mancuernas', category: 'Pecho' },
    { name: 'Aperturas en Cable (Crossover)', category: 'Pecho' },
    { name: 'Fondos en Paralelas (Pecho)', category: 'Pecho' },
    { name: 'Flexiones (Push-ups)', category: 'Pecho' },
    { name: 'Pec Deck (Máquina de Aperturas)', category: 'Pecho' },
    { name: 'Press en Máquina (Chest Press)', category: 'Pecho' },

    // Espalda
    { name: 'Dominadas (Pull-ups)', category: 'Espalda' },
    { name: 'Jalón al Pecho (Lat Pulldown)', category: 'Espalda' },
    { name: 'Remo con Barra (Bent-over Row)', category: 'Espalda' },
    { name: 'Remo con Mancuerna (Dumbbell Row)', category: 'Espalda' },
    { name: 'Remo en Polea Baja (Seated Cable Row)', category: 'Espalda' },
    { name: 'Peso Muerto Convencional', category: 'Espalda' },
    { name: 'Remo en T (T-Bar Row)', category: 'Espalda' },
    { name: 'Pull-over con Mancuerna', category: 'Espalda' },
    { name: 'Hiperextensiones', category: 'Espalda' },
    { name: 'Face Pulls', category: 'Espalda' },

    // Pierna
    { name: 'Sentadilla con Barra (Squat)', category: 'Pierna' },
    { name: 'Prensa de Piernas (Leg Press)', category: 'Pierna' },
    { name: 'Zancadas (Lunges)', category: 'Pierna' },
    { name: 'Peso Muerto Rumano', category: 'Pierna' },
    { name: 'Curl Femoral Acostado', category: 'Pierna' },
    { name: 'Curl Femoral Sentado', category: 'Pierna' },
    { name: 'Extensión de Cuádriceps', category: 'Pierna' },
    { name: 'Sentadilla Búlgara', category: 'Pierna' },
    { name: 'Hip Thrust', category: 'Pierna' },
    { name: 'Elevación de Talones de Pie', category: 'Pierna' },
    { name: 'Elevación de Talones Sentado', category: 'Pierna' },

    // Hombro
    { name: 'Press Militar con Barra', category: 'Hombro' },
    { name: 'Press de Hombro con Mancuernas', category: 'Hombro' },
    { name: 'Elevaciones Laterales con Mancuernas', category: 'Hombro' },
    { name: 'Elevaciones Frontales con Mancuernas', category: 'Hombro' },
    { name: 'Pájaros (Bent-over Dumbbell Raise)', category: 'Hombro' },
    { name: 'Remo al Mentón (Upright Row)', category: 'Hombro' },
    { name: 'Press Arnold', category: 'Hombro' },
    { name: 'Encogimientos de Hombros (Shrugs)', category: 'Hombro' },

    // Bíceps
    { name: 'Curl de Bíceps con Barra', category: 'Bíceps' },
    { name: 'Curl de Bíceps con Mancuernas', category: 'Bíceps' },
    { name: 'Curl Martillo (Hammer Curl)', category: 'Bíceps' },
    { name: 'Curl Concentrado', category: 'Bíceps' },
    { name: 'Curl en Banco Scott (Predicador)', category: 'Bíceps' },
    { name: 'Curl en Polea Baja', category: 'Bíceps' },

    // Tríceps
    { name: 'Press Francés', category: 'Tríceps' },
    { name: 'Extensiones de Tríceps en Polea Alta', category: 'Tríceps' },
    { name: 'Fondos de Tríceps en Banco', category: 'Tríceps' },
    { name: 'Press de Banca con Agarre Cerrado', category: 'Tríceps' },
    { name: 'Patada de Tríceps (Tricep Kickback)', category: 'Tríceps' },
    { name: 'Extensiones sobre la cabeza con mancuerna', category: 'Tríceps' },

    // Abdomen
    { name: 'Crunches', category: 'Abdomen' },
    { name: 'Elevación de Piernas Colgado', category: 'Abdomen' },
    { name: 'Plancha (Plank)', category: 'Abdomen' },
    { name: 'Rueda Abdominal (Ab Wheel)', category: 'Abdomen' },
    { name: 'Giros Rusos (Russian Twists)', category: 'Abdomen' },
    { name: 'Woodchoppers (Leñador con polea)', category: 'Abdomen' },
    
    // Cardio
    { name: 'Correr en Cinta', category: 'Cardio' },
    { name: 'Bicicleta Estática', category: 'Cardio' },
    { name: 'Elíptica', category: 'Cardio' },
    { name: 'Remo (Máquina)', category: 'Cardio' },
    { name: 'Saltar la Cuerda', category: 'Cardio' },
    { name: 'StairMaster / Escaladora', category: 'Cardio' },
];
