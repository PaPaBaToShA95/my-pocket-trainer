// app/page.tsx
'use client';
import { useAppData } from '@/context/AppDataProvider';
import { TRAINING_DATA } from '@/lib/trainings';
import OnboardingForm from '@/components/OnboardingForm';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { data, isLoading, error } = useAppData();

  if (isLoading) {
    return <div className="p-10 text-center">Завантаження даних...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">Помилка: {error}</div>;
  }

  // Логіка Onboarding
  if (!data?.profile) {
    return <OnboardingForm />;
  }

  // Головне меню
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">👋 Привіт, {data.profile.name}!</h1>
      <p className="mb-6 text-lg text-gray-500">Обери групу м'язів для тренування:</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {TRAINING_DATA.map(group => (
          <Link key={group.id} href={`/workouts/${group.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer aspect-square flex flex-col justify-center items-center p-4">
              <div className="text-6xl mb-2">{group.icon}</div>
              <CardTitle className="text-center">{group.name}</CardTitle>
              <CardDescription className="text-center">
                {group.workouts.length} тренувань
              </CardDescription>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-8 space-x-4">
        <Link href="/profile"><Button variant="outline">📊 Мій Профіль</Button></Link>
      </div>
    </main>
  );
}