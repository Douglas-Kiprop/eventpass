'use client';

import { motion } from 'framer-motion';

const AnimatedSection = ({ children, className, id }) => {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }} // Start with opacity 0 and slightly down
      whileInView={{ opacity: 1, y: 0 }} // Animate to opacity 1 and original position when in view
      viewport={{ once: true, amount: 0.2 }} // Trigger animation once, when 20% of it is in view
      transition={{ duration: 0.6, ease: "easeOut" }} // Animation duration and easing
    >
      {children}
    </motion.section>
  );
};

export default AnimatedSection;