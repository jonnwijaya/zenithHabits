
"use client";

import type { User } from 'netlify-identity-widget';
import netlifyIdentity from 'netlify-identity-widget';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Netlify Identity
    netlifyIdentity.init({
      // APIUrl: process.env.NEXT_PUBLIC_NETLIFY_IDENTITY_API_URL, // Optional: if using a custom Identity instance
    });

    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);

    netlifyIdentity.on('login', (loggedInUser) => {
      setUser(loggedInUser);
      netlifyIdentity.close(); // Close the modal on login
      setIsLoading(false);
    });

    netlifyIdentity.on('logout', () => {
      setUser(null);
      setIsLoading(false);
    });
    
    netlifyIdentity.on('error', (err) => {
      console.error('Netlify Identity Error:', err);
      setIsLoading(false);
    });


    // Cleanup
    return () => {
      // Consider if off('event', callback) is needed, but usually init handles it.
      // For this simple setup, direct cleanup might not be essential as widget handles its state.
    };
  }, []);

  const login = () => {
    netlifyIdentity.open('login');
  };

  const logout = () => {
    netlifyIdentity.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
