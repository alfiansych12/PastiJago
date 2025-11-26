// contexts/AuthContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, fullName?: string, schoolName?: string, className?: string) => Promise<void>;
  logout: () => void;
  updateUserProgress: (levelId: number, completed: boolean, code?: { html?: string; css?: string; js?: string }) => Promise<void>;
  getUserProgress: (levelId: number) => Promise<boolean>;
  getUserProgressRow: (levelId: number) => Promise<any | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Check auth state on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          fullName: profile.full_name,
          exp: profile.exp,
          level: profile.level,
          role: profile.role,
          schoolName: profile.school_name,
          className: profile.class_name,
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Fetch user profile after successful login
      await fetchUserProfile(data.user.id);
      
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  // contexts/AuthContext.tsx - Tambahkan di bagian register
const register = async (
  email: string, 
  password: string, 
  username: string, 
  fullName?: string, 
  schoolName?: string, 
  className?: string
) => {
  try {
    // 1. Basic validation
    if (!email || !password || !username) {
      throw new Error('Missing required registration fields');
    }

    // 2. Check if username already exists in `users` table
    const { data: existingByUsername, error: usernameError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .limit(1)
      .maybeSingle();

    if (usernameError) {
      console.error('Username lookup error:', usernameError);
      throw new Error('Registration failed while checking username');
    }

    if (existingByUsername) {
      throw new Error('Username already exists');
    }

    // 3. Create auth user via Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password
    });

    if (signUpError) {
      console.error('Supabase signUp error:', signUpError);
      // Pass through message for UI handling
      throw new Error(signUpError.message || 'Registration failed during signup');
    }

    const newUserId = signUpData?.user?.id;
    if (!newUserId) {
      throw new Error('Registration failed: no user id returned');
    }

    // 4. Insert profile into `users` table so app can read profile fields
    const { data: insertedProfile, error: insertError } = await supabase
      .from('users')
      .insert({
        id: newUserId,
        email: email.trim().toLowerCase(),
        username: username,
        full_name: fullName || null,
        school_name: schoolName || null,
        class_name: className || null,
        exp: 0,
        level: 1,
        role: 'student'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting user profile:', insertError);
      // NOTE: we could consider removing the auth user on failure, but that requires service role key
      throw new Error('Registration failed while creating profile');
    }

    // 5. CLEAR LOCALSTORAGE PROGRESS untuk user baru
    localStorage.removeItem('userProgress');
    localStorage.removeItem('projectProgress');
    console.log('LocalStorage cleared for new user');

  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Registration failed');
  }
};

// Juga di logout
const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    
    // Clear localStorage on logout
    localStorage.removeItem('userProgress');
    localStorage.removeItem('projectProgress');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

  const updateUserProgress = async (levelId: number, completed: boolean, code?: { html?: string; css?: string; js?: string }) => {
    if (!authState.user) throw new Error('Not authenticated');

    try {
      const session = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      const res = await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ level_id: levelId, completed, code: code || null })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Error updating progress via API:', err);
        throw new Error(err?.error || 'Failed to update progress');
      }

      const { progress } = await res.json();

      // If server awarded exp, update local user state
      if (progress?.exp_earned && completed) {
        const newExp = (authState.user.exp || 0) + (progress.exp_earned || 0);
        setAuthState(prev => ({ ...prev, user: prev.user ? { ...prev.user, exp: newExp } : null }));
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error instanceof Error ? error : new Error('Unknown error updating progress');
    }
  };

  const getUserProgress = async (levelId: number): Promise<boolean> => {
    if (!authState.user) return false;

    try {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('completed')
        .eq('user_id', authState.user.id)
        .eq('level_id', levelId)
        .single();

      return progress?.completed || false;
    } catch (error) {
      console.error('Error getting progress:', error);
      return false;
    }
  };

  const getUserProgressRow = async (levelId: number): Promise<any | null> => {
    if (!authState.user) return null;

    try {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', authState.user.id)
        .eq('level_id', levelId)
        .single();

      return progress || null;
    } catch (error) {
      console.error('Error getting progress row:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login, 
      register, 
      logout,
      updateUserProgress,
      getUserProgress,
      getUserProgressRow
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ALTER TABLE IF EXISTS public.user_progress
// ADD COLUMN IF NOT EXISTS code jsonb;