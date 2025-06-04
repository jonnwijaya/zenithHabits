
"use client";

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Habit, HabitCompletionStatus } from '@/types';
import { DEFAULT_HABITS } from '@/constants'; 

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MonthlyRecapView } from '@/components/recap/monthly-recap-view';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn, Mountain } from 'lucide-react'; // Ensure Mountain is imported

export default function RecapPage() {
  const { user, login, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  // TODO: These will be replaced with data fetched for the logged-in user
  const [habits, setHabits] = useLocalStorage<Habit[]>(
    user ? `zenith_habits_${user.id}` : 'zenith_habits', 
    DEFAULT_HABITS
  );
  const [habitCompletionStatus, setHabitCompletionStatus] = useLocalStorage<HabitCompletionStatus>(
    user ? `zenith_habit_completion_status_${user.id}` : 'zenith_habit_completion_status',
    {}
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!authIsLoading && !user && isClient) {
      // Optional: redirect to home or show login prompt if preferred
      // For now, it will show a login prompt on this page if not logged in.
    }
     // If user logs in/out, re-fetch or adjust localStorage keys
    if (user) {
      const userHabitsKey = `zenith_habits_${user.id}`;
      const userCompletionStatusKey = `zenith_habit_completion_status_${user.id}`;
      
      const storedUserHabits = localStorage.getItem(userHabitsKey);
      setHabits(storedUserHabits ? JSON.parse(storedUserHabits) : DEFAULT_HABITS);

      const storedUserCompletion = localStorage.getItem(userCompletionStatusKey);
      setHabitCompletionStatus(storedUserCompletion ? JSON.parse(storedUserCompletion) : {});
    } else if (!authIsLoading) {
       // Fallback to general keys if no user
      const defaultHabits = localStorage.getItem('zenith_habits');
      setHabits(defaultHabits ? JSON.parse(defaultHabits) : DEFAULT_HABITS);

      const defaultCompletion = localStorage.getItem('zenith_habit_completion_status');
      setHabitCompletionStatus(defaultCompletion ? JSON.parse(defaultCompletion) : {});
    }

  }, [user, authIsLoading, isClient, setHabits, setHabitCompletionStatus]);


  if (authIsLoading || !isClient) {
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

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col justify-center items-center text-center">
          <Mountain className="h-16 w-16 text-primary mb-6" />
          <h1 className="text-3xl font-bold mb-4">View Your Recap</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Please log in to see your monthly habit recap.
          </p>
          <Button size="lg" onClick={login} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <LogIn className="mr-2 h-5 w-5" />
            Login / Sign Up
          </Button>
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
