"use client";

import { motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0, y: 15 },
  enter: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 100, 
      damping: 15,
      mass: 1
    } 
  },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      className="w-full h-full"
      data-scroll-reveal-ignore="true"
    >
      {children}
    </motion.div>
  );
}
