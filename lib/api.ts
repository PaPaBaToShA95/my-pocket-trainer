// lib/api.ts
import { AppData } from './types';

const API_ROUTE = '/api/data';

/**
 * Завантажує поточні дані додатку (профіль та сесії) з Vercel Blob.
 */
export async function loadAppData(): Promise<AppData> {
    const response = await fetch(API_ROUTE, {
        cache: 'no-store', // Важливо для динамічних даних
    });
    if (!response.ok) {
        throw new Error('Failed to load application data');
    }
    return response.json();
}

/**
 * Зберігає оновлені дані додатку у Vercel Blob.
 */
export async function saveAppData(data: AppData): Promise<{ success: boolean }> {
    const response = await fetch(API_ROUTE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to save application data');
    }
    return response.json();
}