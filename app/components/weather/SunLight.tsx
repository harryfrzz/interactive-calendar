"use client";

import { motion } from "framer-motion";

export function SunLight() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 mix-blend-screen">
      <motion.div
        className="absolute -top-16 -left-16 w-[350px] h-[350px] bg-gradient-to-br from-[#FFF8E7]/90 via-[#FFD700]/30 to-transparent rounded-full blur-[60px]"
        initial={{ opacity: 0.8, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1.05 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
      {/* Sun Core / Flare */}
      <motion.div
        className="absolute top-0 left-0 w-[150px] h-[150px] bg-white/40 rounded-full blur-[20px]"
        initial={{ opacity: 0.5, scale: 0.8 }}
        animate={{ opacity: 0.8, scale: 1.2 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}