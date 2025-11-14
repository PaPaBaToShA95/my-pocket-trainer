// app/api/data/route.ts
import { NextResponse } from 'next/server';
import { put, head, del } from '@vercel/blob'; // Змінено: 'get' видалено, 'head' додано
import { AppData } from '@/lib/types';

const BLOB_FILENAME = 'trainer-data.json';

// Функція для отримання даних
export async function GET() {
    try {
        // 1. Використовуємо head для перевірки існування та отримання URL
        // Це викине помилку 404, якщо файл не знайдено, що ми перехопимо в catch
        const blob = await head(BLOB_FILENAME);

        // 2. Якщо файл існує, отримуємо дані за його URL
        const response = await fetch(blob.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch blob data: ${response.statusText}`);
        }
        const data = await response.json() as AppData;

        return NextResponse.json(data);

    } catch (error: any) {
        // 3. Обробка помилки 404 (файл не знайдено)
        // Vercel Blob повертає помилку зі статусом 404, якщо 'head' не знаходить файл
        if (error.status === 404 || (error.cause && error.cause.status === 404)) {
            console.log("Blob file not found, returning default structure.");
            const defaultData: AppData = { profile: null, sessions: [] };
            return NextResponse.json(defaultData);
        }

        // Інші помилки
        console.error('Error fetching data from Vercel Blob:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
    }
}

// Функція для збереження даних (оновлення)
export async function POST(request: Request) {
    try {
        const data = await request.json() as AppData;

        const blob = await put(BLOB_FILENAME, JSON.stringify(data), {
            access: 'public', // Можна змінити на 'private'
            addRandomSuffix: false, // Важливо, щоб перезаписувати той самий файл
            contentType: 'application/json',
        });

        return NextResponse.json({ success: true, url: blob.url });
    } catch (error) {
        console.error('Error saving data to Vercel Blob:', error);
        return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
}