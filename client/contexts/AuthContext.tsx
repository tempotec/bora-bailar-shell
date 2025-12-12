import React, { createContext, useState, ReactNode } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  userName: string;
  setUserName: (value: string) => void;
  userEmail: string;
  setUserEmail: (value: string) => void;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  userName: "",
  setUserName: () => {},
  userEmail: "",
  setUserEmail: () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        userName,
        setUserName,
        userEmail,
        setUserEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
