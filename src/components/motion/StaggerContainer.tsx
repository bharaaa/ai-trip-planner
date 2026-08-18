import React from 'react';
import { motion } from 'motion/react';
import { staggerContainerVariants } from '@/lib/motion';

export const StaggerContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
