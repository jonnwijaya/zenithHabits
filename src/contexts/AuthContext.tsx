
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import type { ReactNode} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { app } from '@/lib/firebase'; // Ensure firebase is initialized here or in lib/firebase.ts
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  idToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuth(app); // Get auth instance

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);
        } catch (error) {
          console.error("Error getting ID token:", error);
          setIdToken(null);
          toast({ variant: "destructive", title: "Token Error", description: "Could not retrieve authentication token." });
        }
      } else {
        setIdToken(null);
      }
      setIsLoading(false);
    });

    // Refresh token periodically or on specific events if needed
    // Firebase SDK handles most token refreshes automatically
    // but you can listen to idTokenChanged for more granular control
    const idTokenListener = auth.onIdTokenChanged(async (userWithPotentiallyNewToken) => {
        if (userWithPotentiallyNewToken) {
            const token = await userWithPotentiallyNewToken.getIdToken();
            setIdToken(token);
        } else {
            setIdToken(null);
        }
    });


    return () => {
      unsubscribe();
      idTokenListener();
    }
  }, [auth, toast]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user and token
      toast({ title: "Login Successful", description: "Welcome back!" });
    } catch (error: any) {
      console.error("Error during Google sign-in:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Could not sign in with Google." });
      setIsLoading(false); // Ensure loading is false on error
    }
    // setIsLoading(false) is handled by onAuthStateChanged
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle clearing user and token
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      console.error("Error during sign-out:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message || "Could not log out." });
    } finally {
      // Even if signOut errors, onAuthStateChanged should fire with null user
      // setIsLoading(false) is handled by onAuthStateChanged
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, isLoading, idToken }}>
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
