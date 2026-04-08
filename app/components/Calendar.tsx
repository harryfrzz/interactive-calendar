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
import Image from "next/image";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, GripVertical, X } from "lucide-react";
import { StickyNote } from "./StickyNote";

import { DateRangeSummary } from "./DateRangeSummary";

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

const HERO_IMAGES: string[] = [
  "/image-1.png",
  "/image-2.png",
  "/image-3.png",
  "/image-4.png",
  "/image-5.png",
  "/image-6.png",
  "/image-7.png",
  "/image-8.png",
  "/image-9.png",
  "/image-10.png",
  "/image-11.png",
  "/image-12.png"
];

function getImageForMonth(monthIndex: number) {
  if (HERO_IMAGES.length === 0) return "";
  return HERO_IMAGES[monthIndex % HERO_IMAGES.length];
}

interface PageContentProps {
  pageDate: Date;
  today: Date;
  startDate: Date | null;
  endDate: Date | null;
  onSelectDay?: (day: number) => void;
  onDoubleClickDay?: (date: Date) => void;
  events?: Record<string, { id: string; title: string }[]>;
  interactive?: boolean;
  note?: string;
  onNoteChange?: (note: string) => void;
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
}

function getEventKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function PageContent({ pageDate, today, startDate, endDate, onSelectDay, onDoubleClickDay, events, interactive = true, note, onNoteChange, onMonthChange, onYearChange }: PageContentProps) {
  const [hoveredMonth, setHoveredMonth] = useState(false);
  const [hoveredYear, setHoveredYear] = useState(false);
  const slots = buildMonthGrid(pageDate.getFullYear(), pageDate.getMonth());
  const monthName = pageDate.toLocaleDateString("en-US", { month: "long" });
  const currentYear = pageDate.getFullYear();
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthIdx = pageDate.getMonth();
  const prevMonthIdx = (currentMonthIdx - 1 + 12) % 12;
  const nextMonthIdx = (currentMonthIdx + 1) % 12;

  return (
    <div className="w-full h-full flex flex-col pointer-events-none relative" style={{ borderRadius: "inherit" }}>
      {/* Realistic Wire-O Binding (Front) - Holes Only */}
      <div className="absolute top-0 left-0 w-full flex justify-evenly px-10 z-[60] pointer-events-none">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`hole-group-${i}`} className="relative flex justify-center items-start w-10 h-12">
            <div className="absolute top-5 w-[14px] h-[14px] bg-black rounded-full mix-blend-destination-out" />
            <div className="absolute top-5 w-[14px] h-[14px] rounded-full border-[1.5px] border-black/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_1px_1px_rgba(255,255,255,0.8)] pointer-events-none" />
          </div>
        ))}
      </div>

      <StickyNote 
        note={note} 
        onNoteChange={onNoteChange} 
        interactive={interactive} 
        pageKey={pageDate.toISOString()} 
      />

      {/* Hero section — image clipped, text overflows freely */}
      <div className="h-48 sm:h-65 w-full relative shrink-0 border-b-2 border-black pointer-events-auto overflow-visible">
        {/* Image + tint — clipped to hero bounds */}
        <div className="absolute inset-0 bg-[#FF9B9B] overflow-hidden rounded-tl-[8px] rounded-tr-[18px]">
          {getImageForMonth(pageDate.getMonth()) && (
            <Image
              src={getImageForMonth(pageDate.getMonth())}
              alt={monthName}
              fill
              className="object-cover brightness-85"
              quality={60}
              sizes="(max-width: 640px) 100vw, 100vw"
              priority
            />
          )}
          <div className="absolute inset-0 bg-[#FF9B9B]/20 mix-blend-color z-[5]" />
        </div>

        {/* Month row */}
        {/* Hover zone: starts 220px left of card so cursor can reach prev label without triggering mouseleave */}
        <div
          className="absolute bottom-10 z-30 pointer-events-auto"
          style={{ left: "-220px", right: 0, paddingLeft: "240px" }}
          onMouseEnter={() => interactive && setHoveredMonth(true)}
          onMouseLeave={() => setHoveredMonth(false)}
        >
          {/* Prev month — absolutely positioned, overflows to the left of the card */}
          <span
            className="absolute drop-shadow-[2px_2px_0_white] font-sora font-bold uppercase tracking-[-4px] text-black/40 whitespace-nowrap select-none text-3xl sm:text-3xl cursor-pointer hover:text-black/70"
            style={{
              /* sit just outside the left card edge; paddingLeft above is 220px so left:0 here = card edge */
              right: "calc(100% - 250px + 1.5rem)",
              bottom: 0,
              opacity: hoveredMonth ? 1 : 0,
              transform: hoveredMonth ? "translateX(0)" : "translateX(24px)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
              pointerEvents: hoveredMonth ? "auto" : "none",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => { if (interactive) onMonthChange?.(prevMonthIdx); }}
          >
            {months[prevMonthIdx]}
          </span>

          <div className="flex items-baseline">
            {/* Current month — left-aligned at card edge (paddingLeft offsets it back to 0) */}
            <h2 className="drop-shadow-[2px_2px_0_white] text-4xl sm:text-5xl font-sora font-bold uppercase tracking-[-4px] text-black">
              {monthName}
            </h2>

            {/* Next month — inline after current */}
            <span
              className="ml-3 drop-shadow-[2px_2px_0_white] font-sora font-bold uppercase tracking-[-4px] text-black/40 whitespace-nowrap select-none text-3xl sm:text-3xl cursor-pointer hover:text-black/70"
              style={{
                opacity: hoveredMonth ? 1 : 0,
                transform: hoveredMonth ? "translateX(0)" : "translateX(-12px)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
                pointerEvents: hoveredMonth ? "auto" : "none",
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => { if (interactive) onMonthChange?.(nextMonthIdx); }}
            >
              {months[nextMonthIdx]}
            </span>
          </div>
        </div>

        {/* Year row — same pattern */}
        <div
          className="absolute bottom-5 z-30 pointer-events-auto"
          style={{ left: "-120px", paddingLeft: "140px" }}
          onMouseEnter={() => interactive && setHoveredYear(true)}
          onMouseLeave={() => setHoveredYear(false)}
        >
          {/* Prev year — overflows left */}
          <span
            className="absolute drop-shadow-[1px_1px_0_white] font-sora font-extrabold tracking-[0.15em] text-xs uppercase text-black/40 whitespace-nowrap select-none cursor-pointer hover:text-black/70"
            style={{
              right: "calc(100% - 140px + 0.5rem)",
              bottom: 2,
              opacity: hoveredYear ? 1 : 0,
              transform: hoveredYear ? "translateX(0)" : "translateX(10px)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
              pointerEvents: hoveredYear ? "auto" : "none",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => { if (interactive) onYearChange?.(currentYear - 1); }}
          >
            {currentYear - 1}
          </span>

          <div className="flex items-center">
            {/* Current year — left-aligned */}
            <p className="drop-shadow-[1px_1px_0_white] text-sm font-sora font-extrabold tracking-[0.2em] text-black uppercase opacity-90">
              {currentYear}
            </p>

            {/* Next year — inline */}
            <span
              className="ml-2 drop-shadow-[1px_1px_0_white] font-sora font-extrabold tracking-[0.15em] text-xs uppercase text-black/40 whitespace-nowrap select-none cursor-pointer hover:text-black/70"
              style={{
                opacity: hoveredYear ? 1 : 0,
                transform: hoveredYear ? "translateX(0)" : "translateX(-8px)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
                pointerEvents: hoveredYear ? "auto" : "none",
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => { if (interactive) onYearChange?.(currentYear + 1); }}
            >
              {currentYear + 1}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 flex flex-col pointer-events-auto bg-[#FFFDF9]">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase tracking-[0.2em] text-black mb-4 pointer-events-none">
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
            
            const dayEvents = events?.[getEventKey(dateObj)] || [];
            const hasEvents = dayEvents.length > 0;

            let buttonClass = "aspect-square h-11 w-11 flex flex-col items-center justify-center text-[13px] font-bold transition-all duration-100 relative z-10 w-11";
            const wrapClass = "relative flex items-center justify-center";
            let connectBg: string | null = null;

            if (interactive) buttonClass += " hover:-translate-y-0.5 hover:shadow-[2px_2px_0_black] hover:bg-[#FFE690] hover:border-2 hover:border-black rounded-[50%_40%_60%_40%] cursor-pointer";

            if (isStart && startDate && endDate && startDate.getTime() !== endDate.getTime()) {
              connectBg = "absolute right-[-4px] w-[calc(50%+4px)] h-[56%] top-[22%] bg-black -z-10";
            } else if (isEnd && startDate && endDate && startDate.getTime() !== endDate.getTime()) {
              connectBg = "absolute left-[-4px] w-[calc(50%+4px)] h-[56%] top-[22%] bg-black -z-10";
            } else if (isBetween) {
              connectBg = "absolute left-[-4px] right-[-4px] w-[calc(100%+8px)] h-[56%] top-[22%] bg-black -z-10";
            }

            if (isStart && isEnd) {
              buttonClass += " !bg-white text-black !border-[3px] !border-black shadow-[3px_3px_0_black] !rounded-full scale-[1.1] z-20 hover:scale-[1.15] hover:!border-[3px]";
              if (interactive) buttonClass += " active:shadow-[1px_1px_0_black] active:translate-y-[2px] active:translate-x-[2px]";
            } else if (isStart) {
              buttonClass += " !bg-[#FF9B9B] text-black !border-[3px] !border-black shadow-[3px_3px_0_black] !rounded-full scale-[1.1] z-20 hover:scale-[1.15] hover:!border-[3px]";
              if (interactive) buttonClass += " active:shadow-[1px_1px_0_black] active:translate-y-[2px] active:translate-x-[2px]";
            } else if (isEnd) {
              buttonClass += " !bg-[#C084FC] text-black !border-[3px] !border-black shadow-[3px_3px_0_black] !rounded-full scale-[1.1] z-20 hover:scale-[1.15] hover:!border-[3px]";
              if (interactive) buttonClass += " active:shadow-[1px_1px_0_black] active:translate-y-[2px] active:translate-x-[2px]";
            } else if (isBetween) {
              buttonClass += " text-white font-black z-20 !bg-transparent hover:!border-[3px] hover:!border-black !shadow-none !rounded-none";
            } else {
              buttonClass += " text-black/70";
            }

            if (isCurrentDay && !isStart && !isEnd) {
              buttonClass += " bg-[#86efac] border-[3px] border-black text-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px] shadow-[2px_2px_0_black] z-20";
            }

            return (
              <div key={day} className={wrapClass}>
                {connectBg && <div className={connectBg} />}
                <button
                  type="button"
                  disabled={!interactive}
                  onPointerDown={(e) => e.stopPropagation()} 
                  onClick={() => onSelectDay?.(day)}
                  onDoubleClick={() => onDoubleClickDay?.(dateObj)}
                  className={buttonClass}
                >
                  <span className="leading-none">{day}</span>
                  {hasEvents && (
                    <div className="flex gap-1 mt-1 pointer-events-none items-center justify-center">
                      {dayEvents.slice(0, 2).map((e, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] border-[1.5px] border-black shadow-[1px_1px_0_black]" />
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="h-3 min-w-[12px] px-0.5 rounded-full bg-white border-[1.5px] border-black shadow-[1px_1px_0_black] flex items-center justify-center">
                          <span className="text-[8px] font-black leading-none text-black mt-[1px]">+{dayEvents.length - 2}</span>
                        </div>
                      )}
                    </div>
                  )}
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
  pageDate, today, startDate, endDate, onSelectDay, onDoubleClickDay, events, onFlipComplete, onIntentChange, isSwipeFlip, direction, parentDragY, note, onNoteChange, onMonthChange, onYearChange
}: {
  pageDate: Date, today: Date, startDate: Date | null, endDate: Date | null,
  onSelectDay: (day: number) => void, onDoubleClickDay: (date: Date) => void, events: Record<string, { id: string; title: string }[]>, onFlipComplete: (dir: number) => void, onIntentChange: (dir: number) => void, isSwipeFlip: boolean, direction: number,
  parentDragY: MotionValue<number>, note: string, onNoteChange: (note: string) => void, onMonthChange?: (month: number) => void, onYearChange?: (year: number) => void
}) {
  const [isFlipping, setIsFlipping] = useState(false);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  useMotionValueEvent(dragY, "change", (latest) => {
    parentDragY.set(latest);
  });

  React.useEffect(() => {
    parentDragY.set(0);
  }, [parentDragY]);

  const physicalX = useSpring(dragX, { stiffness: 300, damping: 25, mass: 0.5 });
  const physicalY = useSpring(dragY, { stiffness: 300, damping: 25, mass: 0.5 });

  const rotateX = useTransform(physicalY, [900, 0, -900], [-5, 0, 180]);
  const rotateY = useTransform(physicalX, [-300, 300], [-15, 15]);
  const rotateZ = useTransform(physicalX, [-300, 300], [-8, 8]);

  const shadowOpacity = useTransform(physicalY, [900, 400, 0, -400, -900], [0.8, 0.4, 0, 0.4, 0.8]);
  const lightingPos = useTransform(physicalY, [900, 0, -900], [-20, 50, 120]);
  const pageOpacity = 1;

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
        className="isolate absolute inset-0 bg-[#FFFDF9] rounded-[2rem_0.5rem_1.5rem_1rem] shadow-[8px_8px_0_rgba(0,0,0,0.8)] border-[3px] border-black flex flex-col overflow-visible"
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: "10px 20px 10px 15px / 15px 10px 20px 10px" }}
      >
        <motion.div 
          className="absolute inset-0 z-30 pointer-events-none mix-blend-overlay opacity-50"
          style={{
            background: useTransform(
              lightingPos, 
              (pos) => `linear-gradient(${pos}deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.1) 100%)`
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
          onDoubleClickDay={onDoubleClickDay} events={events}
          note={note} onNoteChange={onNoteChange}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
        />

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-1.5">
          <GripVertical className="w-4 h-4 text-black/50" />
          <span className="text-[9px] font-black text-black/50 uppercase tracking-wider">Pull to flip</span>
        </div>
      </div>

      <div 
        className="isolate absolute inset-0 bg-[#EAE5D9] border-[3px] border-black overflow-hidden flex flex-col pointer-events-none"
        style={{ 
          backfaceVisibility: "hidden", 
          WebkitBackfaceVisibility: "hidden", 
          transform: "rotateX(180deg)",
          borderRadius: "15px 10px 20px 10px / 10px 20px 10px 15px"
        }}
      >
        <div className="absolute inset-0 bg-black opacity-10" />
        
        <div className="absolute top-4 left-0 w-full flex justify-evenly px-10 z-[60] pointer-events-none">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={`hole-back-group-${i}`} className="relative flex justify-center">
              <div className="w-[14px] h-[14px] bg-black mix-blend-destination-out rounded-[45%_55%_40%_60%] absolute top-0" />
              <div className="w-[14px] h-[14px] border-[2px] border-black rounded-[45%_55%_40%_60%] shadow-[inset_-2px_2px_0_black,1px_1px_0_white] relative z-10 flex justify-center pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="w-full h-48 sm:h-65 bg-[#C9C2B5] border-b-[3px] border-black flex items-center justify-center opacity-90">
           <div className="w-16 h-16 rounded-[40%_60%_70%_30%] border-4 border-black/30" />
        </div>
        <div className="flex-1 flex flex-col px-8 py-6 opacity-40 gap-4">
          <div className="h-3 bg-black rounded-[5px_2px_4px_3px] w-full" />
          <div className="h-3 bg-black rounded-[3px_4px_2px_5px] w-5/6" />
          <div className="h-3 bg-black rounded-[4px_2px_5px_3px] w-4/6" />
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
  const [intendedDir, setIntendedDir] = useState(1);

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [events, setEvents] = useState<Record<string, { id: string; title: string }[]>>({});
  const [eventModalDate, setEventModalDate] = useState<Date | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    const savedNotes = localStorage.getItem("calendar-notes");
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    
    const savedEvents = localStorage.getItem("calendar-events");
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("calendar-notes", JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("calendar-events", JSON.stringify(events));
    }
  }, [events, isLoaded]);

  const getNoteKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

  const handleNoteChange = (date: Date, text: string) => {
    setNotes(prev => ({ ...prev, [getNoteKey(date)]: text }));
  };

  const parentDragY = useMotionValue(0);
  const bgShadowOpacity = useTransform(parentDragY, [-800, -400, 0, 400, 800], [0, 0.02, 0.05, 0.02, 0]);
  const bgScale = useTransform(parentDragY, [-900, 0, 900], [1, 0.85, 1]);

  const calendarDragX = useMotionValue(0);
  const calendarDragY = useMotionValue(0);
  const calendarSpringX = useSpring(calendarDragX, { stiffness: 150, damping: 12, mass: 1 });
  const calendarSpringY = useSpring(calendarDragY, { stiffness: 150, damping: 12, mass: 1 });
  const calendarRotateZ = useTransform(calendarSpringX, [-300, 300], [-10, 10]);

  const changeMonth = (offset: number, isSwipe = false) => {
    setDirection(offset);
    setIsSwipeFlip(isSwipe);
    setCurrentDate((prev) => addMonths(prev, offset));
  };

  const handleMonthChange = (month: number) => {
    setDirection(0);
    setIsSwipeFlip(false);
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
  };

  const handleYearChange = (year: number) => {
    setDirection(0);
    setIsSwipeFlip(false);
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
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
    <main className="min-h-screen bg-[#FFF9E6] flex items-center justify-center p-4 md:p-12 font-sans selection:bg-[#FF9B9B] selection:text-black overflow-hidden select-none relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,#A3A3A3_1px,transparent_1px)] opacity-10 pointer-events-none" style={{ backgroundSize: "24px 24px" }} />

      <div className="relative w-full max-w-[500px] mx-auto flex flex-col items-center">
        
        <div className="absolute top-[10px] sm:top-[20px] left-1/2 -translate-x-1/2 flex flex-col items-center z-0 pointer-events-none">
          <div className="relative w-4 h-4 bg-[#737373] rounded-full border-[2px] border-black shadow-[2px_3px_0_rgba(0,0,0,0.5)] z-20 flex items-center justify-center">
            <div className="absolute top-[2px] left-[2px] w-1.5 h-1.5 bg-white/70 rounded-full" />
            <div className="w-1 h-1 bg-black/40 rounded-full" />
          </div>
          <svg className="absolute top-2 w-[400px] h-[60px] sm:h-[50px] -z-10" viewBox="0 0 400 60">
            <path d="M 200,0 L 70,60" stroke="black" strokeWidth="2.5" />
            <path d="M 200,0 L 70,60" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M 200,0 L 330,60" stroke="black" strokeWidth="2.5" />
            <path d="M 200,0 L 330,60" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="flex w-full items-center justify-between mb-4 sm:mb-8 px-2 z-50">
          <div className="flex gap-3 ml-auto">
            <button
              onClick={() => changeMonth(-1, false)}
              className="p-3 rounded-[40%_60%_70%_30%] bg-white border-[3px] border-black text-black shadow-[4px_4px_0_black] hover:-translate-y-1 hover:shadow-[6px_6px_0_black] active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_black] transition-all"
            >
              <ChevronLeft className="w-5 h-5 stroke-[3]" />
            </button>
            <button
              onClick={() => changeMonth(1, false)}
              className="p-3 rounded-[60%_40%_30%_70%] bg-white border-[3px] border-black text-black shadow-[4px_4px_0_black] hover:-translate-y-1 hover:shadow-[6px_6px_0_black] active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_black] transition-all"
            >
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>

        <div className="relative w-full h-[580px] sm:h-[680px]" style={{ perspective: "2500px" }}>
          <div className="isolate absolute inset-0 w-full h-full bg-[#EAE5D9] border-[3px] border-black shadow-[0_0_0_black] z-0 pointer-events-none overflow-hidden" style={{ borderRadius: "10px 20px 10px 15px / 15px 10px 20px 10px" }}>
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
                     note={notes[getNoteKey(backgroundDate)] || ""}
                     onMonthChange={handleMonthChange}
                     onYearChange={handleYearChange}
                  />
                 <motion.div 
                   className="absolute inset-0 bg-black pointer-events-none z-10" 
                   style={{ opacity: bgShadowOpacity }}
                 />
               </motion.div>
             </AnimatePresence>
          </div>

          <div className="absolute inset-0 w-full h-full bg-black -z-10 transform translate-y-[6px] translate-x-[6px] rounded-[10px_20px_10px_15px/15px_10px_20px_10px]" />
          
          <div className="absolute inset-0 w-full h-full bg-black/35 blur-[80px] -z-30 transform translate-y-12 -translate-x-24 scale-[1.05] rounded-[10px_20px_10px_15px]" />
          <div className="absolute inset-0 w-full h-full bg-black/25 blur-[40px] -z-30 transform translate-y-8 -translate-x-12 rounded-[10px_20px_10px_15px]" />
          
          <div className="absolute inset-0 w-full h-full bg-[#EAE5D9] border-[3px] border-black -z-20 transform scale-[0.98] translate-y-3 translate-x-2" style={{ borderRadius: "10px 20px 10px 15px / 15px 10px 20px 10px" }} />

          <AnimatePresence mode="popLayout" custom={{ dir: direction, isSwipe: isSwipeFlip }} initial={false}>
            <PhysicsPage
              key={currentDate.toISOString()}
              pageDate={currentDate}
              today={today}
              startDate={startDate}
              endDate={endDate}
              onSelectDay={handleSelectDay}
              onDoubleClickDay={(date) => setEventModalDate(date)}
              events={events}
              onIntentChange={(dir: number) => setIntendedDir(dir)}
              onFlipComplete={(dir: number) => changeMonth(dir, true)}
              isSwipeFlip={isSwipeFlip}
              direction={direction}
              parentDragY={parentDragY}
              note={notes[getNoteKey(currentDate)] || ""}
              onNoteChange={(text) => handleNoteChange(currentDate, text)}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
            />
          </AnimatePresence>
          
        </div>

        <DateRangeSummary 
          startDate={startDate} 
          endDate={endDate}
          onClear={() => { setStartDate(null); setEndDate(null); }}
        />
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {eventModalDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setEventModalDate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white text-black border-[3px] border-black rounded-[15px_5px_10px_20px] shadow-[8px_8px_0_black] p-6 relative flex flex-col"
            >
              <button
                onClick={() => setEventModalDate(null)}
                className="absolute top-4 right-4 text-black hover:scale-110 active:scale-95 transition-transform"
              >
                <X className="w-6 h-6 stroke-[3]" />
              </button>
              <h3 className="text-xl font-black uppercase tracking-tight mb-6">
                {eventModalDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </h3>
              
              <div className="flex flex-col gap-3 mb-6 flex-1 min-h-[100px] max-h-[300px] overflow-y-auto pr-2">
                {!(events[getEventKey(eventModalDate)]?.length) && (
                  <p className="text-sm font-bold text-gray-400 italic">No events.</p>
                )}
                {events[getEventKey(eventModalDate)]?.map((ev, i) => (
                  <div key={ev.id} className="flex items-center justify-between p-3 bg-[#EAE5D9] border-2 border-black rounded-lg shadow-[2px_2px_0_black]">
                    <span className="font-bold text-sm text-black break-words flex-1 pr-2">{ev.title}</span>
                    <button
                      onClick={() => setEvents(prev => ({
                        ...prev,
                        [getEventKey(eventModalDate)]: prev[getEventKey(eventModalDate)].filter(e => e.id !== ev.id)
                      }))}
                      className="text-red-500 hover:text-red-700 font-black text-xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const title = formData.get("title") as string;
                  if (!title || !title.trim()) return;
                  const key = getEventKey(eventModalDate);
                  setEvents(prev => ({
                    ...prev,
                    [key]: [...(prev[key] || []), { id: Math.random().toString(), title: title.trim() }]
                  }));
                  e.currentTarget.reset();
                }}
                className="flex gap-2"
              >
                <input
                  name="title"
                  autoFocus
                  placeholder="New Event..."
                  className="flex-1 bg-[#F5F5F5] border-2 border-black rounded-md px-3 py-2 text-sm font-bold text-black outline-none focus:bg-[#FFFDF9] focus:shadow-[inset_0_0_0_2px_black]"
                />
                <button
  type="submit"
                  className="bg-[#FF9B9B] border-2 border-black rounded-md px-4 py-2 text-sm font-black uppercase shadow-[2px_2px_0_black] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0_black] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
                >
                  Add
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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