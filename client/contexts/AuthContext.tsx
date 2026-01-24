import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/services/api";
import { User } from "@/services/mock/db";

type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signUp: (name: string, email: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginDemo: () => Promise<void>; // Quick demo login for testing
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: true,
  user: null,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
  loginDemo: async () => { },
});

type AuthProviderProps = {
  children: ReactNode;
};

const SESSION_KEY = "BORABAILAR_SESSION_TOKEN";

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = await AsyncStorage.getItem(SESSION_KEY);
      if (token) {
        const userData = await api.auth.checkSession(token);
        setUser(userData);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.log("Session restore failed", e);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await api.auth.signIn(email);
      if (token) {
        await AsyncStorage.setItem(SESSION_KEY, token);
      }
      setUser(user);
      setIsLoggedIn(true);
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await api.auth.signUp({ name, email });
      if (token) {
        await AsyncStorage.setItem(SESSION_KEY, token);
      }
      setUser(user);
      setIsLoggedIn(true);
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem(SESSION_KEY);
      if (token) {
        await api.auth.signOut(token);
      }
      await AsyncStorage.removeItem(SESSION_KEY);
      setUser(null);
      setIsLoggedIn(false);
    } catch (e) {
      console.error("SignOut failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      // Try to sign in with demo user
      await signIn("demo@borabailar.com");
    } catch (e: any) {
      // If user doesn't exist, create it
      if (e?.message?.includes("não encontrado")) {
        await signUp("Demo User", "demo@borabailar.com");
      } else {
        throw e;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        signIn,
        signUp,
        signOut,
        loginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
