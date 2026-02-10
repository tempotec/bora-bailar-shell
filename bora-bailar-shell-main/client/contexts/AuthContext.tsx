/**
 * Authentication Context
 * Provides auth state and methods throughout the app
 */
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from "react";
import { tokenStore } from "@/services/tokenStore";
import { authService, AuthUser } from "@/services/authService";

type AuthContextType = {
  // States
  initializing: boolean;
  isLoggedIn: boolean;
  user: AuthUser | null;

  // Methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextType>({
  initializing: true,
  isLoggedIn: false,
  user: null,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
  updateUser: () => { },
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [initializing, setInitializing] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Restore session on app start
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = await tokenStore.get();

      if (!token) {
        // No token, user is logged out
        setInitializing(false);
        return;
      }

      // Try to get user data with existing token
      const response = await authService.me();
      setUser(response.user);
      setIsLoggedIn(true);

      if (__DEV__) {
        console.log("[Auth] Session restored for:", response.user.email);
      }
    } catch (error: any) {
      // Token invalid or expired (401), clear everything
      if (__DEV__) {
        console.log("[Auth] Session restore failed:", error.message);
      }
      await tokenStore.clear();
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setInitializing(false);
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });

      // Store token securely
      await tokenStore.set(response.token);

      // Update state
      setUser(response.user);
      setIsLoggedIn(true);

      if (__DEV__) {
        console.log("[Auth] Logged in:", response.user.email);
      }
    } catch (error) {
      throw error; // Let the UI handle the error
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await authService.register({ name, email, password });

      // Store token securely
      await tokenStore.set(response.token);

      // Update state
      setUser(response.user);
      setIsLoggedIn(true);

      if (__DEV__) {
        console.log("[Auth] Registered:", response.user.email);
      }
    } catch (error) {
      throw error; // Let the UI handle the error
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await tokenStore.clear();
      setUser(null);
      setIsLoggedIn(false);

      if (__DEV__) {
        console.log("[Auth] Logged out");
      }
    } catch (error) {
      console.error("[Auth] Sign out error:", error);
      // Still clear local state even if there's an error
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        initializing,
        isLoggedIn,
        user,
        signIn,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthContext };
