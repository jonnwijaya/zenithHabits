
"use client";

import Link from 'next/link';
import { Mountain, CalendarDays, LogOut, UserCircle, LogIn } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthFormDialog } from '@/components/auth/auth-form-dialog';


export function Header() {
  const { user, logout, isLoading } = useAuth();

  const getInitials = (displayName?: string | null, email?: string | null) => {
    if (displayName) {
      const names = displayName.split(' ');
      if (names.length > 1 && names[0] && names[names.length -1]) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 mr-auto" aria-label="Zenith Habits Home">
          <Mountain className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg font-semibold">Zenith Habits</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user && (
            <Link href="/recap" passHref>
              <Button variant="ghost" size="icon" aria-label="Monthly Recap">
                <CalendarDays className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </Link>
          )}
          <ThemeToggle />
          {isLoading ? (
             <Button variant="ghost" size="icon" disabled>
                <UserCircle className="h-[1.2rem] w-[1.2rem] animate-pulse" />
              </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User'} />}
                    <AvatarFallback>{getInitials(user.displayName, user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || user.email || 'User'}
                    </p>
                    {user.email && user.displayName && ( // Show email only if displayName is also present
                       <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthFormDialog triggerButton={
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Login / Sign Up
              </Button>
            } />
          )}
        </nav>
      </div>
    </header>
  );
}
