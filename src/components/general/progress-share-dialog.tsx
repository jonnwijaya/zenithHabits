"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { BarChart, Share2, Download } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart } from "recharts"
import type { Habit } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ProgressShareDialogProps {
  habits: Habit[];
  // In a real app, you'd pass more structured progress data
}

const chartDataExample = [
  { date: "Mon", completed: 3, total: 5 },
  { date: "Tue", completed: 4, total: 5 },
  { date: "Wed", completed: 2, total: 5 },
  { date: "Thu", completed: 5, total: 5 },
  { date: "Fri", completed: 3, total: 5 },
  { date: "Sat", completed: 4, total: 5 },
  { date: "Sun", completed: 1, total: 5 },
];

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
  remaining: {
    label: "Remaining",
    color: "hsl(var(--muted))",
  },
} satisfies Record<string, { label: string; color: string }>;


export function ProgressShareDialog({ habits }: ProgressShareDialogProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleShare = () => {
    // Placeholder for actual share functionality
    toast({
      title: "Sharing not implemented",
      description: "This is a placeholder for sharing functionality.",
    });
  };

  const handleDownload = () => {
     // Placeholder for actual download functionality
     toast({
      title: "Download not implemented",
      description: "This is a placeholder for chart download functionality.",
    });
  }

  if (!isClient) {
    return (
      <Button variant="outline" disabled>
        <Share2 className="mr-2 h-4 w-4" />
        Share Progress
      </Button>
    );
  }

  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.completed).length;

  const weeklyProgress = chartDataExample.map(d => ({
    ...d,
    completed: Math.floor(Math.random() * (totalHabits + 1)), // Random data for demo
    total: totalHabits,
    remaining: totalHabits - Math.floor(Math.random() * (totalHabits + 1))
  }));


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
          <Share2 className="mr-2 h-4 w-4" />
          Share Progress
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Your Progress
          </DialogTitle>
          <DialogDescription>
            Share your habit tracking progress. Here's a summary of your week.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <p className="text-center mb-2">Today: You've completed <strong>{completedToday}</strong> out of <strong>{totalHabits}</strong> habits!</p>
          <ChartContainer config={chartConfig} className="w-full h-[250px]">
            <RechartsBarChart accessibilityLayer data={weeklyProgress} margin={{left: -20}}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis domain={[0, totalHabits > 0 ? totalHabits : 5]} tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={4} stackId="a" />
              <Bar dataKey="remaining" fill="var(--color-remaining)" radius={4} stackId="a" />
            </RechartsBarChart>
          </ChartContainer>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Chart
          </Button>
          <Button type="button" onClick={handleShare} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Share2 className="mr-2 h-4 w-4" />
            Share Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
