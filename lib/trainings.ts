// lib/trainings.ts
export type Exercise = {
    name: string;
    defaultWeight: number | null; // null для вправ без ваги (наприклад, турник, бігова доріжка)
    isMaxReps: boolean; // чи останній підхід завжди на максимум
};

export type Workout = {
    id: string;
    name: string;
    exercises: Exercise[];
};

export type MuscleGroup = {
    id: string;
    name: string;
    icon: string; // Emoji
    workouts: Workout[];
};

export const TRAINING_DATA: MuscleGroup[] = [
    {
        id: 'back',
        name: 'Спина',
        icon: '💪',
        workouts: [
            {
                id: 'back-1',
                name: 'Тренування 1',
                exercises: [
                    { name: 'Станова тяга', defaultWeight: 60, isMaxReps: false },
                    { name: 'Турник', defaultWeight: null, isMaxReps: true },
                    { name: 'Пулловер', defaultWeight: 15, isMaxReps: false },
                ],
            },
            // ... інші тренування для спини
        ],
    },
    {
        id: 'chest',
        name: 'Груди',
        icon: '🔥',
        workouts: [
            // ... тренування для грудей
        ]
    }
    // ... інші групи м'язів (Ноги, Руки, Плечі)
];