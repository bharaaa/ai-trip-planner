import React from 'react';
import { motion } from 'motion/react';
import { pageVariants, motionConfig } from '@/lib/motion';

export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: motionConfig.duration.normal, ease: motionConfig.easing.standard }}
      className={className}
      onAnimationComplete={(definition) => {
        if (definition === 'animate') {
          // Clear the transform left by Framer Motion which breaks position: sticky for all descendants
          const el = document.getElementById('page-transition-container');
          if (el) el.style.transform = 'none';
        }
      }}
      id="page-transition-container"
    >
      {children}
    </motion.div>
  );
};
