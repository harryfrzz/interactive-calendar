"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RainDrop {
  id: number;
  startX: number;
  duration: number;
  delay: number;
  height: number;
  thickness: number;
  opacity: number;
}

export function Rain() {
  const [drops, setDrops] = useState<RainDrop[]>([]);

  useEffect(() => {
    // Generate drops only once to prevent re-render thrashing
    const newDrops = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      startX: Math.random() * 1000 - 200,
      duration: 0.8 + Math.random() * 0.5,
      delay: -(Math.random() * 5),
      height: 15 + Math.random() * 20,
      thickness: Math.random() > 0.5 ? 1 : 1.5,
      opacity: 0.3 + Math.random() * 0.5,
    }));
    setDrops(newDrops);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-80">
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute bg-gradient-to-t from-white to-transparent rounded-full shadow-[0_0_2px_white]"
          style={{
            width: `${drop.thickness}px`,
            height: `${drop.height}px`,
            opacity: drop.opacity,
          }}
          initial={{
            x: drop.startX,
            y: -100,
            rotate: 20,
          }}
          animate={{
            y: 500,
            x: `calc(${drop.startX}px + 200px)`,
          }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            delay: drop.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}