import { motion } from "framer-motion";
import { StickyNote } from "lucide-react";

interface DateRangeSummaryProps {
  startDate: Date | null;
  endDate: Date | null;
  onClear: () => void;
  onAddRangeNote?: () => void;
}

export function DateRangeSummary({ startDate, endDate, onClear, onAddRangeNote }: DateRangeSummaryProps) {
  if (!startDate || !endDate) return null;

  const daysBetween = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute bottom-4 left-4 z-[70]"
    >
      <div className="bg-white/90 backdrop-blur-sm border-[3px] border-black shadow-[4px_4px_0_black] rounded-[8px_15px_12px_6px] p-3 rotate-[-1deg]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF9B9B] border border-black shadow-[1px_1px_0_black]" />
            <span className="text-[10px] font-black text-black">
              {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          
          <span className="text-black text-xs">→</span>
          
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C084FC] border border-black shadow-[1px_1px_0_black]" />
            <span className="text-[10px] font-black text-black">
              {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-black/20 flex items-baseline gap-1">
          <span className="text-[18px] font-black text-black leading-none">
            {daysBetween}
          </span>
          <span className="text-[8px] font-bold uppercase text-black/60">days</span>
        </div>
      </div>

      <div className="mt-2 flex gap-1">
        <button
          onClick={onAddRangeNote}
          className="flex-1 py-1 text-[8px] font-black uppercase bg-[#C084FC] text-black border-2 border-black rounded shadow-[2px_2px_0_black] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0_black] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-1"
        >
          <StickyNote className="w-3 h-3" />
          Note
        </button>
        <button
          onClick={onClear}
          className="flex-1 py-1 text-[8px] font-black uppercase bg-black text-white border-2 border-black rounded hover:bg-red-500 transition-colors"
        >
          Clear
        </button>
      </div>
    </motion.div>
  );
}