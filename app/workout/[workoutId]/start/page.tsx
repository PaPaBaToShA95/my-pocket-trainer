// app/workout/[workoutId]/start/page.tsx
'use client';
import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TRAINING_DATA, Exercise, Workout } from '@/lib/trainings';
import { SessionLog, SetData, ExerciseLog, RunData } from '@/lib/types';
import { useAppData } from '@/context/AppDataProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// --- Типи для стану сторінки ---
type WorkoutStage = 'warmup' | 'exercises' | 'cooldown' | 'complete';
type ExerciseSetState = { weight: number | null; reps: number | string; isMax: boolean };
type ExerciseLogState = ExerciseLog & { currentSet: ExerciseSetState; history: SetData[] };

export default function StartWorkoutPage() {
    const params = useParams();
    const router = useRouter();
    const { addSession, data } = useAppData();
    const [stage, setStage] = useState<WorkoutStage>('warmup');
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

    // Дані для логування
    const [warmUpRun, setWarmUpRun] = useState<RunData | undefined>(undefined);
    const [coolDownRun, setCoolDownRun] = useState<RunData | undefined>(undefined);
    const [exercisesLog, setExercisesLog] = useState<ExerciseLogState[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const workoutId = Array.isArray(params.workoutId) ? params.workoutId[0] : params.workoutId;

    // Визначення поточної тренування та групи м'язів
    const workout: Workout | undefined = useMemo(() => {
        for (const group of TRAINING_DATA) {
            const found = group.workouts.find(w => w.id === workoutId);
            if (found) return found;
        }
        return undefined;
    }, [workoutId]);

    const muscleGroupId: string | undefined = useMemo(() => {
        for (const group of TRAINING_DATA) {
            if (group.workouts.find(w => w.id === workoutId)) return group.id;
        }
        return undefined;
    }, [workoutId]);

    // Ініціалізація стану вправ
    useEffect(() => {
        if (workout && exercisesLog.length === 0) {
            const initialLog = workout.exercises.map(ex => ({
                exerciseName: ex.name,
                sets: [], // Зберігаємо тут лише завершені підходи
                history: [], // Локальна історія для UI
                currentSet: {
                    weight: ex.defaultWeight,
                    reps: '',
                    isMax: ex.isMaxReps
                },
            }));
            setExercisesLog(initialLog);
        }
        setSessionStartTime(Date.now()); // Початок сесії
    }, [workout, exercisesLog.length]);


    if (!workout || !muscleGroupId) {
        return <div className="p-10 text-center">Тренування не знайдено.</div>;
    }

    // Функція додавання підходу
    const addSetToExercise = (exerciseIndex: number) => {
        setExercisesLog(prevLogs => {
            const newLogs = [...prevLogs];
            const log = newLogs[exerciseIndex];

            // Валідація
            if (log.currentSet.weight === null && log.currentSet.reps === '') return prevLogs;

            const newSet: SetData = {
                weight: log.currentSet.weight,
                reps: typeof log.currentSet.reps === 'string' ? parseInt(log.currentSet.reps) : log.currentSet.reps,
                isMaxReps: log.currentSet.isMax,
            };

            // Додаємо підхід до логу та історії
            log.sets.push(newSet);
            log.history.push(newSet);

            // Скидаємо/оновлюємо форму для наступного підходу
            const currentEx = workout.exercises[exerciseIndex];
            log.currentSet = {
                weight: log.currentSet.weight, // Зберігаємо попередню вагу
                reps: '',
                isMax: currentEx.isMaxReps && log.sets.length >= 2, // Наприклад, останній підхід - max
            };

            return newLogs;
        });
    };

    // Функція завершення тренування
    const completeSession = async () => {
        if (!data?.profile || !sessionStartTime || isSaving) return;
        setIsSaving(true);

        const totalTime = Math.round((Date.now() - sessionStartTime) / 60000); // Час у хвилинах

        // Очищаємо від локальної історії history
        const finalExercisesLog: ExerciseLog[] = exercisesLog.map(log => ({
            exerciseName: log.exerciseName,
            sets: log.sets,
            note: log.note,
        }));

        const newSession: SessionLog = {
            id: uuidv4(),
            date: Date.now(),
            muscleGroupId: muscleGroupId,
            workoutId: workoutId,
            warmUpRun: warmUpRun,
            coolDownRun: coolDownRun,
            exercisesLog: finalExercisesLog,
            totalTime: totalTime,
        };

        await addSession(newSession);
        setIsSaving(false);
        setStage('complete');
    };

    // --- Рендер різних етапів ---

    // 1. Бігова доріжка (Розминка/Заминка)
    const renderRunStage = (stageName: 'warmup' | 'cooldown', setRunData: (data: RunData) => void, nextStage: WorkoutStage) => {
        const [speed, setSpeed] = useState(0);
        const [time, setTime] = useState(10); // 10 хв за замовчуванням
        const distance = (speed * time / 60).toFixed(2); // Відстань = Швидкість * (Час/60)

        const handleNext = () => {
            setRunData({ speed, time, distance: parseFloat(distance) });
            setStage(nextStage);
        };

        return (
            <Card className="max-w-xl mx-auto mt-10">
                <CardHeader><CardTitle>{stageName === 'warmup' ? '🏃 Розминка (Бігова Доріжка)' : '🧘 Заминка (Бігова Доріжка)'}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <p>Вкажіть параметри {stageName === 'warmup' ? 'розминки' : 'затяжки'} перед початком {stageName === 'warmup' ? 'вправ' : 'аналізу'}.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="speed">Швидкість (км/год)</Label>
                            <Input id="speed" type="number" value={speed} onChange={e => setSpeed(parseFloat(e.target.value) || 0)} />
                        </div>
                        <div>
                            <Label htmlFor="time">Час (хвилини)</Label>
                            <Input id="time" type="number" value={time} onChange={e => setTime(parseFloat(e.target.value) || 0)} />
                        </div>
                    </div>
                    <Alert><Terminal className="h-4 w-4" /><AlertTitle>Розрахунок</AlertTitle><AlertDescription>Пройдена відстань: **{distance} км**</AlertDescription></Alert>
                    <Button onClick={handleNext} className="w-full">
                        {stageName === 'warmup' ? 'Почати тренування' : 'Завершити тренування'}
                    </Button>
                </CardContent>
            </Card>
        );
    };

    // 2. Вправи
    const renderExercisesStage = () => {
        const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
        const currentExLog = exercisesLog[activeExerciseIndex];
        const currentExDefinition = workout.exercises[activeExerciseIndex];

        const updateCurrentSet = (field: 'weight' | 'reps' | 'isMax', value: number | string | boolean) => {
            setExercisesLog(prevLogs => {
                const newLogs = [...prevLogs];
                const log = newLogs[activeExerciseIndex];
                if (field === 'weight') log.currentSet.weight = typeof value === 'number' ? value : parseFloat(value as string) || null;
                if (field === 'reps') log.currentSet.reps = value;
                if (field === 'isMax') log.currentSet.isMax = value as boolean;
                return newLogs;
            });
        };

        return (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-6">🏋️ Тренування: {workout.name}</h2>
                <Tabs value={currentExDefinition.name} onValueChange={(name) => setActiveExerciseIndex(workout.exercises.findIndex(e => e.name === name))}>
                    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                        <TabsList>
                            {workout.exercises.map((ex, index) => (
                                <TabsTrigger key={ex.name} value={ex.name}>
                                    {index + 1}. {ex.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </ScrollArea>

                    {workout.exercises.map((ex, index) => (
                        <TabsContent key={ex.name} value={ex.name} className="mt-4">
                            <Card>
                                <CardHeader><CardTitle>{ex.name}</CardTitle></CardHeader>
                                <CardContent>
                                    {/* Форма для нового підходу */}
                                    <div className="flex space-x-4 mb-4 items-end">
                                        {ex.defaultWeight !== null && (
                                            <div className="flex-grow">
                                                <Label htmlFor="weight">Вага (кг)</Label>
                                                <Input id="weight" type="number" value={currentExLog.currentSet.weight ?? ''} onChange={e => updateCurrentSet('weight', e.target.value)} />
                                            </div>
                                        )}
                                        <div className="flex-grow">
                                            <Label htmlFor="reps">Повторення</Label>
                                            <Input id="reps" type="text" placeholder={currentExLog.currentSet.isMax ? 'МАКС' : '10-12'} value={currentExLog.currentSet.reps} onChange={e => updateCurrentSet('reps', e.target.value)} />
                                        </div>
                                        {/* Максимум повторень */}
                                        <Button
                                            type="button"
                                            variant={currentExLog.currentSet.isMax ? 'destructive' : 'outline'}
                                            onClick={() => updateCurrentSet('isMax', !currentExLog.currentSet.isMax)}
                                        >
                                            {currentExLog.currentSet.isMax ? 'MAX ВКЛ' : 'MAX ВИМК'}
                                        </Button>
                                        <Button onClick={() => addSetToExercise(index)}>Додати підхід</Button>
                                    </div>

                                    {/* Історія підходів */}
                                    <h4 className="font-semibold mt-6 mb-2">Завершені підходи ({currentExLog.sets.length}):</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>#</TableHead>
                                                <TableHead>Вага (кг)</TableHead>
                                                <TableHead>Повторення</TableHead>
                                                <TableHead>Режим</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentExLog.sets.map((set, setIndex) => (
                                                <TableRow key={setIndex}>
                                                    <TableCell>{setIndex + 1}</TableCell>
                                                    <TableCell>{set.weight ?? 'N/A'}</TableCell>
                                                    <TableCell>{set.reps}</TableCell>
                                                    <TableCell>{set.isMaxReps ? 'MAX' : 'Звичайний'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
                <Button className="mt-8 w-full" onClick={() => setStage('cooldown')}>
                    Перейти до заминки
                </Button>
            </div>
        );
    };

    // 3. Завершення
    const renderCompleteStage = () => (
        <Card className="max-w-xl mx-auto mt-20 text-center">
            <CardHeader><CardTitle>✅ Тренування завершено!</CardTitle></CardHeader>
            <CardContent>
                <p className="text-lg mb-4">Ваші дані успішно збережено.</p>
                <Button onClick={() => router.push('/')} className="mr-2" disabled={isSaving}>На головну</Button>
                <Button variant="outline" onClick={() => router.push('/profile')} disabled={isSaving}>Переглянути статистику</Button>
            </CardContent>
        </Card>
    );

    // --- Основний рендер ---

    switch (stage) {
        case 'warmup':
            return renderRunStage('warmup', setWarmUpRun, 'exercises');
        case 'exercises':
            return renderExercisesStage();
        case 'cooldown':
            return renderRunStage('cooldown', setCoolDownRun, 'complete');
        case 'complete':
            return renderCompleteStage();
        default:
            return null;
    }
}