import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { PageTransition } from '@/components/motion/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AnimatePresence, motion } from 'motion/react';
import { authService } from '@/services/auth/authService';

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
    
    const { error } = await authService.signIn(email, password);
    
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
    <div className="w-full flex flex-col items-center">
      <motion.div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center text-4xl mb-8">
          <span className="text-accent-400 drop-shadow-lg scale-150">◆</span>
        </div>
        <h2 className="mt-2 text-center text-4xl sm:text-5xl font-black tracking-tighter text-white drop-shadow-md">
          Welcome back
        </h2>
        <p className="mt-4 text-center text-warm-300 font-medium tracking-wide">
          Ready to plan your next adventure?
        </p>
      </motion.div>

      <motion.div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div className="mx-4 sm:mx-0 py-8 px-4 sm:px-10 bg-warm-950/60 backdrop-blur-lg border border-white/10 rounded-[2.5rem] shadow-2xl">
          <motion.form className="space-y-6" onSubmit={handleLogin} noValidate>
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
                theme="dark"
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
                theme="dark"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-warm-300">
                  Keep me logged in
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-accent-400 hover:text-accent-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full flex justify-center text-sm font-bold tracking-wider uppercase rounded-full shadow-xl shadow-accent-500/20"
                size="lg"
                isLoading={isLoading}
              >
                Let's go
              </Button>
            </div>
          </motion.form>

          <motion.div className="mt-8">
            <div className="text-center text-sm font-medium">
              <span className="text-warm-400">New here? </span>
              <Link to="/register" className="font-bold text-white hover:text-accent-400 transition-colors">
                Create an account
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
