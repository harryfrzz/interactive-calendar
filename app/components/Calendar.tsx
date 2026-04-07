"use client";

import React, { useState, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
  PanInfo,
  MotionValue,
  useMotionValueEvent
} from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MoveUpRight } from "lucide-react";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function addMonths(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}
function isSameDay(first: Date | null, second: Date | null) {
  if (!first || !second) return false;
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}
function buildMonthGrid(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const slots: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (slots.length % 7 !== 0) slots.push(null);
  return slots;
}

interface PageContentProps {
  pageDate: Date;
  today: Date;
  startDate: Date | null;
  endDate: Date | null;
  onSelectDay?: (day: number) => void;
  interactive?: boolean;
}

function PageContent({ pageDate, today, startDate, endDate, onSelectDay, interactive = true }: PageContentProps) {
  const slots = buildMonthGrid(pageDate.getFullYear(), pageDate.getMonth());
  const monthName = pageDate.toLocaleDateString("en-US", { month: "long" });

  return (
    <div className="w-full h-full flex flex-col pointer-events-none">
      <div className="absolute top-3 left-0 w-full flex justify-evenly px-8 z-20 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`hole-${i}`} className="w-3.5 h-3.5 bg-zinc-800/10 rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]" />
        ))}
      </div>

      <div className="h-48 sm:h-65 w-full relative shrink-0 bg-zinc-200 flex items-center justify-center">
        <span className="text-zinc-400 font-medium text-lg uppercase tracking-widest">Placeholder</span>
        <div className="absolute inset-0 from-black/80 via-black/20" />
        <div className="absolute bottom-4 left-6 text-[#faf9f6] drop-shadow-md">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{monthName}</h2>
          <p className="text-lg font-medium opacity-90">{pageDate.getFullYear()}</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 flex flex-col pointer-events-auto bg-[#faf9f6]">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 pointer-events-none">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="py-2">{label}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2 gap-x-1 flex-1 content-start relative z-40">
          {slots.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="aspect-square pointer-events-none" />;

            const dateObj = new Date(pageDate.getFullYear(), pageDate.getMonth(), day);
            const isStart = isSameDay(dateObj, startDate);
            const isEnd = isSameDay(dateObj, endDate);
            const isCurrentDay = isSameDay(dateObj, today);
            const hasRange = Boolean(startDate && endDate);
            const isBetween = hasRange && dateObj.getTime() > (startDate?.getTime() || 0) && dateObj.getTime() < (endDate?.getTime() || 0);

            let buttonClass = "aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all relative z-10 w-12";
            const wrapClass = "relative flex items-center justify-center";
            let connectBg = null;

            if (interactive) buttonClass += " hover:bg-zinc-200 focus:outline-none cursor-pointer";

            if (isStart && startDate && endDate && startDate.getTime() !== endDate.getTime()) {
              connectBg = "absolute right-0 w-1/2 h-full bg-zinc-200/70 -z-10";
            } else if (isEnd && startDate && endDate && startDate.getTime() !== endDate.getTime()) {
              connectBg = "absolute left-0 w-1/2 h-full bg-zinc-200/70 -z-10";
            } else if (isBetween) {
              connectBg = "absolute inset-0 w-full h-full bg-zinc-200/70 -z-10";
            }

            if (isStart || isEnd) {
              buttonClass += " bg-zinc-900 text-[#faf9f6] shadow-md scale-105";
              if (interactive) buttonClass += " hover:bg-zinc-800";
            } else if (isBetween) {
              buttonClass += " text-zinc-900 bg-transparent";
            } else {
              buttonClass += " text-zinc-700";
            }

            if (isCurrentDay && !isStart && !isEnd) {
              buttonClass += " ring-2 ring-inset ring-zinc-900 font-bold";
            }

            return (
              <div key={day} className={wrapClass}>
                {connectBg && <div className={connectBg} />}
                <button
                  type="button"
                  disabled={!interactive}
                  onPointerDown={(e) => e.stopPropagation()} 
                  onClick={() => onSelectDay?.(day)}
                  className={buttonClass}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const pageVariants = {
  enter: ({ dir, isSwipe }: { dir: number, isSwipe: boolean }) => {
    if (isSwipe) {
      return {
        rotateX: 0,
        scale: 1,
        opacity: 1,
        zIndex: 20,
      };
    }
    return {
      rotateX: dir > 0 ? 0 : 360,
      scale: dir > 0 ? 0.85 : 1,
      opacity: 1,
      zIndex: dir > 0 ? 0 : -30,
    };
  },
  center: {
    rotateX: 0,
    scale: 1,
    opacity: 1,
    zIndex: 20,
    transition: { type: "spring" as const, stiffness: 200, damping: 25 },
  },
  exit: ({ dir, isSwipe }: { dir: number, isSwipe: boolean }) => {
    if (isSwipe) {
      return { 
        rotateX: dir > 0 ? 180 : 0, 
        scale: dir > 0 ? 1 : 0.85,
        zIndex: dir > 0 ? -30 : 0,
        opacity: 0,
        transition: { 
          duration: 0.4, 
          ease: "easeOut" as const,
          opacity: { delay: 0.5, duration: 0.3 }
        } 
      };
    }
    return {
      rotateX: dir > 0 ? 360 : 0,
      scale: dir > 0 ? 1 : 0.85,
      opacity: 0,
      zIndex: dir > 0 ? -30 : 0,
      transition: { 
        duration: 0.6, 
        ease: "easeInOut" as const,
        opacity: { delay: 0.7, duration: 0.3 }
      }
    };
  }
};

function PhysicsPage({
  pageDate, today, startDate, endDate, onSelectDay, onFlipComplete, onIntentChange, isSwipeFlip, direction, parentDragY
}: {
  pageDate: Date, today: Date, startDate: Date | null, endDate: Date | null,
  onSelectDay: (day: number) => void, onFlipComplete: (dir: number) => void, onIntentChange: (dir: number) => void, isSwipeFlip: boolean, direction: number,
  parentDragY: MotionValue<number>
}) {
  const [isFlipping, setIsFlipping] = useState(false);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  useMotionValueEvent(dragY, "change", (latest) => {
    parentDragY.set(latest);
  });

  // When a new page mounts, ensure background shadow resets
  React.useEffect(() => {
    parentDragY.set(0);
  }, [parentDragY]);

  // Physics Springs
  const physicalX = useSpring(dragX, { stiffness: 300, damping: 25, mass: 0.5 });
  const physicalY = useSpring(dragY, { stiffness: 300, damping: 25, mass: 0.5 });

  const rotateX = useTransform(physicalY, [900, 0, -900], [-5, 0, 180]); // Pulling down just tilts it slightly. Pulling up folds it 180.
  const rotateY = useTransform(physicalX, [-300, 300], [-15, 15]);
  const rotateZ = useTransform(physicalX, [-300, 300], [-8, 8]);

  const shadowOpacity = useTransform(physicalY, [900, 400, 0, -400, -900], [0.8, 0.4, 0, 0.4, 0.8]);
  const lightingPos = useTransform(physicalY, [900, 0, -900], [-20, 50, 120]);
  const pageOpacity = 1; // Solid page all the way to the back

  const handlePan = (e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (isFlipping) return;
    dragX.set(info.offset.x);
    dragY.set(info.offset.y * (1 - Math.abs(info.offset.y) / 2500));

    if (info.offset.y < -20) onIntentChange(1);
    else if (info.offset.y > 20) onIntentChange(-1);
  };

  const handlePanEnd = (e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (isFlipping) return;

    const pullDistance = info.offset.y;
    const pullVelocity = info.velocity.y;

    if (pullDistance < -150 || pullVelocity < -400) {
      setIsFlipping(true);
      animate(dragY, -900, {
        duration: 0.4,
        onComplete: () => {
          onFlipComplete(1);
        },
      });
    } else if (pullDistance > 150 || pullVelocity > 400) {
      setIsFlipping(true);
      animate(dragY, 900, {
        duration: 0.4,
        onComplete: () => {
          onFlipComplete(-1);
        },
      });
    } else {
      // Snap back to normal
      animate(dragX, 0, { type: "spring", stiffness: 300, damping: 20 });
      animate(dragY, 0, { type: "spring", stiffness: 300, damping: 20 });
    }
  };

  return (
    <motion.div
      custom={{ dir: direction, isSwipe: isSwipeFlip }}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{
        transformOrigin: "top center",
        transformStyle: "preserve-3d",
      }}
      className="absolute inset-0 w-full h-full z-20 pointer-events-none"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          rotateZ,
          opacity: pageOpacity,
          transformOrigin: "top center",
          transformStyle: "preserve-3d",
        }}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing group pointer-events-auto"
      >
      <div 
        className="absolute inset-0 bg-[#faf9f6] rounded-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] border border-zinc-200/50 flex flex-col overflow-hidden"
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
      >
        <motion.div 
          className="absolute inset-0 z-30 pointer-events-none mix-blend-overlay"
          style={{
            background: useTransform(
              lightingPos, 
              (pos) => `linear-gradient(${pos}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(0,0,0,0.1) 100%)`
            )
          }}
        />
        <motion.div 
          className="absolute inset-0 bg-black z-20 pointer-events-none"
          style={{ opacity: shadowOpacity }}
        />

        <PageContent 
          pageDate={pageDate} today={today} startDate={startDate} 
          endDate={endDate} onSelectDay={onSelectDay} 
        />

        <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
          <div className="absolute bottom-[-10px] right-[-10px] w-full h-full bg-gradient-to-tl from-black/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
          <MoveUpRight className="absolute bottom-3 right-3 w-5 h-5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      <div 
        className="absolute inset-0 bg-[#e8e6e1] rounded-xl border border-zinc-300 overflow-hidden shadow-inner flex items-center justify-center pointer-events-none"
        style={{ 
          backfaceVisibility: "hidden", 
          WebkitBackfaceVisibility: "hidden", 
          transform: "rotateX(180deg)" 
        }}
      >
        <div className="w-full h-full opacity-20 filter blur-sm bg-zinc-300 flex items-center justify-center scale-x-[-1]">
           <span className="text-zinc-600 font-medium text-2xl uppercase tracking-widest">Placeholder</span>
        </div>
      </div>
      </motion.div>
    </motion.div>
  );
}

export function Calendar() {
  const today = useMemo(() => normalizeDate(new Date()), []);
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [direction, setDirection] = useState(1);
  const [isSwipeFlip, setIsSwipeFlip] = useState(false);
  const [intendedDir, setIntendedDir] = useState(1); // Drives what shows underneath while dragging

  const parentDragY = useMotionValue(0);
  const bgShadowOpacity = useTransform(parentDragY, [-800, -400, 0, 400, 800], [0, 0.02, 0.05, 0.02, 0]);
  const bgScale = useTransform(parentDragY, [-900, 0, 900], [1, 0.85, 1]);

  const changeMonth = (offset: number, isSwipe = false) => {
    setDirection(offset);
    setIsSwipeFlip(isSwipe);
    setCurrentDate((prev) => addMonths(prev, offset));
  };

  const handleSelectDay = (day: number) => {
    const picked = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (!startDate || (startDate && endDate)) {
      setStartDate(picked); setEndDate(null);
    } else if (picked.getTime() < startDate.getTime()) {
      setStartDate(picked); setEndDate(startDate);
    } else {
      setEndDate(picked);
    }
  };

  const backgroundDate = addMonths(currentDate, intendedDir);

  return (
    <main className="min-h-screen bg-[#e8e6df] flex items-center justify-center p-4 md:p-12 font-sans selection:bg-zinc-900 selection:text-white overflow-hidden select-none">
      <div className="relative w-full max-w-[600px] mx-auto flex flex-col items-center">
        
        <div className="flex w-full items-center justify-end mb-8 px-2 z-50">
          <div className="flex gap-2">
            <button
              onClick={() => changeMonth(-1, false)}
              className="p-2.5 rounded-full border border-zinc-300 bg-[#faf9f6] text-zinc-600 shadow-sm hover:bg-white hover:text-zinc-900 transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => changeMonth(1, false)}
              className="p-2.5 rounded-full border border-zinc-300 bg-[#faf9f6] text-zinc-600 shadow-sm hover:bg-white hover:text-zinc-900 transition-all active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative w-full h-[620px] sm:h-[720px]" style={{ perspective: "2000px" }}>
          <div className="absolute top-0 left-0 w-full flex justify-evenly px-8 z-50 pointer-events-none transform -translate-y-[45%] drop-shadow-xl">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={`spiral-${i}`} 
                className="w-3 h-11 bg-gradient-to-b from-zinc-200 via-zinc-400 to-zinc-600 rounded-full border border-zinc-500/50 relative shadow-[0_5px_10px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute inset-x-0.5 top-0 bottom-0 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full" />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 w-full h-full bg-[#faf9f6] rounded-xl border border-zinc-300 shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-0 pointer-events-none overflow-hidden">
             <AnimatePresence mode="popLayout" initial={false}>
               <motion.div
                 key={backgroundDate.toISOString()}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.4 }}
                 style={{ scale: bgScale }}
                 className="absolute inset-0"
               >
                 <PageContent 
                    pageDate={backgroundDate} today={today} 
                    startDate={startDate} endDate={endDate} interactive={false} 
                 />
                 {/* Fake depth shadow behind the active page */}
                 <motion.div 
                   className="absolute inset-0 bg-black pointer-events-none z-10" 
                   style={{ opacity: bgShadowOpacity }}
                 />
               </motion.div>
             </AnimatePresence>
          </div>

          <div className="absolute inset-0 w-full h-full bg-[#f0eee9] rounded-xl border border-zinc-300 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] -z-10 transform scale-[0.98] translate-y-2" />
          <div className="absolute inset-0 w-full h-full bg-[#e8e6df] rounded-xl border border-zinc-300 -z-20 transform scale-[0.96] translate-y-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.32),0_30px_60px_-30px_rgba(0,0,0,0.5)]" />

          <AnimatePresence mode="popLayout" custom={{ dir: direction, isSwipe: isSwipeFlip }} initial={false}>
            <PhysicsPage
              key={currentDate.toISOString()}
              pageDate={currentDate}
              today={today}
              startDate={startDate}
              endDate={endDate}
              onSelectDay={handleSelectDay}
              onIntentChange={(dir: number) => setIntendedDir(dir)}
              onFlipComplete={(dir: number) => changeMonth(dir, true)}
              isSwipeFlip={isSwipeFlip}
              direction={direction}
              parentDragY={parentDragY}
            />
          </AnimatePresence>
          
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <>
      <Calendar />
    </>
  );
}