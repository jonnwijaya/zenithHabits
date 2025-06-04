
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
    // This makes sure the widget is ready to handle login, signup, etc.
    netlifyIdentity.init({
      // APIUrl: process.env.NEXT_PUBLIC_NETLIFY_IDENTITY_API_URL, // Optional: if using a custom Identity instance
    });

    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);

    const handleLogin = (loggedInUser: User) => {
      setUser(loggedInUser);
      netlifyIdentity.close(); // Close the modal on login
      setIsLoading(false); // Ensure loading is false after login sequence
    };

    const handleLogout = () => {
      setUser(null);
      setIsLoading(false); // Ensure loading is false after logout
    };
    
    const handleError = (err: any) => {
      console.error('Netlify Identity Error:', err);
      setIsLoading(false); // Ensure loading is false on error
    };

    // Set up event listeners for Identity events
    netlifyIdentity.on('login', handleLogin);
    netlifyIdentity.on('logout', handleLogout);
    netlifyIdentity.on('error', handleError);

    // Cleanup function to remove event listeners when the AuthProvider unmounts
    return () => {
      netlifyIdentity.off('login', handleLogin);
      netlifyIdentity.off('logout', handleLogout);
      netlifyIdentity.off('error', handleError);
    };
  }, []);

  const login = () => {
    netlifyIdentity.open('login'); // Opens the Netlify Identity widget for login
  };

  const logout = () => {
    netlifyIdentity.logout(); // Logs out the current user via Netlify Identity
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

