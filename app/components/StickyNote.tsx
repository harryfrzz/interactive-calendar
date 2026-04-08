import React, { useState, useRef, useEffect } from "react";
import { Shadows_Into_Light } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

const shadows = Shadows_Into_Light({ weight: "400", subsets: ["latin"] });

interface NoteContentProps {
  expanded?: boolean;
  note?: string;
  onNoteChange?: (note: string) => void;
  interactive?: boolean;
  textareaRef: React.Ref<HTMLTextAreaElement>;
  toggleExpand: () => void;
  isFocused?: boolean;
  setIsFocused?: (focused: boolean) => void;
  shadowsClassName: string;
}

// Moved OUTSIDE StickyNote so it's never recreated on re-render,
// which was causing the textarea to unmount/remount on every keystroke.
function NoteContent({
  expanded = false,
  note,
  onNoteChange,
  interactive,
  textareaRef,
  toggleExpand,
  isFocused,
  setIsFocused,
  shadowsClassName,
}: NoteContentProps) {
  return (
    <>
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
        <path d="M 88,18 L 93,8 L 98,15 L 103,9 L 108,17 L 113,11 L 118,18 L 116,78 L 108,73 L 103,80 L 98,73 L 93,78 L 90,73 Z" fill="#000000" />

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
      <div className="absolute top-[26%] left-[15%] w-[70%] h-[58%] z-10 flex flex-col pointer-events-auto">
        <textarea
          ref={textareaRef}
          value={note || ""}
          onChange={(e) => onNoteChange?.(e.target.value)}
          disabled={!interactive}
          onPointerDown={(e) => e.stopPropagation()}
          onFocus={() => setIsFocused?.(true)}
          onBlur={() => setIsFocused?.(false)}
          onClick={(e) => {
            if (!expanded && interactive) {
              e.preventDefault();
              toggleExpand();
            }
          }}
          placeholder="Notes..."
          className={`w-full h-full bg-transparent resize-none outline-none text-black font-bold leading-relaxed placeholder:text-black/50 ${shadowsClassName} ${expanded ? "text-[24px] sm:text-[32px] cursor-text" : "text-[16px] sm:text-[18px] cursor-pointer"}`}
          spellCheck={false}
          style={{ cursor: !expanded && interactive ? "pointer" : undefined }}
        />
      </div>

      {/* If not expanded but interactive, cover the textarea with a clickable div */}
      {!expanded && interactive && (
        <div
          className="absolute inset-0 z-20 cursor-pointer"
          onClick={toggleExpand}
          onPointerDown={(e) => e.stopPropagation()}
        />
      )}
    </>
  );
}

interface StickyNoteProps {
  note?: string;
  onNoteChange?: (note: string) => void;
  interactive?: boolean;
  pageKey?: string;
}

export function StickyNote({
  note,
  onNoteChange,
  interactive = true,
  pageKey = "default",
}: StickyNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        const len = textareaRef.current?.value.length || 0;
        textareaRef.current?.setSelectionRange(len, len);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const toggleExpand = () => {
    if (interactive) {
      setIsExpanded((prev) => !prev);
    }
  };

  const sharedProps: NoteContentProps = {
    note,
    onNoteChange,
    interactive,
    textareaRef,
    toggleExpand,
    isFocused,
    setIsFocused,
    shadowsClassName: shadows.className,
  };

  return (
    <>
      <div
        className={`absolute top-12 right-1 sm:top-14 w-32 h-36 sm:w-40 sm:h-44 z-50 pointer-events-auto transition-transform duration-300 ${
          !isExpanded && interactive
            ? "rotate-3 hover:scale-105 active:scale-95 cursor-pointer"
            : !isExpanded
            ? "rotate-3"
            : ""
        }`}
      >
        {!isExpanded && (
          <motion.div
            layoutId={interactive ? `active-sticky-note-${pageKey}` : undefined}
            className="relative w-full h-full"
          >
            <NoteContent {...sharedProps} expanded={false} />
          </motion.div>
        )}
      </div>

      {interactive && (
        <AnimatePresence>
          {isExpanded && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md pointer-events-auto"
                onClick={toggleExpand}
                onPointerDown={(e) => e.stopPropagation()}
              />
              <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none">
                <motion.div
                  layoutId={`active-sticky-note-${pageKey}`}
                  className="relative w-72 h-80 sm:w-96 sm:h-[26rem] pointer-events-auto rotate-[-2deg]"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button
                    onClick={toggleExpand}
                    className="absolute -top-4 -right-4 w-10 h-10 bg-white border-[3px] border-black rounded-full flex items-center justify-center shadow-[3px_3px_0_black] z-50 hover:scale-110 active:scale-95 active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_black] transition-all"
                  >
                    <span className="text-black font-black text-xl leading-none">×</span>
                  </button>
                  <NoteContent {...sharedProps} expanded={true} />
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  );
}