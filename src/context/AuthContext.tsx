import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChange, signIn, signUp, logOut, getUserData } from "../lib/auth";

interface User {
  uid: string;
  name: string;
  email: string;
  position: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name: string, position: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore including position
          const { userData, error } = await getUserData(firebaseUser.uid);
          
          if (userData && !error) {
            const userInfo: User = {
              uid: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || "",
              position: userData.position || "Sales Executive",
            };
            setUser(userInfo);
          } else {
            // Fallback if Firestore data not found
            const userInfo: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || "",
              position: "Sales Executive",
            };
            setUser(userInfo);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // Fallback user data
          const userInfo: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            email: firebaseUser.email || "",
            position: "Sales Executive",
          };
          setUser(userInfo);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    return { error };
  };

  const register = async (email: string, password: string, name: string, position: string) => {
    const { error } = await signUp(email, password, name, position);
    return { error };
  };

  const logout = async () => {
    await logOut();
  };

  const value = useMemo(() => ({ 
    isAuthenticated: !!user, 
    user, 
    loading,
    login, 
    register,
    logout 
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
