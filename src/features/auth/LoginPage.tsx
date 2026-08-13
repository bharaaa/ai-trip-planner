import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { PageTransition } from '@/components/motion/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTripStore } from '@/stores/tripStore';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from '@/lib/supabase';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Custom email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    setIsLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg("Hmm, that email or password doesn't look right. Give it another try!");
      } else {
        setErrorMsg("Oops, something went wrong on our end. Please try again.");
      }
    } else {
      navigate('/');
    }
  };

  return (
    <PageTransition className="min-h-screen bg-warm-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-4xl mb-6">
          <span className="text-accent-500">◆</span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-warm-900">
          Welcome back!
        </h2>
        <p className="mt-2 text-center text-sm text-warm-500">
          Ready to plan your next adventure?
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="mx-4 sm:mx-0 py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin} noValidate>
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
            </AnimatePresence>
            <div>
              <Input
                label="Email"
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-warm-300 text-accent-500 focus:ring-accent-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-warm-900">
                  Keep me logged in
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-accent-600 hover:text-accent-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center"
                size="lg"
                isLoading={isLoading}
              >
                Let's go
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="mt-6 text-center text-sm">
              <span className="text-warm-500">New here? </span>
              <Link to="/register" className="font-medium text-accent-600 hover:text-accent-500 transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};
