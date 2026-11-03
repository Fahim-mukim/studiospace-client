"use client";

import { motion, useReducedMotion } from "motion/react";

export function HoverLift({ children, className = "" }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
    >
      {children}
    </motion.div>
  );
}
