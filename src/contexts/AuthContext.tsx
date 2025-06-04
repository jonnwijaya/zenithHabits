
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import type { ReactNode} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { app } from '@/lib/firebase'; 
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  signUpWithEmailPassword: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
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
  const auth = getAuth(app); 

  useEffect(() => {
    setIsLoading(true);
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

    const idTokenListener = auth.onIdTokenChanged(async (userWithPotentiallyNewToken) => {
        if (userWithPotentiallyNewToken) {
            try {
                const token = await userWithPotentiallyNewToken.getIdToken(true); // Force refresh if needed
                setIdToken(token);
            } catch (error) {
                console.error("Error refreshing ID token:", error);
                setIdToken(null);
            }
        } else {
            setIdToken(null);
        }
    });

    return () => {
      unsubscribe();
      idTokenListener();
    }
  }, [auth, toast]);

  const signUpWithEmailPassword = async (email: string, password: string, displayName?: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        // Manually trigger a user update to reflect displayName immediately,
        // as onAuthStateChanged might be slightly delayed.
        setUser(auth.currentUser); 
      }
      toast({ title: "Sign Up Successful", description: "Welcome! Your account has been created." });
    } catch (error: any) {
      console.error("Error during email/password sign-up:", error);
      toast({ variant: "destructive", title: "Sign Up Failed", description: error.message || "Could not create your account." });
      throw error; // Re-throw to be caught by the form
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login Successful", description: "Welcome back!" });
    } catch (error: any) {
      console.error("Error during email/password sign-in:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Could not sign in." });
      throw error; // Re-throw to be caught by the form
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      console.error("Error during sign-out:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message || "Could not log out." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUpWithEmailPassword, signInWithEmailPassword, logout, isLoading, idToken }}>
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
