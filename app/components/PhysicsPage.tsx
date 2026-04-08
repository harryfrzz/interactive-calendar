"use client";

import React, { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
  PanInfo,
  MotionValue,
  useMotionValueEvent
} from "framer-motion";
import { GripVertical } from "lucide-react";
import { PageContent } from "./PageContent";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  color: string;
}

interface PhysicsPageProps {
  pageDate: Date;
  today: Date;
  startDate: Date | null;
  endDate: Date | null;
  onSelectDay?: (day: number) => void;
  onDoubleClickDay?: (date: Date) => void;
  events?: Record<string, { id: string; title: string }[]>;
  onFlipComplete?: (dir: number) => void;
  onIntentChange?: (dir: number) => void;
  isSwipeFlip?: boolean;
  direction?: number;
  parentDragY: MotionValue<number>;
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

const pageVariants = {
  enter: ({ dir, isSwipe }: { dir: number; isSwipe: boolean }) => {
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
  exit: ({ dir, isSwipe }: { dir: number; isSwipe: boolean }) => {
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

export function PhysicsPage({
  pageDate,
  today,
  startDate,
  endDate,
  onSelectDay,
  onDoubleClickDay,
  events,
  onFlipComplete,
  onIntentChange,
  isSwipeFlip = false,
  direction = 1,
  parentDragY,
  note = "",
  onNoteChange,
  onMonthChange,
  onYearChange,
  notePosition,
  onNotePositionChange,
  onNoteDragChange,
  tasks,
  onTaskClick
}: PhysicsPageProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isNoteDragging, setIsNoteDragging] = useState(false);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  useMotionValueEvent(dragY, "change", (latest) => {
    parentDragY.set(latest);
  });

  React.useEffect(() => {
    parentDragY.set(0);
  }, [parentDragY]);

  React.useEffect(() => {
    if (onNoteDragChange) {
      onNoteDragChange(isNoteDragging);
    }
  }, [isNoteDragging, onNoteDragChange]);

  const physicalX = useSpring(dragX, { stiffness: 300, damping: 25, mass: 0.5 });
  const physicalY = useSpring(dragY, { stiffness: 300, damping: 25, mass: 0.5 });

  const rotateX = useTransform(physicalY, [900, 0, -900], [-5, 0, 180]);
  const rotateY = useTransform(physicalX, [-300, 300], [-15, 15]);
  const rotateZ = useTransform(physicalX, [-300, 300], [-8, 8]);

  const shadowOpacity = useTransform(physicalY, [900, 400, 0, -400, -900], [0.8, 0.4, 0, 0.4, 0.8]);
  const lightingPos = useTransform(physicalY, [900, 0, -900], [-20, 50, 120]);
  const pageOpacity = 1;

  const handlePan = (e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (isFlipping || isNoteDragging) return;
    dragX.set(info.offset.x);
    dragY.set(info.offset.y * (1 - Math.abs(info.offset.y) / 2500));

    if (info.offset.y < -20) onIntentChange?.(1);
    else if (info.offset.y > 20) onIntentChange?.(-1);
  };

  const handlePanEnd = (e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (isFlipping || isNoteDragging) return;

    const pullDistance = info.offset.y;
    const pullVelocity = info.velocity.y;

    if (pullDistance < -150 || pullVelocity < -400) {
      setIsFlipping(true);
      animate(dragY, -900, {
        duration: 0.4,
        onComplete: () => {
          onFlipComplete?.(1);
        },
      });
    } else if (pullDistance > 150 || pullVelocity > 400) {
      setIsFlipping(true);
      animate(dragY, 900, {
        duration: 0.4,
        onComplete: () => {
          onFlipComplete?.(-1);
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
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: "10px 20px 15px 15px / 15px 20px 10px 10px" }}
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
            pageDate={pageDate} 
            today={today} 
            startDate={startDate} 
            endDate={endDate} 
            onSelectDay={onSelectDay} 
            onDoubleClickDay={onDoubleClickDay} 
            events={events}
            note={note} 
            onNoteChange={onNoteChange}
            onMonthChange={onMonthChange}
            onYearChange={onYearChange}
            notePosition={notePosition}
            onNotePositionChange={onNotePositionChange}
            onNoteDragChange={setIsNoteDragging}
            tasks={tasks}
            onTaskClick={onTaskClick}
          />

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-1.5">
            <GripVertical className="w-4 h-4 text-black/50" />
            <span className="text-[9px] font-black text-black/50 uppercase tracking-wider">Pull to flip</span>
          </div>
        </div>

        <div 
          className="isolate absolute inset-0 bg-[#EAE5D9] border-[3px] border-black overflow-visible flex flex-col pointer-events-none"
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