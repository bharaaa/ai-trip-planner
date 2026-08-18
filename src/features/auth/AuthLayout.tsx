import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';

export const AuthLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-warm-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Full Bleed Background Image with Subtle Pan */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2000" 
          alt="Travel Landscape" 
          className="w-full h-full object-cover opacity-40"
          initial={{ scale: 1.05, x: 0 }}
          animate={{ scale: 1.1, x: -20 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-warm-950 via-warm-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-warm-950/80 via-transparent to-warm-950/80" />
      </div>

      {/* Floating Ambient Orbs (Highlights the glassmorphism) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center">
        <motion.div 
          className="absolute w-96 h-96 bg-accent-500/20 rounded-full blur-[100px]"
          animate={{ 
            x: [-50, 50, -50], 
            y: [-20, 30, -20] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-[30rem] h-[30rem] bg-warm-400/10 rounded-full blur-[120px]"
          animate={{ 
            x: [50, -50, 50], 
            y: [30, -20, 30] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 w-full flex-1 grid overflow-hidden">
        <AnimatePresence custom={location.pathname}>
          <motion.div
            key={location.pathname}
            custom={location.pathname}
            initial={{ opacity: 0, x: location.pathname === '/login' ? -50 : 50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: location.pathname === '/login' ? 50 : -50, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="w-full flex flex-col items-center justify-center [grid-area:1/1]"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
