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
    console.log('🔐 AuthContext: Setting up auth state listener');
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      console.log('🔐 AuthContext: Auth state changed', { user: firebaseUser?.email || 'null' });
      
      if (firebaseUser) {
        try {
          console.log('👤 AuthContext: Loading user data for', firebaseUser.email);
          
          // First try to get employee data from employees collection
          try {
            console.log('📋 AuthContext: Attempting to import unifiedEmployeeService');
            const { getEmployeeByIdOrEmail } = await import('../lib/unifiedEmployeeService');
            console.log('✅ AuthContext: unifiedEmployeeService imported successfully');
            
            console.log('🔍 AuthContext: Looking up employee by email:', firebaseUser.email);
            const employee = await getEmployeeByIdOrEmail(firebaseUser.email!);
            console.log('📊 AuthContext: Employee lookup result:', employee ? 'found' : 'not found');
            
            if (employee) {
              console.log('👤 AuthContext: Creating user info from employee data');
              const userInfo: User = {
                uid: firebaseUser.uid,
                name: employee.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                email: firebaseUser.email || "",
                position: employee.grade || "Sales Executive", // Use grade as position
              };
              console.log('✅ AuthContext: User info created from employee data:', userInfo.name);
              setUser(userInfo);
            } else {
              console.log('⚠️ AuthContext: No employee found, trying users collection');
              
              // Special handling for admin users
              if (firebaseUser.email && firebaseUser.email.includes('admin')) {
                console.log('🔑 AuthContext: Admin user detected, using admin profile');
                const userInfo: User = {
                  uid: firebaseUser.uid,
                  name: firebaseUser.displayName || 'Admin',
                  email: firebaseUser.email || "",
                  position: "Administrator",
                };
                console.log('✅ AuthContext: Admin user info created:', userInfo.name);
                setUser(userInfo);
                return; // Skip further fallback attempts for admin
              }
              
              // Fallback to users collection
              const { userData, error } = await getUserData(firebaseUser.uid);
              
              if (userData && !error) {
                console.log('✅ AuthContext: User data found in users collection');
                const userInfo: User = {
                  uid: firebaseUser.uid,
                  name: userData.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                  email: firebaseUser.email || "",
                  position: userData.position || "Sales Executive",
                };
                setUser(userInfo);
              } else {
                console.log('⚠️ AuthContext: No user data found, using fallback');
                // Ultimate fallback if no data found
                const userInfo: User = {
                  uid: firebaseUser.uid,
                  name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                  email: firebaseUser.email || "",
                  position: "Sales Executive",
                };
                setUser(userInfo);
              }
            }
          } catch (importError) {
            console.error('❌ AuthContext: Error importing or using employeeService:', importError);
            console.log('⚠️ AuthContext: Falling back to users collection only');
            
            // Fallback to users collection only
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
              // Ultimate fallback
              const userInfo: User = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                email: firebaseUser.email || "",
                position: "Sales Executive",
              };
              setUser(userInfo);
            }
          }
        } catch (error) {
          console.error('❌ AuthContext: Error loading user data:', error);
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
        console.log('🔐 AuthContext: No user, setting to null');
        setUser(null);
      }
      setLoading(false);
      console.log('✅ AuthContext: Auth state processing complete');
    });

    return () => {
      console.log('🔐 AuthContext: Cleaning up auth listener');
      unsubscribe();
    };
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
