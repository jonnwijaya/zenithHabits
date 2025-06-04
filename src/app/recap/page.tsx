
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
import { Mountain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthFormDialog } from '@/components/auth/auth-form-dialog';

export default function RecapPage() {
  const { user, isLoading: authIsLoading, idToken } = useAuth();
  const { toast } = useToast();

  const habitsKey = user ? `zenith_habits_${user.uid}` : 'zenith_habits_guest';
  const completionStatusKey = user ? `zenith_habit_completion_status_${user.uid}` : 'zenith_habit_completion_status_guest';

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
    if (user && isClient && idToken) {
      const fetchData = async () => {
        setIsSyncing(true);
        try {
        //   const currentToken = await user.getIdToken(true); // Ensure fresh token
          const response = await fetch('/.netlify/functions/get-user-data', {
             headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch data: ${response.statusText}`);
          }
          const data = await response.json();
          if (data.habits && Array.isArray(data.habits)) {
            setHabits(data.habits);
          } else if (data.habits) {
            setHabits(DEFAULT_HABITS);
          }

          if (data.completionStatus && typeof data.completionStatus === 'object') {
            setHabitCompletionStatus(data.completionStatus);
          } else if (data.completionStatus) {
            setHabitCompletionStatus({});
          }
          // toast({ title: "Recap Synced", description: "Your recap data has been loaded." });
        } catch (error: any) {
          console.error("Error fetching user data for recap:", error);
          toast({ variant: "destructive", title: "Sync Error", description: `Could not load recap data: ${error.message}. Using local data.` });
        } finally {
          setIsSyncing(false);
        }
      };
      fetchData();
    } else if (!user && isClient) {
       if(habitsKey !== 'zenith_habits_guest') {
        setHabits(DEFAULT_HABITS);
        setHabitCompletionStatus({});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isClient, idToken, toast, habitsKey, completionStatusKey]);
  // Removed setHabits, setHabitCompletionStatus from deps
  
  const showLoadingState = authIsLoading || !isClient || (user && isSyncing && habits.length === 0 && Object.keys(habitCompletionStatus).length === 0 && !DEFAULT_HABITS.length);

  if (showLoadingState) {
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
            Please log in or sign up to see your monthly habit recap.
          </p>
          <AuthFormDialog triggerButton={
             <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Login / Sign Up
            </Button>
          }/>
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
