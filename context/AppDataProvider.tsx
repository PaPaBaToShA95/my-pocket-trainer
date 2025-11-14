// context/AppDataProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, UserProfile } from '@/lib/types';
import { loadAppData, saveAppData } from '@/lib/api';

interface AppContextType {
    data: AppData | null;
    isLoading: boolean;
    error: string | null;
    updateData: (newData: Partial<AppData>) => Promise<void>;
    updateProfile: (profile: UserProfile) => Promise<void>;
    addSession: (session: AppData['sessions'][number]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Завантаження даних при ініціалізації
    useEffect(() => {
        loadAppData()
            .then(initialData => {
                setData(initialData);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Initial data loading failed:', err);
                setError('Failed to load initial data.');
                setIsLoading(false);
            });
    }, []);

    // Функція збереження даних
    const updateData = async (newData: Partial<AppData>) => {
        if (!data) return;

        const updatedData: AppData = { ...data, ...newData };
        setData(updatedData);

        try {
            await saveAppData(updatedData);
            console.log('Data saved successfully to Vercel Blob.');
        } catch (err) {
            console.error('Failed to save data:', err);
            // Можна відкотити зміни у випадку помилки збереження
        }
    };

    const updateProfile = async (profile: UserProfile) => {
        await updateData({ profile });
    };

    const addSession = async (session: AppData['sessions'][number]) => {
        if (!data) return;
        const newSessions = [...data.sessions, session];
        await updateData({ sessions: newSessions });
    };


    return (
        <AppContext.Provider value={{ data, isLoading, error, updateData, updateProfile, addSession }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppData = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppData must be used within an AppDataProvider');
    }
    return context;
};