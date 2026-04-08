import React from "react";
import { Shadows_Into_Light } from "next/font/google";

const shadows = Shadows_Into_Light({ weight: "400", subsets: ["latin"] });

interface StickyNoteProps {
  note?: string;
  onNoteChange?: (note: string) => void;
  interactive?: boolean;
}

export function StickyNote({ note, onNoteChange, interactive = true }: StickyNoteProps) {
  return (
    <div className="absolute top-12 right-1 sm:top-14 w-32 h-36 sm:w-40 sm:h-44 z-50 pointer-events-auto transition-transform duration-300 rotate-3 hover:scale-105 active:scale-95 group">
      
      {/* Hand-drawn SVG Background with Neobrutalist Depth */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="0 0 220 230" 
        preserveAspectRatio="none"
      >
        {/* Neobrutalist Solid Black Shadow for Note (Sharp offset) */}
        <path 
          d="M 34,54 Q 114,52 194,56 Q 196,134 192,209 Q 114,211 36,207 Q 32,134 34,54 Z" 
          fill="#000000" 
        />

        {/* Main Note Fill */}
        <path 
          d="M 20,40 Q 100,38 180,42 Q 182,120 178,195 Q 100,197 22,193 Q 18,120 20,40 Z" 
          fill="#FCE996" 
          stroke="black"
          strokeWidth="2.5"
        />

        {/* Sketchy overlapping borders for the note */}
        <path d="M 15,42 Q 100,39 185,41" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <path d="M 179,35 Q 183,120 177,200" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <path d="M 183,194 Q 100,198 17,192" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <path d="M 21,198 Q 17,120 21,35" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />

        {/* Neobrutalist Solid Black Shadow for Tape */}
        <path 
          fill="#000000" 
        />

        {/* Tape Fill & Outline */}
        <path 
          d="M 85,15 L 90,5 L 95,12 L 100,6 L 105,14 L 110,8 L 115,15 L 113,75 L 105,70 L 100,77 L 95,70 L 90,75 L 87,70 Z" 
          fill="white" 
          stroke="black" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Extra tape sketchy lines */}
        <path d="M 83,15 L 88,5 L 93,12 L 98,6 L 103,14 L 108,8 L 113,15" fill="none" stroke="black" strokeWidth="2" />
      </svg>

      {/* Text Area */}
      <div className="absolute top-[26%] left-[15%] w-[70%] h-[58%] z-10 flex flex-col">
        <textarea
          value={note || ""}
          onChange={(e) => onNoteChange?.(e.target.value)}
          disabled={!interactive}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Notes..."
          className={`w-full h-full bg-transparent resize-none outline-none text-black text-[16px] sm:text-[18px] font-bold leading-relaxed placeholder:text-black/50 ${shadows.className}`}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
