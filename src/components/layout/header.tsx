import Link from 'next/link';
import { Mountain } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { AmbientPlayerToggle } from '@/components/audio/ambient-player-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 mr-auto" aria-label="Zenith Habits Home">
          <Mountain className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg font-semibold">Zenith Habits</span>
        </Link>
        <nav className="flex items-center gap-2">
          <AmbientPlayerToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
