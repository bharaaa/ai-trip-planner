import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { PageTransition } from '@/components/motion/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth/authService';
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

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    
    // 1. Sign up the user in Supabase Auth
    const { data, error } = await authService.signUp(email, password, name);

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        setErrorMsg('An account with this email already exists.');
      } else {
        setErrorMsg('Failed to create account. Please check your information and try again.');
      }
      setIsLoading(false);
      return;
    }

    if (data?.user) {
      // We now rely on a Supabase Database Trigger (auth.users -> public.users)
      // to automatically create the user profile upon signup.

      setSuccessMsg('Registration successful! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center text-4xl mb-8">
          <span className="text-accent-400 drop-shadow-lg scale-150">◆</span>
        </div>
        <h2 className="mt-2 text-center text-4xl sm:text-5xl font-black tracking-tighter text-white drop-shadow-md">
          Create an account
        </h2>
        <p className="mt-4 text-center text-warm-300 font-medium tracking-wide">
          Start planning your next adventure today
        </p>
      </motion.div>

      <motion.div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div className="mx-4 sm:mx-0 py-8 px-4 sm:px-10 bg-warm-950/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl">
          <motion.form className="space-y-6" onSubmit={handleRegister} noValidate>
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  key={errorMsg}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-4 bg-error-500/10 backdrop-blur-md text-error-400 text-sm rounded-2xl border border-error-500/20 shadow-sm overflow-hidden"
                >
                  <svg className="w-5 h-5 flex-shrink-0 text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="font-semibold">{errorMsg}</p>
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  key={successMsg}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-4 bg-green-500/10 backdrop-blur-md text-green-400 text-sm rounded-2xl border border-green-500/20 shadow-sm overflow-hidden"
                >
                  <svg className="w-5 h-5 flex-shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold">{successMsg}</p>
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
                theme="dark"
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
                theme="dark"
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
                theme="dark"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full flex justify-center text-sm font-bold tracking-wider uppercase rounded-full shadow-xl shadow-accent-500/20"
                size="lg"
                isLoading={isLoading}
              >
                Sign up
              </Button>
            </div>
          </motion.form>

          <motion.div className="mt-8">
            <div className="text-center text-sm font-medium">
              <span className="text-warm-400">Already have an account? </span>
              <Link to="/login" className="font-bold text-white hover:text-accent-400 transition-colors">
                Log in instead
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
