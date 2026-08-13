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
    >
      {children}
    </motion.div>
  );
};
