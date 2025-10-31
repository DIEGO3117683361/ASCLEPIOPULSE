import { User, Routine } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 999,
    username_unico: "asclepio012",
    nombre: "ASCLEPIO",
    edad: 25,
    peso: 80,
    altura: 180,
    veces_semana: 5,
    suplementos: { creatina: true, proteina: true, otros: [] },
    foto_url: "https://i.pravatar.cc/150?u=asclepio012",
    perfil_publico: true,
    current_streak: 120,
    asclepio_score: 950,
    followed_routine_ids: [],
    active_routine_ids: [],
    telefono: "123456789",
    pin: "1234",
  },
];

export const MOCK_ROUTINES: Routine[] = [
  {
    id: 9991,
    user_id: 999,
    nombre: "Tren Superior Intenso",
    descripcion: "Una rutina enfocada en el desarrollo de fuerza y volumen para el tren superior. Ideal para intermedios.",
    followers: 152,
    is_public: true,
    routineDays: [
      {
        id: 1,
        dia_semana: 1, // Lunes
        exercises: [
          { id: 1, nombre_ejercicio: "Press de Banca", orden: 1, objetivo_peso: 80, objetivo_series: 4, objetivo_reps: 8 },
          { id: 2, nombre_ejercicio: "Remo con Barra", orden: 2, objetivo_peso: 70, objetivo_series: 4, objetivo_reps: 10 },
          { id: 3, nombre_ejercicio: "Press Militar", orden: 3, objetivo_peso: 50, objetivo_series: 3, objetivo_reps: 10 },
          { id: 4, nombre_ejercicio: "Fondos en Paralelas", orden: 4, objetivo_peso: 10, objetivo_series: 3, objetivo_reps: 12 },
        ],
      },
      {
        id: 2,
        dia_semana: 3, // Miércoles
        exercises: [
          { id: 1, nombre_ejercicio: "Dominadas", orden: 1, objetivo_peso: 0, objetivo_series: 4, objetivo_reps: 10 },
          { id: 2, nombre_ejercicio: "Press Inclinado con Mancuernas", orden: 2, objetivo_peso: 30, objetivo_series: 4, objetivo_reps: 12 },
          { id: 3, nombre_ejercicio: "Elevaciones Laterales", orden: 3, objetivo_peso: 12, objetivo_series: 3, objetivo_reps: 15 },
          { id: 4, nombre_ejercicio: "Curl de Bíceps con Barra Z", orden: 4, objetivo_peso: 35, objetivo_series: 3, objetivo_reps: 12 },
        ],
      },
    ],
  },
  {
    id: 9992,
    user_id: 999,
    nombre: "Día de Pierna Explosivo",
    descripcion: "Rutina para construir piernas fuertes y funcionales, con enfoque en ejercicios compuestos.",
    followers: 210,
    is_public: true,
    routineDays: [
      {
        id: 3,
        dia_semana: 2, // Martes
        exercises: [
          { id: 1, nombre_ejercicio: "Sentadillas", orden: 1, objetivo_peso: 100, objetivo_series: 5, objetivo_reps: 5 },
          { id: 2, nombre_ejercicio: "Peso Muerto Rumano", orden: 2, objetivo_peso: 90, objetivo_series: 4, objetivo_reps: 8 },
          { id: 3, nombre_ejercicio: "Prensa", orden: 3, objetivo_peso: 150, objetivo_series: 3, objetivo_reps: 12 },
          { id: 4, nombre_ejercicio: "Elevación de Talones", orden: 4, objetivo_peso: 60, objetivo_series: 4, objetivo_reps: 20 },
        ],
      },
    ],
  },
];
