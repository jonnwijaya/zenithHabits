
"use client";

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Habit, HabitCompletionStatus } from '@/types';
import { DEFAULT_HABITS } from '@/constants'; 

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MonthlyRecapView } from '@/components/recap/monthly-recap-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Mountain } from 'lucide-react';

const habitsKey = 'zenith_habits_guest';
const completionStatusKey = 'zenith_habit_completion_status_guest';

export default function RecapPage() {
  const [habits, setHabits] = useLocalStorage<Habit[]>(
    habitsKey, 
    DEFAULT_HABITS
  );
  const [habitCompletionStatus, setHabitCompletionStatus] = useLocalStorage<HabitCompletionStatus>(
    completionStatusKey,
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
           <div className="text-center mt-4">
             <Mountain className="h-8 w-8 text-primary mb-2 animate-pulse mx-auto" />
             <p className="text-md text-muted-foreground">Preparing recap...</p>
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
        { habits.length === 0 ? (
            <div className="text-center py-10">
                 <Mountain className="h-12 w-12 text-primary mb-4 mx-auto" />
                <p className="text-xl text-muted-foreground">No habit data to display for your recap yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Start tracking some habits on the main page!</p>
            </div>
        ) : (
           <MonthlyRecapView habits={habits} completionStatus={habitCompletionStatus} />
        )}
      </main>
      <Footer habits={habits} />
    </div>
  );
}
