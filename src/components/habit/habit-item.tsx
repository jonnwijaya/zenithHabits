"use client";

import type { Habit } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { HabitIcon } from './habit-icon';
import { cn } from '@/lib/utils';
import { Flame, Edit3, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface HabitItemProps {
  habit: Habit;
  onToggleComplete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export function HabitItem({ habit, onToggleComplete, onEdit, onDelete }: HabitItemProps) {
  return (
    <Card className={cn(
      "transition-all duration-300 ease-in-out transform hover:shadow-lg animate-gentle-appear",
      habit.completed ? 'bg-primary/10 border-primary/50' : 'bg-card'
    )} style={{ animationDelay: `${Math.random() * 0.3}s` }}>
      <CardContent className="p-4 flex items-center gap-4">
        <Checkbox
          id={`habit-${habit.id}`}
          checked={habit.completed}
          onCheckedChange={() => onToggleComplete(habit.id)}
          aria-label={`Mark habit ${habit.name} as ${habit.completed ? 'incomplete' : 'complete'}`}
          className={cn(
            "h-6 w-6 rounded-md transition-all duration-300",
            habit.completed ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground" 
          )}
        />
        <label htmlFor={`habit-${habit.id}`} className="flex-1 cursor-pointer">
          <div className="flex items-center gap-2">
            <HabitIcon name={habit.icon} className={cn("h-6 w-6", habit.completed ? "text-primary" : "text-foreground")} />
            <span className={cn("font-medium text-base", habit.completed ? 'line-through text-muted-foreground' : 'text-foreground')}>
              {habit.name}
            </span>
          </div>
        </label>
        {habit.streak > 0 && (
          <div className="flex items-center gap-1 text-sm text-amber-500" title={`Current streak: ${habit.streak} days`}>
            <Flame className="h-4 w-4" />
            <span>{habit.streak}</span>
          </div>
        )}
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(habit)} aria-label={`Edit habit ${habit.name}`} className="h-8 w-8">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(habit.id)} aria-label={`Delete habit ${habit.name}`} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
