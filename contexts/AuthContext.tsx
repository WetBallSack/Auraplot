import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { supabase } from '../utils/supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  upgradeSubscription: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    const initAuth = async () => {
      try {
        const currentUser = await api.getProfile();
        setUser(currentUser);
      } catch (e) {
        // No active session found or error
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // 2. Listen for Supabase Auth Changes (Sign In, Sign Out, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
        // Map Supabase user to App user
        const u = session.user;
        setUser({
        id: u.id,
        name: u.user_metadata?.name || u.email?.split('@')[0] || 'Traveler',
        email: u.email || '',
        isPro: u.user_metadata?.is_pro || false,
        hasSeenOnboarding: u.user_metadata?.has_seen_onboarding || false,
        joinedAt: u.created_at,
        });
    } else {
        setUser(null);
    }
    setIsLoading(false);
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    // api.login calls Supabase, which triggers onAuthStateChange
    await api.login(email, password);
  };

  const register = async (name: string, email: string, password: string) => {
    await api.register(name, email, password);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const upgradeSubscription = async () => {
    if (!user) return;
    const updatedUser = await api.upgradeToPro(user.id);
    setUser(updatedUser);
  };

  const completeOnboarding = async () => {
    if (!user) return;
    const updatedUser = await api.completeOnboarding();
    setUser(updatedUser);
  };

  const updateName = async (name: string) => {
    const updatedUser = await api.updateProfile(name);
    setUser(updatedUser);
  };

  const updateEmail = async (email: string) => {
      await api.updateEmail(email);
  }

  const changePassword = async (oldPass: string, newPass: string) => {
    await api.updatePassword(oldPass, newPass);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        register, 
        logout,
        upgradeSubscription,
        updateName,
        updateEmail,
        changePassword,
        completeOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};