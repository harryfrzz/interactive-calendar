"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Leaf {
  id: number;
  startX: number;
  drift: number;
  color: string;
  scale: number;
  startRot: number;
  rotOffset: number;
  duration: number;
  delay: number;
}

export function Leaves() {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    // Generate leaves only once to prevent re-render thrashing
    const colors = [
      "text-[#e67e22]",
      "text-[#d35400]",
      "text-[#c0392b]",
      "text-[#f39c12]",
      "text-[#cc4125]"
    ];
    
    const newLeaves = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      startX: Math.random() * 1000 - 100,
      drift: Math.random() * 300 - 150,
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: Math.random() * 0.4 + 0.4,
      startRot: Math.random() * 360,
      rotOffset: Math.random() > 0.5 ? 360 : -360,
      duration: 5 + Math.random() * 5,
      delay: -(Math.random() * 5),
    }));
    setLeaves(newLeaves);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-90">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className={`absolute ${leaf.color} drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] flex items-center justify-center`}
          style={{ width: "24px", height: "24px" }}
          initial={{
            x: leaf.startX,
            y: -50,
            opacity: 0,
            rotate: leaf.startRot,
            scale: leaf.scale,
          }}
          animate={{
            y: 500,
            x: `calc(${leaf.startX}px + ${leaf.drift}px)`,
            opacity: [0, 1, 1, 0],
            rotate: leaf.startRot + leaf.rotOffset,
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: "linear",
          }}
        >
          {/* Maple Leaf SVG */}
          <svg viewBox="0 0 256 256" className="w-full h-full fill-current stroke-black/40" strokeWidth="6" strokeLinejoin="round">
            <path d="M128,15 L100,75 L27,55 L57,110 L10,135 L65,160 L45,230 L105,190 L125,235 L145,190 L205,230 L185,160 L240,135 L193,110 L223,55 L150,75 Z" />
            {/* Stem */}
            <path d="M128,210 L128,250" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="drop-shadow-none" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}