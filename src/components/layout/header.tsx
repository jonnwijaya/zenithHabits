
"use client";

import Link from 'next/link';
import { Mountain, CalendarDays } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 mr-auto" aria-label="Zenith Habits Home">
          <Mountain className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg font-semibold">Zenith Habits</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/recap" passHref>
            <Button variant="ghost" size="icon" aria-label="Monthly Recap">
              <CalendarDays className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
