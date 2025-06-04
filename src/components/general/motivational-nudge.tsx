"use client";

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_AFFIRMATIONS } from '@/constants'; // Re-use affirmations for nudges
import { Smile } from 'lucide-react';

const NUDGE_STORAGE_KEY = 'zenith_last_nudge_date';

export function MotivationalNudge() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const today = new Date().toISOString().split('T')[0];
    const lastNudgeDate = localStorage.getItem(NUDGE_STORAGE_KEY);

    if (lastNudgeDate !== today) {
      const randomIndex = Math.floor(Math.random() * DEFAULT_AFFIRMATIONS.length);
      const randomNudge = DEFAULT_AFFIRMATIONS[randomIndex].text;

      setTimeout(() => { // Delay toast slightly
        toast({
          title: (
            <div className="flex items-center">
              <Smile className="h-5 w-5 mr-2 text-primary" />
              Your Daily Boost!
            </div>
          ),
          description: randomNudge,
          duration: 7000, // 7 seconds
        });
        localStorage.setItem(NUDGE_STORAGE_KEY, today);
      }, 2000); // Show after 2 seconds
    }
  }, [toast, isClient]);

  return null; // This component doesn't render anything itself
}
