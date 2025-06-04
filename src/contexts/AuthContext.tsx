
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
    console.log("Attempting to initialize Netlify Identity widget...");
    try {
      netlifyIdentity.init({
        APIUrl: '/.netlify/identity', // Explicitly set the default APIUrl
        // logo: false, // Optional: set to false to hide the Netlify logo
      });
      console.log("Netlify Identity widget initialized or initialization process started.");
    } catch (initError) {
      console.error("Error during Netlify Identity widget .init() call:", initError);
      // This catch might not capture async errors from within init,
      // but it's here for synchronous issues.
    }


    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      console.log("Netlify Identity: Found current user on initial load.", currentUser);
      setUser(currentUser);
    } else {
      console.log("Netlify Identity: No current user on initial load.");
    }
    setIsLoading(false);

    const handleLogin = (loggedInUser: User) => {
      console.log('Netlify Identity: Login event fired.', loggedInUser);
      setUser(loggedInUser);
      netlifyIdentity.close(); 
      setIsLoading(false); 
    };

    const handleLogout = () => {
      console.log('Netlify Identity: Logout event fired.');
      setUser(null);
      setIsLoading(false); 
    };
    
    const handleError = (err: any) => {
      console.error('Netlify Identity Error event:', err);
      // The "Failed to load settings" error might be caught here.
      if (err.message && err.message.includes("Failed to load settings")) {
        console.error("This often means Netlify Identity is not enabled for this site in the Netlify dashboard or there's a configuration issue with the /.netlify/identity endpoint.");
      }
      setIsLoading(false); 
    };

    netlifyIdentity.on('init', (initializedUser) => {
      console.log('Netlify Identity: Init event fired. User:', initializedUser);
      // This event fires after the widget has initialized.
      // If initializedUser is null here and currentUser was also null,
      // it means no user was logged in.
      // If initializedUser is different from currentUser, update the state.
      if (initializedUser !== user) {
         setUser(initializedUser);
      }
      setIsLoading(false); // Potentially redundant but ensures loading state is correct
    });
    netlifyIdentity.on('login', handleLogin);
    netlifyIdentity.on('logout', handleLogout);
    netlifyIdentity.on('error', handleError);

    return () => {
      console.log("Cleaning up Netlify Identity event listeners.");
      netlifyIdentity.off('init');
      netlifyIdentity.off('login', handleLogin);
      netlifyIdentity.off('logout', handleLogout);
      netlifyIdentity.off('error', handleError);
    };
  }, []); // Effect runs once on mount

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
