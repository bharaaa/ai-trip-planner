import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as AppUser } from '@/types';

interface AuthState {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  
  initialize: () => void;
  signOut: () => Promise<void>;
}

const mapSessionToUser = (sessionUser: SupabaseUser): AppUser => ({
  id: sessionUser.id,
  email: sessionUser.email || '',
  name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User'
});

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  supabaseUser: null,
  isLoading: true,

  initialize: () => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({ 
          supabaseUser: session.user, 
          user: mapSessionToUser(session.user),
          isLoading: false 
        });
      } else {
        set({ user: null, supabaseUser: null, isLoading: false });
      }
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ 
          supabaseUser: session.user, 
          user: mapSessionToUser(session.user),
          isLoading: false 
        });
      } else {
        set({ user: null, supabaseUser: null, isLoading: false });
      }
    });
  },

  signOut: async () => {
    // Clear trips state to prevent data leakage between accounts on the same device
    const { useTripStore } = await import('./tripStore');
    useTripStore.getState().clearTrips();
    
    await supabase.auth.signOut();
  }
}));
