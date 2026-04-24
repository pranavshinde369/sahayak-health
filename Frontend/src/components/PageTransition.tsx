import { motion } from "framer-motion";
import { ReactNode } from "react";

export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
