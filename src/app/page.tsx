
"use client";

import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Habit, HabitCompletionStatus } from '@/types';
import { DEFAULT_HABITS } from '@/constants';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HabitList } from '@/components/habit/habit-list';
import { AffirmationDisplay } from '@/components/affirmations/affirmation-display';
import { CalendarView } from '@/components/habit/calendar-view';
import { MotivationalNudge } from '@/components/general/motivational-nudge';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, Mountain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { user, loginWithGoogle, logout, isLoading: authIsLoading, idToken } = useAuth();
  const { toast } = useToast();
  
  const habitsKey = user ? `zenith_habits_${user.uid}` : 'zenith_habits_guest';
  const completionStatusKey = user ? `zenith_habit_completion_status_${user.uid}` : 'zenith_habit_completion_status_guest';

  const [habits, setHabits] = useLocalStorage<Habit[]>(habitsKey, DEFAULT_HABITS);
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
    if (user && isClient && idToken) { // Ensure idToken is available
      const fetchData = async () => {
        setIsSyncing(true);
        try {
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
          if (data.habits) setHabits(data.habits);
          if (data.completionStatus) setHabitCompletionStatus(data.completionStatus);
          // toast({ title: "Data Synced", description: "Your habits have been loaded from the cloud." });
        } catch (error: any) {
          console.error("Error fetching user data:", error);
          toast({ variant: "destructive", title: "Sync Error", description: `Could not load data: ${error.message}` });
        } finally {
          setIsSyncing(false);
        }
      };
      fetchData();
    } else if (!user && isClient) {
      // Guest user or logged out, useLocalStorage handles loading data for guest keys
    }
  }, [user, isClient, idToken, toast, setHabits, setHabitCompletionStatus, habitsKey, completionStatusKey]); // Added keys to dependencies


  const saveData = useCallback(async (currentHabits: Habit[], currentStatus: HabitCompletionStatus) => {
    if (user && isClient && idToken) {
      setIsSyncing(true);
      try {
        const response = await fetch('/.netlify/functions/save-user-data', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ habits: currentHabits, habitCompletionStatus: currentStatus }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to save data: ${response.statusText}`);
        }
        // toast({ title: "Progress Saved", description: "Your changes are saved to the cloud." });
      } catch (error: any) {
        console.error("Error saving user data:", error);
        toast({ variant: "destructive", title: "Save Error", description: `Could not save changes: ${error.message}. Your data is saved locally.` });
      } finally {
        setIsSyncing(false);
      }
    }
  }, [user, isClient, idToken, toast]);

  useEffect(() => {
    // Debounced save for logged-in users
    if (user && isClient && idToken) {
      const handler = setTimeout(() => {
        saveData(habits, habitCompletionStatus);
      }, 1500); 
      return () => clearTimeout(handler);
    }
  }, [habits, habitCompletionStatus, user, isClient, idToken, saveData]);


  useEffect(() => {
    if (!isClient) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setHabits(prevHabits => 
      prevHabits.map(h => {
        if (h.completed && h.lastCompletedDate && h.lastCompletedDate !== todayStr) {
          return { ...h, completed: false };
        }
        if (h.streak > 0 && h.lastCompletedDate) {
          const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
          if (h.lastCompletedDate !== todayStr && h.lastCompletedDate !== yesterdayStr) {
            return { ...h, streak: 0 };
          }
        }
        return h;
      })
    );
  }, [isClient, setHabits]); // Removed habitsKey as dependency, setHabits should be stable from useLocalStorage

  const handleSaveHabit = (habitData: { name: string; icon: string }, id?: string) => {
    if (id) {
      setHabits(prevHabits =>
        prevHabits.map(h => (h.id === id ? { ...h, ...habitData } : h))
      );
    } else {
      const newHabit: Habit = {
        id: Date.now().toString(),
        ...habitData,
        completed: false,
        streak: 0,
        createdAt: new Date().toISOString(),
      };
      setHabits(prevHabits => [...prevHabits, newHabit]);
    }
  };

  const handleToggleComplete = (habitId: string) => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    let newCompletedValue: boolean | undefined;

    setHabits(prevHabits =>
      prevHabits.map(h => {
        if (h.id === habitId) {
          newCompletedValue = !h.completed;
          if (newCompletedValue) { 
            let newStreak = h.streak;
            if (h.lastCompletedDate) {
              const yesterday = subDays(today, 1);
              const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
              if (h.lastCompletedDate === yesterdayStr) { 
                newStreak = h.streak + 1;
              } else if (h.lastCompletedDate !== todayStr) { 
                newStreak = 1;
              }
            } else { 
              newStreak = 1;
            }
            return { ...h, completed: true, streak: newStreak, lastCompletedDate: todayStr };
          } else { 
            let revertedStreak = h.streak;
            let revertedLastCompletedDate = h.lastCompletedDate;
            if (h.lastCompletedDate === todayStr) { 
              if (h.streak === 1) { 
                revertedStreak = 0;
                revertedLastCompletedDate = undefined; 
              } else if (h.streak > 1) { 
                revertedStreak = h.streak - 1;
                revertedLastCompletedDate = format(subDays(today, 1), 'yyyy-MM-dd');
              }
            }
            return { ...h, completed: false, streak: revertedStreak, lastCompletedDate: revertedLastCompletedDate };
          }
        }
        return h;
      })
    );

    if (newCompletedValue !== undefined) {
      setHabitCompletionStatus(prevStatus => {
        const newStatus = { ...prevStatus };
        if (!newStatus[todayStr]) {
          newStatus[todayStr] = {};
        }
        newStatus[todayStr][habitId] = newCompletedValue!;
        return newStatus;
      });
    }
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prevHabits => prevHabits.filter(h => h.id !== id));
    setHabitCompletionStatus(prevStatus => {
      const newStatus = { ...prevStatus };
      for (const dateKey in newStatus) {
        if (newStatus[dateKey][id]) {
          delete newStatus[dateKey][id];
        }
      }
      return newStatus;
    });
  };

  if (authIsLoading || !isClient || (user && isSyncing && habits.length === 0 && !DEFAULT_HABITS.length)) { 
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center flex flex-col justify-center items-center">
          <Mountain className="h-12 w-12 text-primary mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">
            { authIsLoading ? "Authenticating..." : isSyncing ? "Syncing your data..." : "Loading Zenith Habits..."}
          </p>
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
          <h1 className="text-3xl font-bold mb-4">Welcome to Zenith Habits</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Please log in to track your habits and sync your progress across devices.
          </p>
          <Button size="lg" onClick={loginWithGoogle} className="bg-primary hover:bg-primary/90 text-primary-foreground">
             <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
            Sign in with Google
          </Button>
        </main>
        <Footer habits={[]} />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <MotivationalNudge />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <section className="lg:col-span-2 space-y-6">
            <HabitList
              habits={habits}
              onToggleComplete={handleToggleComplete}
              onSaveHabit={handleSaveHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          </section>
          <aside className="lg:col-span-1 space-y-6">
            <AffirmationDisplay />
            <CalendarView habits={habits} completionStatus={habitCompletionStatus} />
          </aside>
        </div>
      </main>
      <Footer habits={habits} />
    </div>
  );
}
