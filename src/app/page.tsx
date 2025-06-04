"use client";

import { useState, useEffect } from 'react';
import type { Habit, Affirmation, HabitCompletionStatus } from '@/types';
import { DEFAULT_HABITS, DEFAULT_AFFIRMATIONS } from '@/constants';
import useLocalStorage from '@/hooks/use-local-storage';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AdSlot } from '@/components/layout/ad-slot';
import { HabitList } from '@/components/habit/habit-list';
import { AffirmationDisplay } from '@/components/affirmations/affirmation-display';
import { GoalTipsDisplay } from '@/components/ai/goal-tips-display';
import { MotivationalNudge } from '@/components/general/motivational-nudge';
import { CalendarView } from '@/components/habit/calendar-view';
import { format, parseISO, isSameDay, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('zenith_habits', DEFAULT_HABITS);
  const [completionStatus, setCompletionStatus] = useLocalStorage<HabitCompletionStatus>('zenith_completion_status', {});
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset habit completion daily and update streaks
  useEffect(() => {
    if (!isClient) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const updatedHabits = habits.map(habit => {
      let newStreak = habit.streak;
      let lastCompleted = habit.lastCompletedDate;
      let newCompleted = false; // Default to not completed for today

      // Check if habit was completed today from completionStatus
      if (completionStatus[todayStr] && completionStatus[todayStr][habit.id]) {
        newCompleted = true;
      }

      if (lastCompleted) {
        const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        if (lastCompleted === todayStr) {
          // Already handled today, nothing to change for streak here
        } else if (lastCompleted !== yesterdayStr && !isSameDay(parseISO(lastCompleted), new Date())) {
          // Streak broken if not completed yesterday and not today
          newStreak = 0;
        }
      } else { // No last completed date
        newStreak = 0;
      }
      
      // If current status in completionStatus says it's completed today, mark as completed
      return { ...habit, completed: newCompleted, streak: newStreak };
    });
    setHabits(updatedHabits);

  }, [isClient]); // Run once on client mount


  const handleToggleHabit = (id: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let toggledHabitCompletion = false;

    setHabits(prevHabits =>
      prevHabits.map(habit => {
        if (habit.id === id) {
          toggledHabitCompletion = !habit.completed;
          let newStreak = habit.streak;
          let newLastCompletedDate = habit.lastCompletedDate;

          if (toggledHabitCompletion) { // Marking as complete
            if (habit.lastCompletedDate === todayStr) {
              // Already completed today, no change to streak
            } else {
               const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
               if (habit.lastCompletedDate === yesterdayStr) {
                 newStreak += 1; // Continued streak
               } else {
                 newStreak = 1; // New streak or restarted streak
               }
            }
            newLastCompletedDate = todayStr;
            if (newStreak > (habit.streak || 0)) {
              toast({ title: "Streak extended!", description: `Your streak for "${habit.name}" is now ${newStreak}!`, className: "bg-green-500/20 border-green-500"});
            } else if (newStreak === 1 && (habit.streak || 0) === 0) {
               toast({ title: "New Streak Started!", description: `You've started a new streak for "${habit.name}"!`, className: "bg-primary/20 border-primary"});
            }


          } else { // Marking as incomplete
            if (habit.lastCompletedDate === todayStr) {
              // Was completed today, now incomplete. If streak was incremented today, revert.
              const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
              if (habit.lastCompletedDate === todayStr && habit.streak > 0) {
                 // If it was part of a continued streak from yesterday
                 if (completionStatus[yesterdayStr]?.[id]) {
                    newStreak = (habits.find(h => h.id === id)?.streak || 1) -1; // Revert to yesterday's streak count
                 } else {
                    newStreak = 0; // Reset if not completed yesterday
                 }
              } else {
                newStreak = habit.streak; // No change if not completed today or no streak
              }
              newLastCompletedDate = habit.streak > 0 ? format(subDays(new Date(), 1), 'yyyy-MM-dd') : undefined;
            }
             // No change to streak if marked incomplete, unless it was part of today's completion
          }
          return { ...habit, completed: toggledHabitCompletion, streak: newStreak, lastCompletedDate: newLastCompletedDate };
        }
        return habit;
      })
    );
    
    setCompletionStatus(prevStatus => {
      const newStatus = { ...prevStatus };
      if (!newStatus[todayStr]) {
        newStatus[todayStr] = {};
      }
      newStatus[todayStr][id] = toggledHabitCompletion;
      return newStatus;
    });
  };

  const handleSaveHabit = (habitData: { name: string; icon: string }, id?: string) => {
    if (id) { // Editing existing habit
      setHabits(prevHabits => prevHabits.map(h => h.id === id ? { ...h, ...habitData } : h));
      toast({ title: "Habit Updated", description: `"${habitData.name}" has been updated.`});
    } else { // Adding new habit
      const newHabit: Habit = {
        id: Date.now().toString(), // Simple ID generation
        ...habitData,
        completed: false,
        streak: 0,
        createdAt: new Date().toISOString(),
      };
      setHabits(prevHabits => [...prevHabits, newHabit]);
      toast({ title: "Habit Added", description: `"${newHabit.name}" has been added to your list.`});
    }
  };

  const handleDeleteHabit = (id: string) => {
    const habitToDelete = habits.find(h => h.id === id);
    setHabits(prevHabits => prevHabits.filter(h => h.id !== id));
    toast({ title: "Habit Deleted", description: `"${habitToDelete?.name}" has been removed.`, variant: "destructive"});
  };


  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-full">
            <p>Loading Zenith Habits...</p>
          </div>
        </main>
        <Footer habits={[]} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AdSlot id="banner-top" type="banner" className="my-4 container" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AffirmationDisplay />
            <HabitList
              habits={habits}
              onToggleComplete={handleToggleHabit}
              onSaveHabit={handleSaveHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          </div>
          <div className="space-y-6">
            <CalendarView habits={habits} completionStatus={completionStatus} />
            <GoalTipsDisplay habits={habits} />
            <AdSlot id="native-sidebar" type="native" />
          </div>
        </div>
      </main>
      <Footer habits={habits} />
      <MotivationalNudge />
    </div>
  );
}
