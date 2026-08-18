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
  const [rememberMe, setRememberMe] = useState(false);
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
    <>
      <form className="space-y-6" onSubmit={handleLogin} noValidate>
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              key={errorMsg}
              initial={{ opacity: 0, y: -20, height: 0, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, height: 'auto', filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 20, height: 0, filter: 'blur(5px)' }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 15,
                mass: 0.8
              }}
              className="flex items-center gap-3 bg-error-500/10 backdrop-blur-md text-error-400 text-sm rounded-2xl border border-error-500/20 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 w-full">
                <svg className="w-5 h-5 flex-shrink-0 text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-semibold">{errorMsg}</p>
              </div>
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
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => setRememberMe(!rememberMe)}
          >
            <div 
              className={`
                w-5 h-5 rounded-md border flex items-center justify-center transition-colors duration-200
                ${rememberMe 
                  ? 'bg-accent-500 border-accent-500' 
                  : 'bg-white/5 border-white/20 group-hover:border-white/40'
                }
              `}
            >
              <AnimatePresence>
                {rememberMe && (
                  <motion.svg 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="w-3.5 h-3.5 text-warm-950" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={3}
                  >
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M5 13l4 4L19 7" 
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="sr-only"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="ml-2.5 block text-sm font-medium text-warm-300 cursor-pointer group-hover:text-warm-100 transition-colors">
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
      </form>

      <div className="mt-8">
        <div className="text-center text-sm font-medium">
          <span className="text-warm-400">New here? </span>
          <Link to="/register" className="font-bold text-white hover:text-accent-400 transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </>
  );
};
