export interface Habit {
  id: string;
  name: string;
  icon: string; // Lucide icon name or SVG path
  completed: boolean;
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO date string
}

export interface Affirmation {
  id: string;
  text: string;
}

export type HabitCompletionStatus = {
  [date: string]: { [habitId: string]: boolean }; // date is YYYY-MM-DD
};
