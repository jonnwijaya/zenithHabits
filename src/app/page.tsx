
"use client";

import { useState, useEffect } from 'react';
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
import { Mountain } from 'lucide-react';

const habitsKey = 'zenith_habits_guest';
const completionStatusKey = 'zenith_habit_completion_status_guest';

export default function HomePage() {
  const [habits, setHabits] = useLocalStorage<Habit[]>(habitsKey, DEFAULT_HABITS);
  const [habitCompletionStatus, setHabitCompletionStatus] = useLocalStorage<HabitCompletionStatus>(
    completionStatusKey,
    {}
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, setHabits]); // setHabits from useLocalStorage is stable

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

  if (!isClient) { 
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center flex flex-col justify-center items-center">
          <Mountain className="h-12 w-12 text-primary mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading Zenith Habits...</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <section className="lg:col-span-2 space-y-6">
            <HabitList
              habits={habits}
              onToggleComplete={handleToggleComplete}
              onSaveHabit={handleSaveHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          </section>
          <aside className="lg:col-span-1 space-y-6 self-start">
            <AffirmationDisplay />
            <CalendarView habits={habits} completionStatus={habitCompletionStatus} />
          </aside>
        </div>
      </main>
      <Footer habits={habits} />
    </div>
  );
}
