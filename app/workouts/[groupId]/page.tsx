// app/workouts/[groupId]/page.tsx
import { TRAINING_DATA } from '@/lib/trainings';
import { Workout } from '@/lib/trainings';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area'; // Додайте scroll-area через shadcn

interface WorkoutPageProps {
    params: { groupId: string };
}

export default function WorkoutsPage({ params }: WorkoutPageProps) {
    const muscleGroup = TRAINING_DATA.find(g => g.id === params.groupId);

    if (!muscleGroup) {
        return <div className="p-10 text-center">Групу м'язів не знайдено.</div>;
    }

    return (
        <main className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">{muscleGroup.icon} Тренування на {muscleGroup.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {muscleGroup.workouts.map(workout => (
                    <Card key={workout.id}>
                        <CardHeader>
                            <CardTitle>{workout.name}</CardTitle>
                            <CardDescription>Включає {workout.exercises.length} вправ.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">

                            {/* Попередній перегляд */}
                            <WorkoutPreviewDialog workout={workout} />

                            {/* Почати тренування */}
                            <Link href={`/workout/${workout.id}/start`}>
                                <Button>Почати</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    );
}

// Компонент для діалогового вікна попереднього перегляду
function WorkoutPreviewDialog({ workout }: { workout: Workout }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Попередній перегляд</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{workout.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <h4 className="font-semibold mb-2">Список вправ:</h4>
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                        <ol className="list-decimal pl-5 space-y-2">
                            {workout.exercises.map((ex, index) => (
                                <li key={index}>
                                    {ex.name}
                                    {ex.isMaxReps && <span className="text-xs text-red-500 ml-2">(Max повторів)</span>}
                                    {ex.defaultWeight !== null && <span className="text-xs text-gray-500 ml-2">({ex.defaultWeight}кг)</span>}
                                </li>
                            ))}
                        </ol>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}