// app/profile/page.tsx
'use client';

import { useAppData } from '@/context/AppDataProvider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
    const { data, updateProfile, isLoading } = useAppData();
    const [newWeight, setNewWeight] = useState<number | string>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Розрахунок статистики
    const stats = useMemo(() => {
        if (!data?.profile || !data.sessions) return null;

        const totalWorkouts = data.sessions.length;
        const totalTime = data.sessions.reduce((sum, s) => sum + (s.totalTime || 0), 0);

        // Приклад: скільки разів тренували кожну групу
        const groupCounts = data.sessions.reduce((counts, s) => {
            counts[s.muscleGroupId] = (counts[s.muscleGroupId] || 0) + 1;
            return counts;
        }, {} as Record<string, number>);

        return { totalWorkouts, totalTime, groupCounts };
    }, [data]);

    if (isLoading) return <div className="p-10 text-center">Завантаження профілю...</div>;
    if (!data?.profile) return <div className="p-10 text-center">Профіль не знайдено.</div>;

    const { profile } = data;

    // Логіка оновлення ваги
    const handleWeightUpdate = async () => {
        const weightValue = parseFloat(newWeight as string);
        if (weightValue > 0) {
            const updatedProfile = { ...profile, currentWeight: weightValue };
            await updateProfile(updatedProfile);
            setNewWeight('');
            setIsDialogOpen(false);
        }
    };

    const weightDifference = profile.currentWeight - profile.initialWeight;
    const progressToTarget = profile.currentWeight - profile.targetWeight;

    // Перевірка на пропозицію оновлення ваги (раз на 10 тренувань)
    const isWeightUpdateSuggested = stats && stats.totalWorkouts > 0 && stats.totalWorkouts % 10 === 0;

    return (
        <main className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">📊 Мій Профіль та Статистика</h1>

            {/* Пропозиція оновлення ваги */}
            {isWeightUpdateSuggested && (
                <Alert className="mb-6 border-yellow-500 bg-yellow-50">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Настав час оновити дані!</AlertTitle>
                    <AlertDescription>
                        Ви провели {stats?.totalWorkouts} тренувань. Будь ласка, оновіть вашу поточну вагу.
                    </AlertDescription>
                </Alert>
            )}

            {/* Діалог оновлення ваги */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="mb-6">Оновити поточну вагу</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>Оновлення Ваги</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="current-weight" className="text-right">Поточна вага (кг)</Label>
                            <Input
                                id="current-weight"
                                type="number"
                                defaultValue={profile.currentWeight}
                                onChange={e => setNewWeight(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <Button onClick={handleWeightUpdate}>Зберегти зміни</Button>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Картка Профілю */}
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle>Особисті дані</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Імʼя:</strong> {profile.name}</p>
                        <p><strong>Зріст:</strong> {profile.height} см</p>
                        <p><strong>Початкова вага:</strong> {profile.initialWeight} кг</p>
                        <p><strong>Поточна вага:</strong> {profile.currentWeight} кг</p>
                        <p><strong>Цільова вага:</strong> {profile.targetWeight} кг</p>
                        <p>
                            <strong>Зміни ваги:</strong>
                            <Badge variant={weightDifference >= 0 ? 'destructive' : 'default'} className="ml-2">
                                {weightDifference > 0 ? `+${weightDifference.toFixed(1)} кг` : `${weightDifference.toFixed(1)} кг`}
                            </Badge>
                        </p>
                        <p>
                            <strong>Прогрес до цілі:</strong>
                            <Badge variant={progressToTarget > 0 ? 'destructive' : 'default'} className="ml-2">
                                {progressToTarget.toFixed(1)} кг до цілі
                            </Badge>
                        </p>
                    </CardContent>
                </Card>

                {/* Картка Загальної статистики */}
                <Card className="md:col-span-2">
                    <CardHeader><CardTitle>Загальна статистика</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-2xl font-bold">{stats?.totalWorkouts ?? 0}</p>
                            <p className="text-sm text-gray-500">Завершених тренувань</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{(stats?.totalTime / 60).toFixed(1) ?? 0} год</p>
                            <p className="text-sm text-gray-500">Загальний час тренувань</p>
                        </div>
                        {/* Додайте графік прогресу ваги тут */}
                    </CardContent>
                </Card>

                {/* Картка Історії */}
                <Card className="md:col-span-3">
                    <CardHeader><CardTitle>Історія тренувань</CardTitle></CardHeader>
                    <CardContent>
                        {data.sessions.length === 0 ? (
                            <CardDescription>Поки що немає завершених тренувань. Час почати!</CardDescription>
                        ) : (
                            <div className="space-y-4">
                                {data.sessions.slice(-5).reverse().map((session) => ( // Останні 5
                                    <div key={session.id} className="border p-3 rounded-md hover:bg-gray-50 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{session.workoutId} ({session.muscleGroupId})</p>
                                            <p className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()} | {session.totalTime} хв</p>
                                        </div>
                                        <Link href={`/session/${session.id}`}><Button variant="link">Деталі</Button></Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end mt-8">
                <Link href="/"><Button variant="secondary">На головну</Button></Link>
            </div>
        </main>
    );
}