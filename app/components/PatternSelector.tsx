"use client";

import React from "react";

interface PatternSelectorProps {
  currentPattern: string;
  onPatternChange: (pattern: string) => void;
}

const PATTERNS = [
  { id: "dots", label: "·", name: "Dots" },
  { id: "grid", label: "⊞", name: "Grid" },
  { id: "lines", label: "≡", name: "Lines" },
  { id: "crosses", label: "✛", name: "Crosses" },
];

export function PatternSelector({ currentPattern, onPatternChange }: PatternSelectorProps) {
  return (
    <div className="flex gap-1 bg-white border-[3px] border-black rounded-lg shadow-[4px_4px_0_black] p-1.5">
      {PATTERNS.map((pattern) => (
        <button
          key={pattern.id}
          onClick={() => onPatternChange(pattern.id)}
          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all border-2 border-black ${currentPattern === pattern.id ? 'bg-black text-white shadow-[2px_2px_0_gray-400]' : 'bg-white hover:bg-[#FCE996] shadow-[2px_2px_0_black]'}`}
          title={pattern.name}
        >
          {pattern.label}
        </button>
      ))}
    </div>
  );
}