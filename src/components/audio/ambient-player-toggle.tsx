"use client";

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleAmbientMusic, getIsPlaying, playAmbientMusic, stopAmbientMusic } from '@/lib/audio-utils';

export function AmbientPlayerToggle() {
  const [isClient, setIsClient] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize isPlaying state from audio-utils only once on mount
    setIsPlaying(getIsPlaying());
  }, []);

  const handleToggle = () => {
    if (!isClient) return;
    const newIsPlaying = toggleAmbientMusic();
    setIsPlaying(newIsPlaying);
  };
  
  // Effect to cleanup Tone.js when component unmounts or before page refresh
  useEffect(() => {
    return () => {
      if (getIsPlaying()) {
        stopAmbientMusic();
      }
    };
  }, []);


  if (!isClient) {
    return <Button variant="ghost" size="icon" disabled className="w-9 h-9" aria-label="Toggle Music"><Volume2 className="h-5 w-5" /></Button>;
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle} className="w-9 h-9" aria-label="Toggle Music">
      {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </Button>
  );
}
