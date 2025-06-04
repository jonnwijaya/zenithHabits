"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lightbulb, AlertTriangle } from 'lucide-react';
import { generateGoalTips, type GenerateGoalTipsInput } from '@/ai/flows/generate-goal-tips';
import type { Habit } from '@/types';
import { GOALS_FOR_AI_TIPS } from '@/constants';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GoalTipsDisplayProps {
  habits: Habit[];
}

export function GoalTipsDisplay({ habits }: GoalTipsDisplayProps) {
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTips = async () => {
    setIsLoading(true);
    setError(null);
    setTips([]);

    const completedHabits = habits.filter(h => h.completed).map(h => h.name);
    const input: GenerateGoalTipsInput = {
      completedHabits: completedHabits.length > 0 ? completedHabits : ["No habits completed yet today"],
      goals: GOALS_FOR_AI_TIPS,
    };

    try {
      const result = await generateGoalTips(input);
      setTips(result.tips);
    } catch (e) {
      console.error("Failed to generate goal tips:", e);
      setError("Oops! Couldn't fetch tips right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="animate-gentle-appear" style={{animationDelay: '0.2s'}}>
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
          AI-Powered Goal Tips
        </CardTitle>
        <CardDescription>
          Get personalized tips based on your completed habits and goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Generating tips...</p>
          </div>
        )}
        {error && (
          <div className="text-destructive flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
            <AlertTriangle className="h-5 w-5"/> 
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error && tips.length > 0 && (
          <ScrollArea className="h-40">
            <ul className="space-y-2 list-disc list-inside pl-2 text-sm">
              {tips.map((tip, index) => (
                <li key={index} className="animate-gentle-appear" style={{animationDelay: `${index * 0.1}s`}}>{tip}</li>
              ))}
            </ul>
          </ScrollArea>
        )}
        {!isLoading && !error && tips.length === 0 && !error && (
          <p className="text-muted-foreground text-center py-4">Click the button to get your personalized tips!</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchTips} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          Get Tips
        </Button>
      </CardFooter>
    </Card>
  );
}
