import { Timestamp } from 'firebase/firestore';

export interface Exercise {
  id: number;
  nombre_ejercicio: string;
  orden: number;
  objetivo_peso: number;
  objetivo_series: number;
  objetivo_reps: number;
}

export interface RoutineDay {
  id: number;
  dia_semana: number; // 0 for Sunday, 1 for Monday, etc.
  exercises: Exercise[];
}

export interface Routine {
  id: number;
  user_id: number;
  nombre: string;
  descripcion: string;
  followers: number;
  is_public: boolean;
  routineDays: RoutineDay[];
}

export interface User {
  id: number;
  username_unico: string;
  nombre: string;
  bio?: string;
  socials?: {
    instagram?: string;
    facebook?: string;
    x?: string;
    tiktok?: string;
  };
  edad: number;
  peso: number;
  altura: number;
  veces_semana: number;
  suplementos: {
    creatina: boolean;
    proteina: boolean;
    otros: string[];
  };
  foto_url: string;
  perfil_publico: boolean;
  current_streak: number;
  asclepio_score: number;
  followed_routine_ids: number[];
  active_routine_ids: number[];
  telefono: string;
  pin: string;
  isSuspended?: boolean;
  suspensionReason?: string;
  achievements?: {
    [key: string]: boolean | number;
    streak_10_days?: boolean;
    streak_60_days?: boolean;
    minigame_level_3?: boolean;
  };
  last_personal_activity_date?: string; // ISO "YYYY-MM-DD"
  followers?: number[];
  following?: number[];
  minigames_progress?: {
    [gameId: string]: {
      level: number;
      high_score?: number;
    };
  };
}

export interface PulseExerciseLog {
  exercise_id: number;
  nombre_ejercicio: string;
  logged_peso: number;
  logged_series: number;
  logged_reps: number;
}

export interface PulseLog {
  id: number;
  pulse_id: number;
  user_id: number;
  date: string; // ISO string date "YYYY-MM-DD"
  exercise_logs: PulseExerciseLog[];
}

export interface PulseExerciseGoal {
  exercise_id: number;
  objetivo_peso: number;
  objetivo_series: number;
  objetivo_reps: number;
}

export interface PulseParticipant {
  user_id: number;
  selected_routine_id?: number;
  goals: PulseExerciseGoal[];
  progress: number; // Percentage 0-100
  last_logged_stats: Record<number, { peso: number; series: number; reps: number }>; // exercise_id -> stats
}

export interface Pulse {
  id: number;
  name: string;
  description: string;
  creator_id: number;
  participants: PulseParticipant[];
  invited_ids: number[];
  routine_ids: number[];
  streak: number;
  last_activity_date: string | null; // ISO string date "YYYY-MM-DD"
  startDate: string; // ISO string date "YYYY-MM-DD"
  endDate: string; // ISO string date "YYYY-MM-DD"
}

export interface ChatMessage {
  id: string;
  routine_id: number;
  sender_id: number;
  text: string;
  timestamp: Timestamp;
}

export interface ChatRoom {
  id: string;
  participant_ids: number[];
  last_message?: {
    content: string;
    sender_id: number;
    timestamp: Timestamp;
  };
  last_updated: Timestamp;
  unread_counts: { [key: string]: number };
  expiresAt: Timestamp;
}

export interface DirectChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: number;
  timestamp: Timestamp;
  type: 'text' | 'sticker' | 'routine';
  content: string;
}

export interface GroupChatRoom {
  id: string;
  name: string;
  description: string;
  creator_id: number;
  color?: string;
  participant_ids: number[];
  last_message?: {
    content: string;
    sender_id: number;
    sender_name: string;
    timestamp: Timestamp;
  };
  last_updated: Timestamp;
  unread_counts: { [key: string]: number };
  expiresAt: Timestamp;
}

export interface GroupChatMessage {
  id: string;
  group_chat_room_id: string;
  sender_id: number;
  timestamp: Timestamp;
  type: 'text' | 'sticker';
  content: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string; // image url
  link?: string;
  linkText?: string;
  isActive: boolean;
  createdAt: Timestamp;
}