import React from 'react';
import { motion } from 'motion/react';
import { staggerItemVariants } from '@/lib/motion';

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <motion.div
      variants={staggerItemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
