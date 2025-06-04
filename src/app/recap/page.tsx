
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
import { Button } from '@/components/ui/button';
import { LogIn, Mountain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RecapPage() {
  const { user, login, logout, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();

  const habitsKey = user ? `zenith_habits_${user.id}` : 'zenith_habits_guest';
  const completionStatusKey = user ? `zenith_habit_completion_status_${user.id}` : 'zenith_habit_completion_status_guest';

  const [habits, setHabits] = useLocalStorage<Habit[]>(
    habitsKey, 
    DEFAULT_HABITS
  );
  const [habitCompletionStatus, setHabitCompletionStatus] = useLocalStorage<HabitCompletionStatus>(
    completionStatusKey,
    {}
  );
  const [isClient, setIsClient] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user && isClient) {
      const fetchData = async () => {
        setIsSyncing(true);
        try {
          await user.jwt(true); // Force refresh token if needed
          const response = await fetch('/.netlify/functions/get-user-data');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch data: ${response.statusText}`);
          }
          const data = await response.json();
          if (data.habits) setHabits(data.habits);
          if (data.completionStatus) setHabitCompletionStatus(data.completionStatus);
          // toast({ title: "Recap Synced", description: "Your recap data has been loaded." });
        } catch (error: any) {
          console.error("Error fetching user data for recap:", error);
           if (error.message.includes("Failed to refresh token") || error.message.includes("session might have expired")) {
             toast({ variant: "destructive", title: "Session Issue", description: "Could not load recap: Session expired. Please log in again." });
             // Optionally call logout() here
          } else {
            toast({ variant: "destructive", title: "Sync Error", description: `Could not load recap data: ${error.message}` });
          }
        } finally {
          setIsSyncing(false);
        }
      };
      fetchData();
    }
  }, [user, isClient, toast, setHabits, setHabitCompletionStatus, logout]);
  
  if (authIsLoading || !isClient || (user && isSyncing && habits.length === 0 && !DEFAULT_HABITS.length)) {
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
             <p className="text-md text-muted-foreground">
                { authIsLoading ? "Authenticating..." : isSyncing ? "Loading your recap..." : "Preparing recap..."}
             </p>
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
        { habits.length === 0 && !isSyncing ? (
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

    