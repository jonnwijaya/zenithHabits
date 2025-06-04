"use client";

import { useState, useEffect } from 'react';
import type { Affirmation } from '@/types';
import { DEFAULT_AFFIRMATIONS } from '@/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';
import { Button } from '../ui/button';

export function AffirmationDisplay() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>(DEFAULT_AFFIRMATIONS);
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation | null>(null);

  const pickRandomAffirmation = () => {
    if (affirmations.length > 0) {
      const randomIndex = Math.floor(Math.random() * affirmations.length);
      setCurrentAffirmation(affirmations[randomIndex]);
    }
  };

  useEffect(() => {
    pickRandomAffirmation();
  }, [affirmations]); // Re-pick if affirmations list changes

  // For this example, affirmations are static. If they were dynamic,
  // you might fetch them or allow user to add/edit them.
  // For now, we just use the default list.

  if (!currentAffirmation) {
    return null; // Or a loading state
  }

  return (
    <Card className="bg-accent/50 border-accent animate-gentle-appear">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-headline text-accent-foreground/80 flex justify-between items-center">
          <span>Daily Affirmation</span>
          <Button variant="ghost" size="icon" onClick={pickRandomAffirmation} aria-label="New affirmation" className="h-7 w-7 text-accent-foreground/70 hover:text-accent-foreground">
            <RefreshCcw className="h-4 w-4"/>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg italic text-accent-foreground text-center">
          "{currentAffirmation.text}"
        </p>
      </CardContent>
    </Card>
  );
}
