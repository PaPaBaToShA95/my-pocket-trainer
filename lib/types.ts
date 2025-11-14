// lib/types.ts

export type UserProfile = {
    name: string;
    initialWeight: number;
    currentWeight: number;
    height: number;
    gender: 'male' | 'female' | 'other';
    targetWeight: number;
};

export type SetData = {
    weight: number | null; // Вага в кг
    reps: number; // Кількість повторень
    isMaxReps: boolean; // Чи був це підхід "на максимум"
};

export type ExerciseLog = {
    exerciseName: string;
    sets: SetData[];
    note?: string;
};

export type RunData = {
    speed: number; // Швидкість (км/год)
    time: number; // Час (хвилини)
    distance: number; // Відстань (км) - розраховується
};

export type SessionLog = {
    id: string; // UUID для сесії
    date: number; // Timestamp
    muscleGroupId: string;
    workoutId: string;
    warmUpRun?: RunData;
    coolDownRun?: RunData;
    exercisesLog: ExerciseLog[];
    totalTime: number; // Загальний час тренування
};

export type AppData = {
    profile: UserProfile | null;
    sessions: SessionLog[];
};