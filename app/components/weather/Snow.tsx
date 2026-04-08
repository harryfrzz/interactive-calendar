"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Flake {
  id: number;
  startX: number;
  drift: number;
  scale: number;
  duration: number;
  delay: number;
}

export function Snow() {
  const [flakes, setFlakes] = useState<Flake[]>([]);

  useEffect(() => {
    // Generate flakes only once to prevent re-render thrashing
    const newFlakes = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      startX: Math.random() * 800 - 100,
      drift: Math.random() * 100 - 50,
      scale: Math.random() * 0.8 + 0.4,
      duration: 3 + Math.random() * 3,
      delay: -(Math.random() * 5),
    }));
    setFlakes(newFlakes);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-90">
      {flakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute w-2 h-2 bg-white/90 rounded-full blur-[1px] shadow-[0_0_4px_white]"
          initial={{
            x: flake.startX,
            y: -50,
            opacity: 0,
            scale: flake.scale,
          }}
          animate={{
            y: 400,
            x: `calc(${flake.startX}px + ${flake.drift}px)`,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}