import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

import { AppRole } from "@/types/auth";

// Mock User Interface to match Supabase User shape roughly
interface MockUser extends User {
  user_metadata: {
    full_name?: string;
    app_role?: AppRole;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  userRole: AppRole | null;
  switchRole: (role: AppRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem("mock_user");
    const storedRole = localStorage.getItem("mock_role");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setSession({
        user: parsedUser,
        access_token: "mock_token",
        refresh_token: "mock_refresh_token",
        expires_in: 3600,
        token_type: "bearer",
      });
      if (storedRole) {
        setUserRole(storedRole as AppRole);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role?: AppRole) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newUser: MockUser = {
      id: crypto.randomUUID(),
      email: email,
      aud: "authenticated",
      role: "authenticated",
      created_at: new Date().toISOString(),
      app_metadata: { provider: "email" },
      user_metadata: {
        full_name: fullName,
        app_role: role,
      },
      confirmed_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      phone: "",
      last_sign_in_at: new Date().toISOString(),
      factors: [],
      identities: [],
      updated_at: new Date().toISOString(),
    };

    // Determine Role
    let finalRole: AppRole = role || 'citizen';
    if (email === 'loganthp55@gmail.com') {
      finalRole = 'admin';
    }

    // Persist
    localStorage.setItem("mock_user", JSON.stringify(newUser));
    localStorage.setItem("mock_role", finalRole);

    setUser(newUser);
    setUserRole(finalRole);
    setSession({
      user: newUser,
      access_token: "mock_token",
      refresh_token: "mock_refresh_token",
      expires_in: 3600,
      token_type: "bearer",
    });

    toast({
      title: "Account created!",
      description: "You have successfully signed up (Mock Mode).",
    });

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For mock, we just create a session for whoever tries to login if they pass a "check"
    // But since we want to allow "any" login for testing, we'll just recreate the user session based on input
    // In a real mock, we might check against a list of stored users, but here we keep it simple.

    // Check if we already have this user stored (simulating DB lookup)
    let storedUser = localStorage.getItem("mock_user");
    let currentUser: MockUser;
    let currentRole: AppRole = 'citizen'; // Default

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.email === email) {
        currentUser = parsed;
        currentRole = (localStorage.getItem("mock_role") as AppRole) || 'citizen';
      } else {
        // Fallback: create new mock user on the fly for this session if it doesn't match
        currentUser = {
          id: crypto.randomUUID(),
          email: email,
          aud: "authenticated",
          role: "authenticated",
          created_at: new Date().toISOString(),
          app_metadata: { provider: "email" },
          user_metadata: { full_name: "Mock User" },
          confirmed_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          phone: "",
          last_sign_in_at: new Date().toISOString(),
          factors: [],
          identities: [],
          updated_at: new Date().toISOString(),
        };
      }
    } else {
      // Create fresh
      currentUser = {
        id: crypto.randomUUID(),
        email: email,
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
        app_metadata: { provider: "email" },
        user_metadata: { full_name: "Mock User" },
        confirmed_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        phone: "",
        last_sign_in_at: new Date().toISOString(),
        factors: [],
        identities: [],
        updated_at: new Date().toISOString(),
      };
    }

    // Force Admin for specific email
    if (email === 'loganthp55@gmail.com') {
      currentRole = 'admin';
    }

    // Persist
    localStorage.setItem("mock_user", JSON.stringify(currentUser));
    localStorage.setItem("mock_role", currentRole);

    setUser(currentUser);
    setUserRole(currentRole);
    setSession({
      user: currentUser,
      access_token: "mock_token",
      refresh_token: "mock_refresh_token",
      expires_in: 3600,
      token_type: "bearer",
    });

    toast({
      title: "Welcome back!",
      description: "Signed in successfully (Mock Mode).",
    });

    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem("mock_user");
    localStorage.removeItem("mock_role");
    setUser(null);
    setSession(null);
    setUserRole(null);

    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const switchRole = (role: AppRole) => {
    setUserRole(role);
    localStorage.setItem("mock_role", role);
    toast({
      title: "Role Switched",
      description: `You are now viewing as ${role}.`,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        userRole,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
