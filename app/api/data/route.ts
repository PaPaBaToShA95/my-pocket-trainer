// app/api/data/route.ts
import { NextResponse } from 'next/server';
import { del, put, get } from '@vercel/blob';
import { AppData } from '@/lib/types'; // Припустимо, ви створили lib/types.ts

const BLOB_FILENAME = 'trainer-data.json';

// Функція для отримання даних
export async function GET() {
    try {
        const blob = await get(BLOB_FILENAME);
        const data = await blob.json() as AppData;
        return NextResponse.json(data);
    } catch (error) {
        // Якщо файл не знайдено, повертаємо початкову структуру
        console.log("Blob file not found, returning default structure.");
        const defaultData: AppData = { profile: null, sessions: [] };
        return NextResponse.json(defaultData);
    }
}

// Функція для збереження даних (оновлення)
export async function POST(request: Request) {
    try {
        const data = await request.json() as AppData;
        // Оновлення/створення файлу в Blob
        const blob = await put(BLOB_FILENAME, JSON.stringify(data), {
            access: 'public', // Можна зробити приватним, якщо використовуєте Server Actions
            addRandomSuffix: false,
            contentType: 'application/json',
        });

        return NextResponse.json({ success: true, url: blob.url });
    } catch (error) {
        console.error('Error saving data to Vercel Blob:', error);
        return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
}