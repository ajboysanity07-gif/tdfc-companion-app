import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getUser, logout as apiLogout } from "../api/auth-api";

type User = {
  id: number;
  email: string;
  fullname: string;
  // Add more user fields your backend returns, e.g., role, avatar, etc.
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider: wrap your app with this!
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Try loading the user on mount (if they have a Sanctum cookie)
  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await getUser();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Logout and clear auth state
  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    fetchUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use in components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
