"use client";

import type { Habit, HabitCompletionStatus } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useState, useEffect } from 'react';

interface CalendarViewProps {
  habits: Habit[];
  completionStatus: HabitCompletionStatus; // { 'YYYY-MM-DD': { habitId: boolean } }
}

export function CalendarView({ habits, completionStatus }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Progress Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p>Loading calendar...</p>
        </CardContent>
      </Card>
    );
  }
  
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getDayStatus = (date: Date): string => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dailyCompletions = completionStatus[dateString];
    if (!dailyCompletions || habits.length === 0) return 'none';

    const completedCount = habits.filter(h => dailyCompletions[h.id]).length;
    if (completedCount === habits.length) return 'all';
    if (completedCount > 0) return 'partial';
    return 'none';
  };
  
  const dayRenderFunction = (day: Date, selectedDate: Date | undefined, activeModifiers: any,  buttonProps: any ) => {
    const status = getDayStatus(day);
    let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "outline";
    let badgeText = "";

    if (status === 'all') {
      badgeVariant = 'default'; // Primary color
      badgeText = 'All Done';
    } else if (status === 'partial') {
      badgeVariant = 'secondary'; // Accent color
      badgeText = 'Partial';
    }
    
    const isToday = isSameDay(day, new Date());

    return (
      <div
        {...buttonProps}
        className={`relative flex items-center justify-center w-full h-full 
          ${isToday ? 'border-2 border-primary rounded-md' : ''}
          ${buttonProps.className || ''}
        `}
      >
        <span>{format(day, 'd')}</span>
        {status !== 'none' && (
          <span
            className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 rounded-full
            ${status === 'all' ? 'bg-primary' : 'bg-accent'}`}
            title={badgeText}
          ></span>
        )}
      </div>
    );
  };


  return (
    <Card className="animate-gentle-appear" style={{animationDelay: '0.1s'}}>
      <CardHeader>
        <CardTitle className="text-xl font-headline">Monthly Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
         <Calendar
          mode="single"
          selected={currentMonth} // This doesn't really "select" a day but focuses the calendar
          onSelect={(day) => day && setCurrentMonth(day)} // Allow month navigation
          onMonthChange={setCurrentMonth}
          className="p-0"
          modifiers={{
            completedAll: (date) => getDayStatus(date) === 'all',
            completedPartial: (date) => getDayStatus(date) === 'partial',
          }}
          modifiersClassNames={{
            completedAll: 'bg-primary/20 text-primary-foreground rounded-md',
            completedPartial: 'bg-accent/20 text-accent-foreground rounded-md',
          }}
          components={{
            DayContent: ({ date }) => {
              const status = getDayStatus(date);
              let indicatorColor = '';
              if (status === 'all') indicatorColor = 'bg-primary';
              else if (status === 'partial') indicatorColor = 'bg-accent';
              
              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  {format(date, 'd')}
                  {indicatorColor && (
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${indicatorColor}`}></span>
                  )}
                </div>
              );
            },
          }}
        />
      </CardContent>
      <div className="p-4 border-t flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary"></span> All habits done</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-accent"></span> Some habits done</div>
      </div>
    </Card>
  );
}
