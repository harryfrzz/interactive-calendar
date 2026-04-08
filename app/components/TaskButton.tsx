"use client";

import React from "react";

interface TaskButtonProps {
  onClick: () => void;
}

export function TaskButton({ onClick }: TaskButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-3 text-xs font-black uppercase bg-[#FCE996] border-[3px] border-black rounded-lg shadow-[4px_4px_0_black] hover:-translate-y-1 hover:shadow-[6px_6px_0_black] active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_black] transition-all"
    >
      Tasks
    </button>
  );
}