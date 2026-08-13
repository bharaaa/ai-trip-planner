import React from 'react';
import { motion } from 'motion/react';
import { slideUpVariants, motionConfig } from '@/lib/motion';

export const SlideUp: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideUpVariants}
      transition={{ duration: motionConfig.duration.normal, ease: motionConfig.easing.standard, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
