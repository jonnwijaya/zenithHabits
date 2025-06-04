
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert"; // For displaying general errors
import { LogIn } from "lucide-react";

const signUpSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters.").optional(),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

interface AuthFormDialogProps {
  triggerButton?: React.ReactNode;
  initialMode?: "login" | "signup";
}

export function AuthFormDialog({ triggerButton, initialMode = "login" }: AuthFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { signUpWithEmailPassword, signInWithEmailPassword, isLoading } = useAuth();
  const { toast } = useToast();

  const currentSchema = mode === "signup" ? signUpSchema : loginSchema;
  const form = useForm<SignUpFormValues | LoginFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === "signup" && { displayName: "" }),
    },
  });

  const onSubmit = async (data: SignUpFormValues | LoginFormValues) => {
    setFormError(null);
    try {
      if (mode === "signup") {
        const { email, password, displayName } = data as SignUpFormValues;
        await signUpWithEmailPassword(email, password, displayName);
      } else {
        const { email, password } = data as LoginFormValues;
        await signInWithEmailPassword(email, password);
      }
      setIsOpen(false); // Close dialog on success
      form.reset();
    } catch (error: any) {
      setFormError(error.message || "An unexpected error occurred.");
    }
  };

  const toggleMode = () => {
    setMode(prevMode => prevMode === "login" ? "signup" : "login");
    setFormError(null);
    form.reset(); // Reset form when mode changes
  };
  
  const defaultTrigger = (
    <Button variant="outline">
      <LogIn className="mr-2 h-4 w-4" /> Login / Sign Up
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        form.reset();
        setFormError(null);
        // setMode(initialMode); // Reset mode if needed when dialog closes
      }
    }}>
      <DialogTrigger asChild>{triggerButton || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "signup" ? "Create an Account" : "Log In"}</DialogTitle>
          <DialogDescription>
            {mode === "signup"
              ? "Fill in your details to get started."
              : "Enter your credentials to access your account."}
          </DialogDescription>
        </DialogHeader>
        {formError && (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {mode === "signup" && (
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="link" onClick={toggleMode} className="mr-auto pl-0 text-sm">
                {mode === "login" ? "Need an account? Sign Up" : "Already have an account? Log In"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (mode === "signup" ? "Signing Up..." : "Logging In...") : (mode === "signup" ? "Sign Up" : "Log In")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
