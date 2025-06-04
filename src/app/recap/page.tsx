
"use client";

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Habit, HabitCompletionStatus } from '@/types';
import { DEFAULT_HABITS } from '@/constants'; // Using default habits as fallback

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MonthlyRecapView } from '@/components/recap/monthly-recap-view';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecapPage() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('zenith_habits', DEFAULT_HABITS);
  const [habitCompletionStatus, setHabitCompletionStatus] = useLocalStorage<HabitCompletionStatus>(
    'zenith_habit_completion_status',
    {}
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-40" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer habits={[]} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <MonthlyRecapView habits={habits} completionStatus={habitCompletionStatus} />
      </main>
      <Footer habits={habits} />
    </div>
  );
}
