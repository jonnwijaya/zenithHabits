
"use client";

import { useState, useEffect } from 'react';
import type { Habit, HabitCompletionStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  getDate,
  getDaysInMonth,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { HabitIcon } from '../habit/habit-icon';

interface MonthlyRecapViewProps {
  habits: Habit[];
  completionStatus: HabitCompletionStatus;
}

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthlyRecapView({ habits, completionStatus }: MonthlyRecapViewProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePreviousMonth = () => {
    setCurrentMonthDate(subMonths(currentMonthDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(addMonths(currentMonthDate, 1));
  };

  if (!isClient) {
    // Basic skeleton or loading state can be shown here
    return <p>Loading recap...</p>;
  }

  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(currentMonthDate);
  const daysInCurrentMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const numDaysInMonth = getDaysInMonth(currentMonthDate);

  const getCompletionsForHabit = (habitId: string, monthDays: Date[]): number => {
    let count = 0;
    monthDays.forEach(day => {
      const dateString = format(day, 'yyyy-MM-dd');
      if (completionStatus[dateString] && completionStatus[dateString][habitId]) {
        count++;
      }
    });
    return count;
  };

  return (
    <Card className="shadow-lg animate-gentle-appear">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-headline">Monthly Recap</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth} aria-label="Previous month">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-medium w-36 text-center">
            {format(currentMonthDate, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No habits to display in recap.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10 w-1/4 min-w-[150px] lg:min-w-[200px]">Habit</TableHead>
                  {daysInCurrentMonth.map(day => (
                    <TableHead key={day.toString()} className="text-center p-1.5 md:p-2">
                      <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
                      <div>{format(day, 'd')}</div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[60px] md:min-w-[80px]">Goal</TableHead>
                  <TableHead className="text-center min-w-[100px] md:min-w-[120px]">Achieved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {habits.map(habit => {
                  const achievedCount = getCompletionsForHabit(habit.id, daysInCurrentMonth);
                  const goalPercentage = numDaysInMonth > 0 ? (achievedCount / numDaysInMonth) * 100 : 0;
                  const barColor = goalPercentage >= 70 ? 'bg-primary' : 'bg-accent';

                  return (
                    <TableRow key={habit.id}>
                      <TableCell className="sticky left-0 bg-card z-10 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <HabitIcon name={habit.icon} className="h-5 w-5 text-muted-foreground" />
                          <span>{habit.name}</span>
                        </div>
                      </TableCell>
                      {daysInCurrentMonth.map(day => {
                        const dateString = format(day, 'yyyy-MM-dd');
                        const isCompleted = completionStatus[dateString]?.[habit.id] === true;
                        return (
                          <TableCell key={day.toString()} className={cn(
                            "text-center p-1.5 md:p-2",
                            isCompleted ? 'bg-primary/20' : ''
                          )}>
                            {isCompleted && <Check className="h-5 w-5 text-primary mx-auto" />}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-medium">{numDaysInMonth}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                           <span className="font-medium">{achievedCount}</span>
                           <div className="h-2.5 w-full rounded-full bg-muted">
                             <div
                               className={cn("h-2.5 rounded-full", barColor)}
                               style={{ width: `${Math.min(goalPercentage, 100)}%` }}
                             ></div>
                           </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
