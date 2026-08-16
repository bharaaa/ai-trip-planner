import { supabase } from '@/lib/supabase';

export const authService = {
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  signUp: async (email: string, password: string, name: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  },
};
