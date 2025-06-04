"use client";

import type { Habit } from '@/types';
import { HabitItem } from './habit-item';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { HabitFormDialog } from './habit-form-dialog';
import { useState } from 'react';

interface HabitListProps {
  habits: Habit[];
  onToggleComplete: (id: string) => void;
  onSaveHabit: (habitData: { name: string; icon: string }, id?: string) => void;
  onDeleteHabit: (id: string) => void;
}

export function HabitList({ habits, onToggleComplete, onSaveHabit, onDeleteHabit }: HabitListProps) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingHabit(null);
    setIsFormOpen(true);
  };
  
  const handleSave = (habitData: { name: string; icon: string }, id?: string) => {
    onSaveHabit(habitData, id);
    setIsFormOpen(false);
    setEditingHabit(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-headline font-semibold">Today's Habits</h2>
        <HabitFormDialog
            habit={editingHabit}
            onSave={handleSave}
            isOpen={isFormOpen}
            onOpenChange={(open) => {
              setIsFormOpen(open);
              if (!open) setEditingHabit(null);
            }}
            triggerButton={
              <Button onClick={handleAddNew} variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Habit
              </Button>
            }
          />
      </div>
      {habits.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No habits yet. Add some to get started!</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggleComplete={onToggleComplete}
              onEdit={handleEdit}
              onDelete={onDeleteHabit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
