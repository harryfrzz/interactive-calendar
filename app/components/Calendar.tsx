"use client";

import React, { useState, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { X, CalendarDays, Sparkles, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { DateRangeSummary } from "./DateRangeSummary"; 
import { TaskButton } from "./TaskButton";
import { PatternSelector } from "./PatternSelector"; 
import { PageContent } from "./PageContent";
import { PhysicsPage } from "./PhysicsPage";
import { normalizeDate, addMonths, getEventKey, getNoteKey } from "../utils/calendarUtils";

export function Calendar() {
  const today = useMemo(() => normalizeDate(new Date()), []);
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [direction, setDirection] = useState(1);
  const [isSwipeFlip, setIsSwipeFlip] = useState(false);
  const [intendedDir, setIntendedDir] = useState(1);

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notePositions, setNotePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [events, setEvents] = useState<Record<string, { id: string; title: string }[]>>({});
  const [eventModalDate, setEventModalDate] = useState<Date | null>(null);
  const [isNoteDragging, setIsNoteDragging] = useState(false);
  const [backgroundPattern, setBackgroundPattern] = useState("dots");
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean; date: string; color: string }[]>([]);
  const [showTasks, setShowTasks] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FCE996");

  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    const savedNotes = localStorage.getItem("calendar-notes");
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    
    const savedEvents = localStorage.getItem("calendar-events");
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    
    const savedPositions = localStorage.getItem("calendar-note-positions");
    if (savedPositions) setNotePositions(JSON.parse(savedPositions));
    
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

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("calendar-note-positions", JSON.stringify(notePositions));
    }
  }, [notePositions, isLoaded]);

  React.useEffect(() => {
    const savedTasks = localStorage.getItem("calendar-tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("calendar-tasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const handleNoteChange = (date: Date, text: string) => {
    setNotes(prev => ({ ...prev, [getNoteKey(date)]: text }));
  };

  const handleNotePositionChange = (date: Date, position: { x: number; y: number }) => {
    setNotePositions(prev => ({ ...prev, [getNoteKey(date)]: position }));
  };

  const parentDragY = useMotionValue(0);
  const bgShadowOpacity = useTransform(parentDragY, [-800, -400, 0, 400, 800], [0, 0.02, 0.05, 0.02, 0]);
  const bgScale = useTransform(parentDragY, [-900, 0, 900], [1, 0.85, 1]);

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

  const getBackgroundStyle = (pattern: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = { backgroundColor: "#FFF9E6" };
    
    switch (pattern) {
      case "dots":
        return { ...baseStyle, backgroundImage: "radial-gradient(rgba(0,0,0,0.25) 1px, transparent 1px)", backgroundSize: "24px 24px" };
      case "grid":
        return { ...baseStyle, backgroundImage: "linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px)", backgroundSize: "24px 24px" };
      case "lines":
        return { ...baseStyle, backgroundImage: "linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)", backgroundSize: "24px 24px" };
      case "crosses":
        return { ...baseStyle, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2v20M2 12h20' stroke='%23000' stroke-opacity='0.25' strokeWidth='1'/%3E%3C/svg%3E\")", backgroundSize: "24px 24px" };
      default:
        return { ...baseStyle, backgroundImage: "radial-gradient(rgba(0,0,0,0.25) 1px, transparent 1px)", backgroundSize: "24px 24px" };
    }
  };

  const backgroundDate = addMonths(currentDate, intendedDir);

  return (
    <main className="min-h-screen bg-[#FFF9E6] flex items-center justify-center p-4 md:p-12 font-sans selection:bg-[#FF9B9B] selection:text-black overflow-hidden select-none relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ ...getBackgroundStyle(backgroundPattern), backgroundColor: "#FFF9E6" }} />

      <div className="relative w-full max-w-[480px] mx-auto flex flex-col items-center pt-8 sm:pt-12">
        
        <div className="absolute top-[20px] sm:top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-0 pointer-events-none">
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

        <div className="w-full">
          <div className="relative w-full h-[580px] sm:h-[680px] overflow-visible" style={{ perspective: "2500px" }}>
              <div className="isolate absolute inset-0 w-full h-full bg-[#EAE5D9] border-[3px] border-black shadow-[0_0_0_black] z-0 pointer-events-none overflow-visible" style={{ borderRadius: "10px 20px 15px 15px / 15px 20px 10px 10px" }}>
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
                      notePosition={notePositions[getNoteKey(backgroundDate)]}
                      onMonthChange={handleMonthChange}
                      onYearChange={handleYearChange}
                      tasks={tasks.filter(t => !t.completed)}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-black pointer-events-none z-10" 
                      style={{ opacity: bgShadowOpacity }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="absolute inset-0 w-full h-full bg-black -z-10 transform translate-y-[6px] translate-x-[6px] rounded-[10px_20px_15px_15px/15px_20px_10px_10px]" />
              
              <div className="absolute inset-0 w-full h-full bg-black/35 blur-[80px] -z-30 transform translate-y-12 -translate-x-24 scale-[1.05] rounded-[10px_20px_15px_15px]" />
              <div className="absolute inset-0 w-full h-full bg-black/25 blur-[40px] -z-30 transform translate-y-8 -translate-x-12 rounded-[10px_20px_15px_15px]" />
              
              <div className="absolute inset-0 w-full h-full bg-[#EAE5D9] border-[3px] border-black -z-20 transform scale-[0.98] translate-y-3 translate-x-2" style={{ borderRadius: "10px 20px 15px 15px / 15px 20px 10px 10px" }} />

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
                  notePosition={notePositions[getNoteKey(currentDate)]}
                  onNotePositionChange={(pos) => handleNotePositionChange(currentDate, pos)}
                  onNoteDragChange={setIsNoteDragging}
                  onMonthChange={handleMonthChange}
                  onYearChange={handleYearChange}
                  tasks={tasks.filter(t => !t.completed)}
                  onTaskClick={(taskId) => {
                    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
                  }}
                />
              </AnimatePresence>
              
              <DateRangeSummary 
                startDate={startDate} 
                endDate={endDate}
                onClear={() => { setStartDate(null); setEndDate(null); }}
              />
            </div>
          </div>

        <div className="flex items-center gap-3 mt-20">
          <button
            onClick={() => setShowMonthPicker(true)}
            className="p-3 bg-white border-[3px] border-black rounded-lg shadow-[4px_4px_0_black] hover:-translate-y-1 hover:shadow-[6px_6px_0_black] active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_black] transition-all"
          >
            <CalendarDays className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setDirection(0);
              setIsSwipeFlip(false);
              setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
            }}
            className="px-4 py-3 text-xs font-black uppercase bg-white border-[3px] border-black rounded-lg shadow-[4px_4px_0_black] hover:-translate-y-1 hover:shadow-[6px_6px_0_black] active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_black] transition-all"
          >
            Today
          </button>
          <TaskButton onClick={() => setShowTasks(!showTasks)} />
          <PatternSelector currentPattern={backgroundPattern} onPatternChange={setBackgroundPattern} />
        </div>
      </div>

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
                {events[getEventKey(eventModalDate)]?.map((ev) => (
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

      <AnimatePresence>
        {showTasks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowTasks(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white text-black border-[3px] border-black rounded-[15px_5px_10px_20px] shadow-[8px_8px_0_black] p-6 relative flex flex-col max-h-[80vh]"
            >
              <button
                onClick={() => setShowTasks(false)}
                className="absolute top-4 right-4 text-black hover:scale-110 active:scale-95 transition-transform"
              >
                <X className="w-6 h-6 stroke-[3]" />
              </button>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Tasks
              </h3>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const title = formData.get("title") as string;
                  if (!title || !title.trim()) return;
                  setTasks(prev => [...prev, { id: Math.random().toString(), title: title.trim(), completed: false, date: new Date().toISOString(), color: selectedColor }]);
                  e.currentTarget.reset();
                }}
                className="flex gap-2 mb-4"
              >
                <input
                  name="title"
                  autoFocus
                  placeholder="Add task..."
                  className="flex-1 bg-[#F5F5F5] border-2 border-black rounded-md px-3 py-2 text-sm font-bold text-black outline-none focus:bg-[#FFFDF9] focus:shadow-[inset_0_0_0_2px_black]"
                />
                <button
                  type="submit"
                  className="bg-[#86efac] border-2 border-black rounded-md px-4 py-2 text-sm font-black uppercase shadow-[2px_2px_0_black] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0_black] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
                >
                  +
                </button>
              </form>

              <div className="flex gap-1 mb-4">
                {["#FCE996", "#FF9B9B", "#C084FC", "#86efac", "#60a5fa", "#fbbf24"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 border-black shadow-[1px_1px_0_black] transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-black scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                    title="Select color"
                  />
                ))}
              </div>

              <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2">
                {tasks.length === 0 && (
                  <p className="text-sm font-bold text-gray-400 italic text-center py-4">No tasks yet. Add one above!</p>
                )}
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-[#EAE5D9] border-2 border-black rounded-lg shadow-[2px_2px_0_black]">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                        className="w-5 h-5 accent-black"
                      />
                      <span className={`font-bold text-sm text-black break-words flex-1 ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</span>
                    </label>
                    <button
                      onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))}
                      className="text-red-500 hover:text-red-700 font-black text-xl leading-none ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMonthPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowMonthPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white text-black border-[3px] border-black rounded-[15px_5px_10px_20px] shadow-[8px_8px_0_black] p-6 relative flex flex-col"
            >
              <button
                onClick={() => setShowMonthPicker(false)}
                className="absolute top-4 right-4 text-black hover:scale-110 active:scale-95 transition-transform"
              >
                <X className="w-6 h-6 stroke-[3]" />
              </button>
              <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Jump to Month
              </h3>
              
              <div className="grid grid-cols-4 gap-2 mb-6">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, idx) => (
                  <button
                    key={month}
                    onClick={() => {
                      setCurrentDate(new Date(currentDate.getFullYear(), idx, 1));
                      setDirection(0);
                      setIsSwipeFlip(false);
                      setShowMonthPicker(false);
                    }}
                    className={`py-2 px-1 text-xs font-black uppercase border-2 border-black rounded shadow-[2px_2px_0_black] hover:translate-y-0.5 hover:shadow-[1px_1px_0_black] transition-all ${currentDate.getMonth() === idx ? 'bg-black text-white' : 'bg-white hover:bg-[#FCE996]'}`}
                  >
                    {month}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-black/60">Year</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))}
                    className="p-2 bg-white border-2 border-black rounded shadow-[2px_2px_0_black] hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={currentDate.getFullYear()}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      if (year >= 1900 && year <= 2100) {
                        setCurrentDate(new Date(year, currentDate.getMonth(), 1));
                      }
                    }}
                    className="flex-1 bg-white border-2 border-black rounded px-3 py-2 text-sm font-black text-center outline-none"
                  />
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1))}
                    className="p-2 bg-white border-2 border-black rounded shadow-[2px_2px_0_black] hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function Home() {
  return <Calendar />;
}