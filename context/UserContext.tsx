import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Routine, Pulse, PulseLog, ChatMessage, PulseExerciseLog, PulseExerciseGoal, PulseParticipant, Announcement, ChatRoom, DirectChatMessage, GroupChatRoom, GroupChatMessage } from '../types';
import { db, storage } from '../firebase/config';
import { 
    collection, 
    getDocs, 
    query, 
    doc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove, 
    increment,
    addDoc,
    onSnapshot,
    setDoc,
    Timestamp,
    orderBy,
    writeBatch,
    deleteDoc,
    where,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Level, getLevelForScore } from '../utils/levels';


type CurrentUserType = (User & { isAdmin?: boolean }) | null;
type ScoreUpdateType = { points: number; message: string; newTotal: number } | null;
type StreakMilestoneType = { type: 'personal' | 'pulse', days: number, pulseName?: string } | null;
type LevelUpType = { oldLevel: Level, newLevel: Level } | null;


interface UserContextType {
    users: User[];
    currentUser: CurrentUserType;
    routines: Routine[];
    pulses: Pulse[];
    pulseLogs: PulseLog[];
    announcements: Announcement[];
    chatRooms: ChatRoom[];
    groupChatRooms: GroupChatRoom[];
    totalUnreadCount: number;
    login: (telefono: string, pin: string) => Promise<{ success: boolean; reason?: string }>;
    logout: () => void;
    followRoutine: (routineId: number) => Promise<void>;
    unfollowRoutine: (routineId: number) => Promise<void>;
    toggleActiveRoutine: (routineId: number) => Promise<void>;
    addRoutine: (routine: Omit<Routine, 'id' | 'user_id' | 'followers'>) => Promise<void>;
    updateRoutine: (routine: Routine) => Promise<void>;
    deleteRoutine: (routineId: number) => Promise<void>;
    addPulseLog: (log: Omit<PulseLog, 'id'>) => Promise<void>;
    createUser: (userData: Omit<User, 'id'>) => Promise<User | null>;
    updateUser: (userData: Partial<User>) => Promise<void>;
    deleteUserAccount: (pin: string) => Promise<boolean>;
    addPulse: (pulseData: Omit<Pulse, 'id'>) => Promise<number | undefined>;
    acceptPulseInvite: (pulseId: number, userId: number, goals: PulseExerciseGoal[]) => Promise<void>;
    updatePulseParticipantGoals: (pulseId: number, userId: number, goals: PulseExerciseGoal[]) => Promise<void>;
    updatePulseProgress: (pulseId: number, userId: number, exerciseLogs: PulseExerciseLog[], routine: Routine) => Promise<void>;
    leavePulse: (pulseId: number) => Promise<void>;
    deletePulse: (pulseId: number) => Promise<void>;
    logUserActivity: () => Promise<void>;
    getChatMessages: (routineId: number, callback: (messages: ChatMessage[]) => void) => () => void;
    sendChatMessage: (routineId: number, text: string) => Promise<void>;
    loading: boolean;
    // Score and Achievements
    scoreUpdate: ScoreUpdateType;
    clearScoreUpdate: () => void;
    // Streak Milestones
    streakMilestone: StreakMilestoneType;
    clearStreakMilestone: () => void;
    // Level Up
    levelUp: LevelUpType;
    clearLevelUp: () => void;
    // Direct Chat
    getOrCreateChatRoom: (otherUserId: number, fromUserId?: number) => Promise<string | null>;
    getDirectChatMessages: (chatRoomId: string, callback: (messages: DirectChatMessage[]) => void) => () => void;
    sendDirectChatMessage: (chatRoomId: string, type: 'text' | 'image' | 'sticker', content: string) => Promise<void>;
    uploadImageForChat: (file: File) => Promise<string | null>;
    updateProfilePicture: (url: string) => Promise<void>;
    uploadProfilePictureFromFile: (file: File) => Promise<string | null>;
    markChatRoomAsRead: (chatRoomId: string) => Promise<void>;
    // Group Chat
    createGroupChat: (data: Omit<GroupChatRoom, 'id'>) => Promise<string | null>;
    getGroupChatMessages: (roomId: string, callback: (messages: GroupChatMessage[]) => void) => () => void;
    sendGroupChatMessage: (roomId: string, type: 'text' | 'image' | 'sticker', content: string) => Promise<void>;
    updateGroupInfo: (roomId: string, data: { name: string; description: string; color?: string }) => Promise<void>;
    addParticipantsToGroup: (roomId: string, userIds: number[]) => Promise<void>;
    leaveGroup: (roomId: string) => Promise<void>;
    deleteGroup: (roomId: string) => Promise<void>;
    markGroupChatAsRead: (roomId: string) => Promise<void>;
    // Admin functions
    suspendUser: (userId: number, reason: string) => Promise<void>;
    unsuspendUser: (userId: number) => Promise<void>;
    adminDeleteUser: (userId: number) => Promise<void>;
    adminUpdateUserStats: (userId: number, stats: { asclepio_score?: number, current_streak?: number }) => Promise<void>;
    sendSupportMessage: (userIds: number[], text: string) => Promise<void>;
    addAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
    updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>;
    deleteAnnouncement: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const adminCredentials = { telefono: '3117683361', pin: '5872' };

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<CurrentUserType>(null);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [pulses, setPulses] = useState<Pulse[]>([]);
    const [pulseLogs, setPulseLogs] = useState<PulseLog[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [groupChatRooms, setGroupChatRooms] = useState<GroupChatRoom[]>([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [scoreUpdate, setScoreUpdate] = useState<ScoreUpdateType>(null);
    const [streakMilestone, setStreakMilestone] = useState<StreakMilestoneType>(null);
    const [levelUp, setLevelUp] = useState<LevelUpType>(null);

    const clearScoreUpdate = () => setScoreUpdate(null);
    const clearStreakMilestone = () => setStreakMilestone(null);
    const clearLevelUp = () => setLevelUp(null);


    const updateAsclepioScore = async (type: 'CREATE_ROUTINE' | 'STREAK_4_DAYS' | 'STREAK_30_DAYS' | 'JOIN_PULSE' | 'CREATE_PULSE' | 'NEW_FOLLOWER', payload?: any) => {
        if (!currentUser) return;

        const oldLevel = getLevelForScore(currentUser.asclepio_score);
        let points = 0;
        let message = '';
        let achievementKey = '';

        switch (type) {
            case 'CREATE_ROUTINE':
                points = 2;
                message = "¡Nueva rutina creada! La constancia es la clave.";
                break;
            case 'STREAK_4_DAYS':
                if (!currentUser.achievements?.['streak_4_days']) {
                    points = 5;
                    message = "¡4 días de racha! Estás construyendo un hábito.";
                    achievementKey = 'streak_4_days';
                }
                break;
            case 'STREAK_30_DAYS':
                 if (!currentUser.achievements?.['streak_30_days']) {
                    points = 5;
                    message = "¡30 días de racha! Eres imparable.";
                    achievementKey = 'streak_30_days';
                }
                break;
            case 'JOIN_PULSE':
            case 'CREATE_PULSE':
                points = 7;
                message = "¡Aceptaste el reto! Demuestra de qué estás hecho.";
                break;
            case 'NEW_FOLLOWER':
                points = 2;
                message = "¡Alguien sigue tu rutina! Estás inspirando a otros.";
                break;
        }

        if (points > 0) {
            const userDocRef = doc(db, 'users', currentUser.id.toString());
            const newTotal = currentUser.asclepio_score + points;
            
            const updates: { [key: string]: any } = { asclepio_score: increment(points) };
            if (achievementKey) {
                updates[`achievements.${achievementKey}`] = true;
            }

            await updateDoc(userDocRef, updates);
            setScoreUpdate({ points, message, newTotal });

            const newLevel = getLevelForScore(newTotal);
            if (oldLevel.name !== newLevel.name) {
                setTimeout(() => {
                    setLevelUp({ oldLevel, newLevel });
                }, 1000); 
            }
        }
    };

    // Real-time listener for the current user to enforce suspensions/deletions immediately.
    useEffect(() => {
        if (currentUser && currentUser.id !== -1 && !currentUser.isAdmin) {
            const unsub = onSnapshot(doc(db, "users", currentUser.id.toString()), (doc) => {
                if (doc.exists()) {
                    const updatedUserData = { ...doc.data(), id: currentUser.id } as User;
                    if (updatedUserData.isSuspended) {
                        alert(`Tu cuenta ha sido suspendida por un administrador. Razón: ${updatedUserData.suspensionReason}`);
                        logout(); // Force logout
                    } else {
                        setCurrentUser(prevUser => ({...(prevUser || {}), ...updatedUserData}));
                    }
                } else {
                    alert("Tu cuenta ha sido eliminada por un administrador.");
                    logout();
                }
            }, (error) => {
                console.error("Error listening to user document:", error);
            });

            return () => unsub();
        }
    }, [currentUser?.id]);

    useEffect(() => {
        if (!currentUser || currentUser.isAdmin) return;
    
        const directChatsQuery = query(collection(db, 'direct_chats'), where('participant_ids', 'array-contains', currentUser.id));
        const groupChatsQuery = query(collection(db, 'group_chats'), where('participant_ids', 'array-contains', currentUser.id));
    
        const unsubDirect = onSnapshot(directChatsQuery, (snapshot) => {
            const rooms = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ChatRoom));
            setChatRooms(rooms);
        });
    
        const unsubGroup = onSnapshot(groupChatsQuery, (snapshot) => {
            const rooms = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as GroupChatRoom));
            setGroupChatRooms(rooms);
        });
    
        return () => {
            unsubDirect();
            unsubGroup();
        };
    }, [currentUser]);
    
    useEffect(() => {
        if (!currentUser) {
            setTotalUnreadCount(0);
            return;
        }
        const userIdStr = currentUser.id.toString();
        
        const directUnread = chatRooms.reduce((acc, room) => {
            return acc + (room.unread_counts?.[userIdStr] || 0);
        }, 0);
    
        const groupUnread = groupChatRooms.reduce((acc, room) => {
            return acc + (room.unread_counts?.[userIdStr] || 0);
        }, 0);
    
        setTotalUnreadCount(directUnread + groupUnread);
    
    }, [chatRooms, groupChatRooms, currentUser]);

    useEffect(() => {
        setLoading(true);
        let initialLoads = 0;
        const totalInitialLoads = 5; // users, routines, pulses, pulseLogs, announcements

        const checkInitialLoadComplete = () => {
            initialLoads++;
            if (initialLoads >= totalInitialLoads) {
                setLoading(false);
            }
        };

        const unsubscribers = [
            onSnapshot(query(collection(db, 'users')), snapshot => {
                const usersList = snapshot.docs
                    .map(doc => doc.data() as User)
                    .filter(user => user && typeof user.id === 'number');
                
                const supportUser: User = {
                    id: 0,
                    nombre: 'Soporte Técnico',
                    username_unico: 'support',
                    foto_url: `https://api.dicebear.com/8.x/micah/svg?seed=Support&backgroundColor=06b6d4&accessories=headset`,
                    edad: 99, peso: 99, altura: 99, veces_semana: 7, suplementos: { creatina: true, proteina: true, otros: [] },
                    perfil_publico: false, current_streak: 0, asclepio_score: 0, followed_routine_ids: [],
                    active_routine_ids: [], telefono: '0000000000', pin: '0000',
                };

                setUsers([supportUser, ...usersList.filter(u => u.telefono !== adminCredentials.telefono)]);
                if(initialLoads < totalInitialLoads) checkInitialLoadComplete();
            }, error => console.error("Error fetching users:", error)),

            onSnapshot(query(collection(db, 'routines')), snapshot => {
                const routinesList = snapshot.docs
                    .map(doc => doc.data() as Routine)
                    .filter(routine => routine && typeof routine.id === 'number');
                setRoutines(routinesList);
                if(initialLoads < totalInitialLoads) checkInitialLoadComplete();
            }, error => console.error("Error fetching routines:", error)),

            onSnapshot(query(collection(db, "pulses")), snapshot => {
                const pulsesList = snapshot.docs
                    .map(doc => doc.data() as Pulse)
                    .filter(pulse => pulse && typeof pulse.id === 'number');
                setPulses(pulsesList);
                 if(initialLoads < totalInitialLoads) checkInitialLoadComplete();
            }, error => console.error("Error fetching pulses:", error)),

            onSnapshot(query(collection(db, "pulseLogs")), snapshot => {
                const logsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as PulseLog));
                setPulseLogs(logsList);
                 if(initialLoads < totalInitialLoads) checkInitialLoadComplete();
            }, error => console.error("Error fetching pulse logs:", error)),

            onSnapshot(query(collection(db, "announcements"), orderBy('createdAt', 'desc')), snapshot => {
                const announcementsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Announcement));
                setAnnouncements(announcementsList);
                 if(initialLoads < totalInitialLoads) checkInitialLoadComplete();
            }, error => console.error("Error fetching announcements:", error))
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }, []);

    const login = async (telefono: string, pin: string): Promise<{ success: boolean; reason?: string }> => {
        if (telefono === adminCredentials.telefono && pin === adminCredentials.pin) {
            const adminUser: User = {
                id: -1,
                nombre: 'Admin',
                username_unico: 'admin',
                foto_url: `https://api.dicebear.com/8.x/micah/svg?seed=Admin&backgroundColor=d1d4f9&accessories=shades`,
                edad: 99, peso: 99, altura: 99, veces_semana: 7, suplementos: { creatina: true, proteina: true, otros: [] },
                perfil_publico: false, current_streak: 999, asclepio_score: 9999, followed_routine_ids: [],
                active_routine_ids: [], telefono: adminCredentials.telefono, pin: adminCredentials.pin,
            };
            setCurrentUser({ ...adminUser, isAdmin: true });
            return { success: true };
        }

        const user = users.find(u => u.telefono === telefono && u.pin === pin);
        if (user) {
            if (user.isSuspended) {
                return { success: false, reason: user.suspensionReason || 'Tu cuenta ha sido suspendida.' };
            }
            setCurrentUser(user);
            return { success: true };
        }
        return { success: false, reason: 'Teléfono o PIN incorrectos.' };
    };

    const logout = () => setCurrentUser(null);
    
     const createUser = async (userData: Omit<User, 'id'>): Promise<User | null> => {
        try {
            // Generate a unique numeric ID. Using Date.now() is sufficient for this app's scale.
            const newId = Date.now();
            const newUser: User = { ...userData, id: newId };

            // Use the numeric ID as the document name (as a string) and also store it inside the document.
            await setDoc(doc(db, "users", newId.toString()), { ...userData, id: newId });

            setCurrentUser(newUser);
            return newUser;
        } catch (error) {
            console.error("Error creating user: ", error);
            return null;
        }
    };
    const updateUser = async (userData: Partial<User>) => {
        if (!currentUser) return;
        try {
            await updateDoc(doc(db, 'users', currentUser.id.toString()), userData as { [x: string]: any; });
            const updatedUser = { ...currentUser, ...userData };
            setCurrentUser(updatedUser);
        } catch (error) {
            console.error("Error updating user: ", error);
        }
    };
    const deleteUserAccount = async (pin: string): Promise<boolean> => {
        if (!currentUser || currentUser.pin !== pin) {
            return false;
        }
        try {
            await deleteDoc(doc(db, 'users', currentUser.id.toString()));
            logout();
            return true;
        } catch (error) {
            console.error("Error deleting user account: ", error);
            return false;
        }
    };
    const followRoutine = async (routineId: number) => {
        if (!currentUser) return;
        const batch = writeBatch(db);
        batch.update(doc(db, 'users', currentUser.id.toString()), { followed_routine_ids: arrayUnion(routineId) });
        batch.update(doc(db, 'routines', routineId.toString()), { followers: increment(1) });
        await batch.commit();

        // Update score for the routine creator
        const routine = routines.find(r => r.id === routineId);
        if (routine) {
            const creatorDocRef = doc(db, 'users', routine.user_id.toString());
            await updateDoc(creatorDocRef, { asclepio_score: increment(2) });
            // Note: Can't show toast to another user, but their score updates.
        }
    };
    const unfollowRoutine = async (routineId: number) => {
        if (!currentUser) return;
        const batch = writeBatch(db);
        batch.update(doc(db, 'users', currentUser.id.toString()), { followed_routine_ids: arrayRemove(routineId), active_routine_ids: arrayRemove(routineId) });
        batch.update(doc(db, 'routines', routineId.toString()), { followers: increment(-1) });
        await batch.commit();
         // Update score for the routine creator
        const routine = routines.find(r => r.id === routineId);
        if (routine) {
            const creatorDocRef = doc(db, 'users', routine.user_id.toString());
            await updateDoc(creatorDocRef, { asclepio_score: increment(-2) });
        }
    };
    const toggleActiveRoutine = async (routineId: number) => {
        if (!currentUser) return;
        const isActive = (currentUser.active_routine_ids ?? []).includes(routineId);
        await updateDoc(doc(db, 'users', currentUser.id.toString()), { active_routine_ids: isActive ? arrayRemove(routineId) : arrayUnion(routineId) });
    };
    const addRoutine = async (routineData: Omit<Routine, 'id' | 'user_id' | 'followers'>) => {
        if (!currentUser) return;
        const newId = Date.now();
        const newRoutineData = { ...routineData, id: newId, user_id: currentUser.id, followers: 0 };
        await setDoc(doc(db, 'routines', newId.toString()), newRoutineData);
        await updateAsclepioScore('CREATE_ROUTINE');
    };
    const updateRoutine = async (updatedRoutine: Routine) => {
        const { id, ...dataToUpdate } = updatedRoutine;
        await updateDoc(doc(db, 'routines', id.toString()), dataToUpdate as { [x: string]: any; });
    };
    const deleteRoutine = async (routineId: number) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'routines', routineId.toString()));
        } catch (error) {
            console.error("Error deleting routine:", error);
        }
    };
    const addPulseLog = async (logData: Omit<PulseLog, 'id'>) => {
        await addDoc(collection(db, 'pulseLogs'), logData);
    };
    const addPulse = async (pulseData: Omit<Pulse, 'id'>): Promise<number | undefined> => {
        if (!currentUser) return undefined;
        const newId = Date.now();
        const newPulseData = {
            ...pulseData,
            id: newId,
            creator_id: currentUser.id,
            streak: 0,
            last_activity_date: null
        };
        await setDoc(doc(db, 'pulses', newId.toString()), newPulseData);
        await updateAsclepioScore('CREATE_PULSE');
        return newId;
    };
    const acceptPulseInvite = async (pulseId: number, userId: number, goals: PulseExerciseGoal[]) => {
        const pulseDocRef = doc(db, 'pulses', pulseId.toString());
        const newParticipant: PulseParticipant = { user_id: userId, goals, progress: 0, last_logged_stats: {} };
        await updateDoc(pulseDocRef, {
            invited_ids: arrayRemove(userId),
            participants: arrayUnion(newParticipant)
        });
        await updateAsclepioScore('JOIN_PULSE');
    };
    const updatePulseParticipantGoals = async (pulseId: number, userId: number, goals: PulseExerciseGoal[]) => {
        const pulse = pulses.find(p => p.id === pulseId);
        if (!pulse || !pulse.participants) return;
        const updatedParticipants = pulse.participants.map(p =>
            p.user_id === userId ? { ...p, goals: goals } : p
        );
        await updateDoc(doc(db, 'pulses', pulseId.toString()), { participants: updatedParticipants });
    };
    const updatePulseProgress = async (pulseId: number, userId: number, exerciseLogs: PulseExerciseLog[], routine: Routine) => {
        const pulse = pulses.find(p => p.id === pulseId);
        if (!pulse || !pulse.participants) return;
        
        // Step 1: Log personal activity for the user. This updates their individual streak.
        await logUserActivity();

        // Step 2: Calculate progress for the participant in the Pulse.
        const participant = pulse.participants.find(p => p.user_id === userId);
        if (!participant) return;
        let totalProgressScore = 0;
        let exerciseCount = 0;
        const updatedLastLoggedStats = { ...participant.last_logged_stats };
        exerciseLogs.forEach(log => {
            const goal = participant.goals.find(g => g.exercise_id === log.exercise_id);
            const baseEx = routine.routineDays.flatMap(d => d.exercises).find(e => e.id === log.exercise_id);
            if (goal && baseEx && baseEx.objetivo_peso > 0 && goal.objetivo_peso > baseEx.objetivo_peso) {
                const baseVolume = baseEx.objetivo_peso * baseEx.objetivo_reps;
                const goalVolume = goal.objetivo_peso * goal.objetivo_reps;
                const loggedVolume = log.logged_peso * log.logged_reps;
                const progress = (loggedVolume - baseVolume) / (goalVolume - baseVolume);
                totalProgressScore += Math.max(0, Math.min(1, progress));
                exerciseCount++;
            } else if (goal && baseEx && baseEx.objetivo_peso > 0) { // Handle cases where goal is not higher than base
                totalProgressScore += (log.logged_peso >= goal.objetivo_peso) ? 1 : 0;
                exerciseCount++;
            }
            updatedLastLoggedStats[log.exercise_id] = { peso: log.logged_peso, series: log.logged_series, reps: log.logged_reps };
        });
        const overallProgress = exerciseCount > 0 ? (totalProgressScore / exerciseCount) * 100 : participant.progress;
        const updatedParticipants = pulse.participants.map(p => 
            p.user_id === userId ? { ...p, progress: overallProgress, last_logged_stats: updatedLastLoggedStats } : p
        );

        // Step 3: Handle Pulse streak logic.
        const pulseDocRef = doc(db, 'pulses', pulseId.toString());
        const today = new Date().toISOString().split('T')[0];
        let pulseUpdates: { [key: string]: any } = { participants: updatedParticipants };

        // Only check to update streak if it hasn't been updated today already
        if (pulse.last_activity_date !== today) {
            const logsForTodayQuery = query(
                collection(db, 'pulseLogs'),
                where('pulse_id', '==', pulseId),
                where('date', '==', today)
            );
            const logsSnapshot = await getDocs(logsForTodayQuery);
            const uniqueUserIdsToday = new Set(logsSnapshot.docs.map(d => d.data().user_id));
            uniqueUserIdsToday.add(userId);

            if (uniqueUserIdsToday.size >= 2) {
                const newPulseStreak = (pulse.streak || 0) + 1;
                pulseUpdates.streak = increment(1);
                pulseUpdates.last_activity_date = today;
                
                if (newPulseStreak > 0 && newPulseStreak % 5 === 0) {
                    setStreakMilestone({ type: 'pulse', days: newPulseStreak, pulseName: pulse.name });
                }
            }
        }
        
        await updateDoc(pulseDocRef, pulseUpdates);
    };
    const leavePulse = async (pulseId: number) => {
        if (!currentUser) return;
        const pulse = pulses.find(p => p.id === pulseId);
        if (!pulse) return;
        const updatedParticipants = pulse.participants.filter(p => p.user_id !== currentUser.id);
        await updateDoc(doc(db, 'pulses', pulseId.toString()), { participants: updatedParticipants });
    };
    const deletePulse = async (pulseId: number) => {
        if (!currentUser) return;
        const pulse = pulses.find(p => p.id === pulseId);
        if (!pulse || pulse.creator_id !== currentUser.id) return;
        await deleteDoc(doc(db, 'pulses', pulseId.toString()));
    };
    const logUserActivity = async () => {
        if (!currentUser) return;
        const today = new Date().toISOString().split('T')[0];

        // Prevent double logging on the same day for personal streak
        if (currentUser.last_personal_activity_date === today) {
            console.log("Personal activity already logged today.");
            return;
        }

        const userDocRef = doc(db, 'users', currentUser.id.toString());
        const newStreak = (currentUser.current_streak || 0) + 1;
        
        await updateDoc(userDocRef, {
            current_streak: increment(1),
            last_personal_activity_date: today
        });
        
        if (newStreak > 0 && newStreak % 5 === 0) {
            setStreakMilestone({ type: 'personal', days: newStreak });
        }
        if (newStreak === 4) {
            await updateAsclepioScore('STREAK_4_DAYS');
        } else if (newStreak === 30) {
            await updateAsclepioScore('STREAK_30_DAYS');
        }
    };
    const getChatMessages = (routineId: number, callback: (messages: ChatMessage[]) => void) => {
        const q = query(collection(db, `routine_chats/${routineId}/messages`), orderBy('timestamp', 'asc'));
        return onSnapshot(q, snapshot => callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))));
    };
    const sendChatMessage = async (routineId: number, text: string) => {
        if (!currentUser || !text.trim()) return;
        await addDoc(collection(db, `routine_chats/${routineId}/messages`), {
            routine_id: routineId,
            sender_id: currentUser.id,
            text: text.trim(),
            timestamp: Timestamp.now(),
        });
    };

    // Direct Chat functions
    const getOrCreateChatRoom = async (otherUserId: number, fromUserId?: number): Promise<string | null> => {
        const currentUserId = fromUserId !== undefined ? fromUserId : currentUser?.id;

        if (currentUserId === undefined) {
             return null;
        }
        
        const participants = [currentUserId, otherUserId].sort((a, b) => a - b);
        const q = query(
            collection(db, 'direct_chats'),
            where('participant_ids', '==', participants),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs[0].id;
        } else {
            const expiresAt = Timestamp.fromMillis(Date.now() + 42 * 60 * 60 * 1000);
            const newRoom: Omit<ChatRoom, 'id'> = {
                participant_ids: participants,
                last_updated: Timestamp.now(),
                unread_counts: { [currentUserId]: 0, [otherUserId]: 0 },
                expiresAt,
            };
            const docRef = await addDoc(collection(db, 'direct_chats'), newRoom);
            return docRef.id;
        }
    };
    
    const getDirectChatMessages = (chatRoomId: string, callback: (messages: DirectChatMessage[]) => void) => {
        const q = query(collection(db, `direct_chats/${chatRoomId}/messages`), orderBy('timestamp', 'asc'));
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectChatMessage));
            callback(messages);
        });
    };

    const sendDirectChatMessage = async (chatRoomId: string, type: 'text' | 'image' | 'sticker', content: string) => {
        if (!currentUser || !content.trim()) return;
        const message: Omit<DirectChatMessage, 'id'> = {
            chat_room_id: chatRoomId,
            sender_id: currentUser.id,
            timestamp: Timestamp.now(),
            type,
            content
        };
        await addDoc(collection(db, `direct_chats/${chatRoomId}/messages`), message);
        
        const room = chatRooms.find(r => r.id === chatRoomId);
        if (room) {
            const otherUserId = room.participant_ids.find(id => id !== currentUser.id);
            if (otherUserId) {
                 await updateDoc(doc(db, 'direct_chats', chatRoomId), {
                    last_updated: serverTimestamp(),
                    last_message: {
                        content: type === 'text' ? content : type === 'image' ? '[Imagen]' : '[Sticker]',
                        sender_id: currentUser.id,
                        timestamp: Timestamp.now(),
                    },
                    [`unread_counts.${otherUserId}`]: increment(1)
                });
            }
        }
    };
    
    const uploadImageForChat = async (file: File): Promise<string | null> => {
        try {
            const fileName = `chat_images/${Date.now()}-${file.name}`;
            const storageRef = ref(storage, fileName);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading image:", error);
            return null;
        }
    };

    const updateProfilePicture = async (url: string) => {
        if (!currentUser) return;
        try {
            await updateUser({ foto_url: url });
        } catch (error) {
            console.error("Error updating profile picture:", error);
        }
    };

    const uploadProfilePictureFromFile = async (file: File): Promise<string | null> => {
        if (!currentUser) return null;
        try {
            const fileName = `profile_pictures/${currentUser.id}-${Date.now()}`;
            const storageRef = ref(storage, fileName);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            // Atomically update the profile after getting the URL
            await updateUser({ foto_url: downloadURL });
            return downloadURL;
        } catch (error) {
            console.error("Error uploading profile picture file:", error);
            return null;
        }
    };

    const markChatRoomAsRead = async (chatRoomId: string) => {
        if (!currentUser) return;
        const userIdStr = currentUser.id.toString();
        await updateDoc(doc(db, 'direct_chats', chatRoomId), {
            [`unread_counts.${userIdStr}`]: 0
        });
    };

    // Group Chat functions
    const createGroupChat = async (data: Omit<GroupChatRoom, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, 'group_chats'), data);
            return docRef.id;
        } catch (error) {
            console.error("Error creating group chat:", error);
            return null;
        }
    };
    const getGroupChatMessages = (roomId: string, callback: (messages: GroupChatMessage[]) => void) => {
        const q = query(collection(db, `group_chats/${roomId}/messages`), orderBy('timestamp', 'asc'));
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupChatMessage));
            callback(messages);
        });
    };
    const sendGroupChatMessage = async (roomId: string, type: 'text' | 'image' | 'sticker', content: string) => {
        if (!currentUser || !content.trim()) return;
        const message: Omit<GroupChatMessage, 'id'> = {
            group_chat_room_id: roomId,
            sender_id: currentUser.id,
            timestamp: Timestamp.now(),
            type,
            content
        };
        await addDoc(collection(db, `group_chats/${roomId}/messages`), message);
        
        const room = groupChatRooms.find(r => r.id === roomId);
        if (room) {
            const updates: { [key: string]: any } = {
                last_updated: serverTimestamp(),
                last_message: {
                    content: type === 'text' ? content : type === 'image' ? '[Imagen]' : '[Sticker]',
                    sender_id: currentUser.id,
                    sender_name: currentUser.nombre,
                    timestamp: Timestamp.now(),
                },
            };
            room.participant_ids.forEach(id => {
                if (id !== currentUser.id) {
                    updates[`unread_counts.${id}`] = increment(1);
                }
            });
            await updateDoc(doc(db, 'group_chats', roomId), updates);
        }
    };
    const updateGroupInfo = async (roomId: string, data: { name: string; description: string; color?: string }) => {
        await updateDoc(doc(db, 'group_chats', roomId), data as { [x: string]: any });
    };
    const addParticipantsToGroup = async (roomId: string, userIds: number[]) => {
        const roomDocRef = doc(db, 'group_chats', roomId);
        const updates: { [key: string]: any } = {
            participant_ids: arrayUnion(...userIds)
        };
        userIds.forEach(id => {
            updates[`unread_counts.${id}`] = 0;
        });
        await updateDoc(roomDocRef, updates);
    };
    const leaveGroup = async (roomId: string) => {
        if (!currentUser) return;
        const roomDocRef = doc(db, 'group_chats', roomId);
        await updateDoc(roomDocRef, {
            participant_ids: arrayRemove(currentUser.id)
        });
    };
    const deleteGroup = async (roomId: string) => {
        // This is a simplified deletion. For a production app, deleting all sub-collection messages would be needed.
        await deleteDoc(doc(db, 'group_chats', roomId));
    };

    const markGroupChatAsRead = async (roomId: string) => {
        if (!currentUser) return;
        const userIdStr = currentUser.id.toString();
        await updateDoc(doc(db, 'group_chats', roomId), {
            [`unread_counts.${userIdStr}`]: 0
        });
    };


    // Admin functions
    const suspendUser = async (userId: number, reason: string) => {
        await updateDoc(doc(db, 'users', userId.toString()), { isSuspended: true, suspensionReason: reason });
    };

    const unsuspendUser = async (userId: number) => {
        await updateDoc(doc(db, 'users', userId.toString()), { isSuspended: false, suspensionReason: '' });
    };
    
    const adminDeleteUser = async (userId: number) => {
        await deleteDoc(doc(db, 'users', userId.toString()));
    };

    const adminUpdateUserStats = async (userId: number, stats: { asclepio_score?: number, current_streak?: number }) => {
        const updates: { [key: string]: any } = {};
        if (stats.asclepio_score !== undefined) {
            updates.asclepio_score = Number(stats.asclepio_score);
        }
        if (stats.current_streak !== undefined) {
            updates.current_streak = Number(stats.current_streak);
        }
        if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, 'users', userId.toString()), updates);
        }
    };
    
    const sendSupportMessage = async (userIds: number[], text: string) => {
        if (!text.trim()) return;
        const supportUserId = 0;
    
        for (const userId of userIds) {
            const chatRoomId = await getOrCreateChatRoom(userId, supportUserId);
            if (chatRoomId) {
                const message: Omit<DirectChatMessage, 'id'> = {
                    chat_room_id: chatRoomId,
                    sender_id: supportUserId,
                    timestamp: Timestamp.now(),
                    type: 'text',
                    content: text.trim()
                };
                await addDoc(collection(db, `direct_chats/${chatRoomId}/messages`), message);
                
                await updateDoc(doc(db, 'direct_chats', chatRoomId), {
                    last_updated: serverTimestamp(),
                    last_message: {
                        content: text.trim(),
                        sender_id: supportUserId,
                        timestamp: Timestamp.now(),
                    },
                    [`unread_counts.${userId}`]: increment(1)
                });
            }
        }
    };


    const addAnnouncement = async (data: Omit<Announcement, 'id' | 'createdAt'>) => {
        await addDoc(collection(db, 'announcements'), { ...data, createdAt: Timestamp.now() });
    };
    
    const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
        await updateDoc(doc(db, 'announcements', id), data);
    };

    const deleteAnnouncement = async (id: string) => {
        await deleteDoc(doc(db, 'announcements', id));
    };


    const value = {
        users, currentUser, routines, pulses, pulseLogs, announcements, login, logout, followRoutine, unfollowRoutine,
        toggleActiveRoutine, addRoutine, updateRoutine, deleteRoutine, addPulseLog, createUser, updateUser, deleteUserAccount,
        addPulse, acceptPulseInvite, updatePulseProgress, leavePulse, deletePulse, logUserActivity, getChatMessages, 
        sendChatMessage, loading, updatePulseParticipantGoals, suspendUser, unsuspendUser, adminDeleteUser,
        adminUpdateUserStats, sendSupportMessage,
        addAnnouncement, updateAnnouncement, deleteAnnouncement,
        scoreUpdate, clearScoreUpdate,
        streakMilestone, clearStreakMilestone,
        levelUp, clearLevelUp,
        chatRooms, groupChatRooms, totalUnreadCount, getOrCreateChatRoom, getDirectChatMessages, sendDirectChatMessage, uploadImageForChat, markChatRoomAsRead,
        updateProfilePicture, uploadProfilePictureFromFile, createGroupChat, getGroupChatMessages, sendGroupChatMessage, updateGroupInfo, addParticipantsToGroup, leaveGroup, deleteGroup,
        markGroupChatAsRead,
    };
    
    if (loading) {
        return <div className="bg-graphite text-white min-h-screen flex items-center justify-center"><p>Cargando ASCLEPIO...</p></div>;
    }

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) throw new Error('useUser must be used within a UserProvider');
    return context;
};