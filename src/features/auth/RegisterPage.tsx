import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { PageTransition } from '@/components/motion/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'motion/react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    // Custom email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    setIsLoading(true);
    
    // 1. Sign up the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
      return;
    }

    if (data?.user) {
      // 2. Create the user profile in our public `users` table
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        name,
        email
      });

      if (profileError) {
        console.error('Failed to create profile:', profileError);
        // We won't block the user, but we should log it.
        // Make sure to add the RLS INSERT policy for the users table!
      }

      setSuccessMsg('Registration successful! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
    
    setIsLoading(false);
  };

  return (
    <PageTransition className="min-h-screen bg-warm-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-4xl mb-6">
          <span className="text-accent-500">◆</span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-warm-900">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-warm-500">
          Start planning your next adventure today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="mx-4 sm:mx-0 py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleRegister} noValidate>
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  key={errorMsg}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-4 bg-red-50/80 backdrop-blur-sm text-red-700 text-sm rounded-xl border border-red-200 shadow-sm overflow-hidden"
                >
                  <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="font-medium">{errorMsg}</p>
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  key={successMsg}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-4 bg-green-50/80 backdrop-blur-sm text-green-700 text-sm rounded-xl border border-green-200 shadow-sm overflow-hidden"
                >
                  <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium">{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div>
              <Input
                label="Full Name"
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bhara"
              />
            </div>

            <div>
              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center"
                size="lg"
                isLoading={isLoading}
              >
                Sign up
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-warm-500">Already have an account? </span>
            <Link to="/login" className="font-medium text-accent-600 hover:text-accent-500 transition-colors">
              Sign in instead
            </Link>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};
