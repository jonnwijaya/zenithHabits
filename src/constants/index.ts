import type { Habit, Affirmation } from '@/types';

export const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Drink 8 glasses of water', icon: 'GlassWater', completed: false, streak: 0, createdAt: new Date().toISOString() },
  { id: '2', name: 'Read for 20 minutes', icon: 'BookOpen', completed: false, streak: 0, createdAt: new Date().toISOString() },
  { id: '3', name: 'Meditate for 10 minutes', icon: 'Brain', completed: false, streak: 0, createdAt: new Date().toISOString() },
  { id: '4', name: 'Morning walk', icon: 'Sun', completed: false, streak: 0, createdAt: new Date().toISOString()},
];

export const DEFAULT_AFFIRMATIONS: Affirmation[] = [
  { id: '1', text: 'I am capable of achieving great things today.' },
  { id: '2', text: 'I embrace challenges as opportunities for growth.' },
  { id: '3', text: 'I am resilient, strong, and full of positive energy.' },
  { id: '4', text: 'Every step I take brings me closer to my goals.' },
  { id: '5', text: 'I choose to be happy and grateful for this day.' },
];

export const GOALS_FOR_AI_TIPS: string[] = [
  "Maintain a healthy lifestyle",
  "Improve focus and productivity",
  "Cultivate mindfulness and inner peace",
  "Achieve personal growth"
];
