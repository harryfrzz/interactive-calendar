"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { StickyNote } from "./StickyNote";
import { WEEKDAY_LABELS, MONTHS, getImageForMonth, getEventKey, isSameDay, buildMonthGrid } from "../utils/calendarUtils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  color: string;
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
  notePosition?: { x: number; y: number };
  onNotePositionChange?: (position: { x: number; y: number }) => void;
  onNoteDragChange?: (isDragging: boolean) => void;
  tasks?: Task[];
  onTaskClick?: (taskId: string) => void;
}

export function PageContent({
  pageDate,
  today,
  startDate,
  endDate,
  onSelectDay,
  onDoubleClickDay,
  events,
  interactive = true,
  note,
  onNoteChange,
  onMonthChange,
  onYearChange,
  notePosition,
  onNotePositionChange,
  onNoteDragChange,
  tasks,
  onTaskClick
}: PageContentProps) {
  const [hoveredMonth, setHoveredMonth] = useState(false);
  const [hoveredYear, setHoveredYear] = useState(false);
  const slots = buildMonthGrid(pageDate.getFullYear(), pageDate.getMonth());
  const monthName = pageDate.toLocaleDateString("en-US", { month: "long" });
  const currentYear = pageDate.getFullYear();
  
  const currentMonthIdx = pageDate.getMonth();
  const prevMonthIdx = (currentMonthIdx - 1 + 12) % 12;
  const nextMonthIdx = (currentMonthIdx + 1) % 12;

  return (
    <div className="w-full h-full flex flex-col pointer-events-none relative" style={{ borderRadius: "inherit" }}>
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
        position={notePosition}
        onPositionChange={onNotePositionChange}
        onDragChange={onNoteDragChange}
      />

      {tasks && tasks.length > 0 && (
        <div className="absolute -right-10 top-20 z-40 flex flex-col gap-2 pointer-events-auto">
          {tasks.slice(0, 5).map((task) => (
            <motion.div
              key={task.id}
              className="w-16 py-2 px-1 border-2 border-black shadow-[2px_2px_0_black] rotate-[3deg] cursor-pointer"
              style={{ backgroundColor: task.color }}
              whileHover={{ scale: 1.05, rotate: 0 }}
              onClick={() => onTaskClick?.(task.id)}
              layout
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50, rotate: 20, scale: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-[8px] font-black text-black truncate block">{task.title.slice(0, 10)}</span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="h-48 sm:h-65 w-full relative shrink-0 border-b-2 border-black pointer-events-auto overflow-visible">
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

        <div
          className="absolute bottom-10 z-30 pointer-events-auto"
          style={{ left: "-220px", right: 0, paddingLeft: "240px" }}
          onMouseEnter={() => interactive && setHoveredMonth(true)}
          onMouseLeave={() => setHoveredMonth(false)}
        >
          <span
            className="absolute drop-shadow-[2px_2px_0_white] font-sora font-bold uppercase tracking-[-4px] text-black/40 whitespace-nowrap select-none text-3xl sm:text-3xl cursor-pointer hover:text-black/70"
            style={{
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
            {MONTHS[prevMonthIdx]}
          </span>

          <div className="flex items-baseline">
            <h2 className="drop-shadow-[2px_2px_0_white] text-4xl sm:text-5xl font-sora font-bold uppercase tracking-[-4px] text-black">
              {monthName}
            </h2>
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
              {MONTHS[nextMonthIdx]}
            </span>
          </div>
        </div>

        <div
          className="absolute bottom-5 z-30 pointer-events-auto"
          style={{ left: "-120px", paddingLeft: "140px" }}
          onMouseEnter={() => interactive && setHoveredYear(true)}
          onMouseLeave={() => setHoveredYear(false)}
        >
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
            <p className="drop-shadow-[1px_1px_0_white] text-md font-sora font-extrabold tracking-[0.2em] text-black uppercase opacity-90">
              {currentYear}
            </p>
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

      <div className="flex-1 px-8 py-6 flex flex-col pointer-events-auto rounded-b-xl bg-[#FFFDF9]">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-[0.2em] text-black mb-2 pointer-events-none">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={label} className={`py-2 ${i === 0 ? 'text-red-600' : ''}`}>{label}</span>
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

            let buttonClass = "aspect-square h-11 w-11 flex flex-col items-center justify-center text-[12px] font-bold transition-all duration-100 relative z-10 w-11";
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