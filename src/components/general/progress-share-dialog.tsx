
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { BarChart, Share2, Download, Loader2 } from "lucide-react";
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
import { toPng } from 'html-to-image';

interface ProgressShareDialogProps {
  habits: Habit[];
}

// Example data - in a real app, this should be dynamic based on actual completion history
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
  const chartRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getChartBackgroundColor = () => {
    if (typeof window !== 'undefined') {
      const style = window.getComputedStyle(document.documentElement);
      const backgroundVar = style.getPropertyValue('--background').trim();
      // HSL variables are in the format "H S% L%" or "H S L"
      // We need to convert this to hsl(H, S%, L%)
      if (backgroundVar) {
        const parts = backgroundVar.split(" ");
        if (parts.length === 3) {
          return `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})`;
        }
      }
    }
    // Fallback if CSS variable parsing fails
    const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
    return isDarkMode ? 'hsl(280, 8%, 17%)' : 'hsl(280, 25%, 97%)';
  };

  const handleDownload = async () => {
    if (!chartRef.current) {
      toast({ title: "Error", description: "Chart element not found.", variant: "destructive" });
      return;
    }
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(chartRef.current, { 
        pixelRatio: 2,
        backgroundColor: getChartBackgroundColor(),
        skipFonts: true, // Add this option to prevent font fetching issues
      });
      const link = document.createElement('a');
      link.download = 'zenith-habits-progress.png';
      link.href = dataUrl;
      link.click();
      link.remove();
      toast({ title: "Success!", description: "Chart downloaded successfully." });
    } catch (error) {
      console.error('Failed to download chart:', error);
      toast({ title: "Download Failed", description: "Could not download the chart.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.completed).length;

  const handleShare = async () => {
    setIsSharing(true);
    const shareText = `I've completed ${completedToday} out of ${totalHabits} habits today on Zenith Habits!`;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "https://your-app-url.com"; // Replace with actual app URL

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Zenith Habits Progress',
          text: shareText,
          url: shareUrl,
        });
        toast({ title: 'Shared!', description: 'Progress shared successfully.' });
      } catch (error) {
        // Don't show an error if user cancels share dialog (AbortError)
        if ((error as DOMException).name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast({ title: 'Share Failed', description: 'Could not share progress.', variant: 'destructive' });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} Check it out: ${shareUrl}`);
        toast({ title: 'Copied!', description: 'Progress details copied to clipboard.' });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({ title: 'Copy Failed', description: 'Could not copy to clipboard.', variant: 'destructive' });
      }
    }
    setIsSharing(false);
  };


  if (!isClient) {
    return (
      <Button variant="outline" disabled>
        <Share2 className="mr-2 h-4 w-4" />
        Share Progress
      </Button>
    );
  }

  // Update example data to use current habits length for "total"
  const weeklyProgress = chartDataExample.map(d => ({
    ...d,
    completed: Math.min(d.completed, totalHabits > 0 ? totalHabits : 5), // Ensure completed isn't > total
    total: totalHabits > 0 ? totalHabits : 5, // Use actual total habits or a default if none
    remaining: Math.max(0, (totalHabits > 0 ? totalHabits : 5) - Math.min(d.completed, totalHabits > 0 ? totalHabits : 5))
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
          <ChartContainer ref={chartRef} config={chartConfig} className="w-full h-[250px] bg-background p-4 rounded-md">
            <RechartsBarChart accessibilityLayer data={weeklyProgress} margin={{left: -20, top: 5, right: 5, bottom: 5}}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                domain={[0, totalHabits > 0 ? totalHabits : 5]} 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                allowDecimals={false}
              />
              <ChartTooltip 
                cursor={{fill: 'hsl(var(--accent)/0.5)'}}
                content={<ChartTooltipContent />} 
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="remaining" fill="var(--color-remaining)" radius={[4, 4, 0, 0]} stackId="a" />
            </RechartsBarChart>
          </ChartContainer>
        </div>

        <DialogFooter className="sm:justify-between gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download Chart
          </Button>
          <Button 
            type="button" 
            onClick={handleShare} 
            disabled={isSharing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
            Share Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

