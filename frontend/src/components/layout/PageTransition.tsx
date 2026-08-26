"use client";

import { motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0, y: 8 },
  enter: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 260, 
      damping: 22,
      mass: 0.8
    } 
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: "easeIn" as const } },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      className="w-full h-full min-w-0 flex flex-col flex-1"
      data-scroll-reveal-ignore="true"
    >
      {children}
    </motion.div>
  );
}
