import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';

export const AuthLayout: React.FC = () => {
  const location = useLocation();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-warm-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
    >
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

      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
        {/* Dynamic Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 mb-8 mt-4">
          <div className="flex justify-center text-4xl mb-8">
            <span className="text-accent-400 drop-shadow-lg scale-150">◆</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <h2 className="mt-2 text-4xl sm:text-5xl font-black tracking-tighter text-white drop-shadow-md">
                {location.pathname === '/login' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="mt-4 text-warm-300 font-medium tracking-wide">
                {location.pathname === '/login' 
                  ? 'Ready to plan your next adventure?' 
                  : 'Start planning your next adventure today'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Static Glass Card */}
        <motion.div 
          layout
          className="mx-4 sm:mx-0 w-full sm:max-w-md bg-warm-950/60 backdrop-blur-lg border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          <div className="grid [grid-area:1/1] w-full">
            <AnimatePresence custom={location.pathname}>
              <motion.div
                key={location.pathname}
                custom={location.pathname}
                initial={{ opacity: 0, x: location.pathname === '/login' ? -40 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: location.pathname === '/login' ? 40 : -40 }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                className="w-full [grid-area:1/1] py-8 px-4 sm:px-10"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
