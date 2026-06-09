"use client";

import type { Stall } from "../types";

interface StallSelectorProps {
  stalls: Stall[];
  selectedStallId: string;
  onSelect: (id: string) => void;
}

const STALL_EMOJI: Record<string, string> = {
  CAFE:       "🍟",
  ATTRACTION: "🎢",
  STALL:      "🎪",
  SERVICE:    "🔧",
};

export default function StallSelector({ stalls, selectedStallId, onSelect }: StallSelectorProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#DAD7CD] shadow-sm">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#588157] block mb-3">
        Sotuv Nuqtasi (Rasta / Attraksion)
      </span>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stalls.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`p-3.5 rounded-xl text-xs font-semibold text-left transition-all border ${
              selectedStallId === s.id
                ? "bg-[#2D452E]/10 border-[#2D452E] text-[#2D452E] font-bold shadow-sm"
                : "bg-[#F2F4EF]/50 border-[#DAD7CD] text-[#588157] hover:border-[#588157] hover:bg-[#F2F4EF]"
            }`}
          >
            <span className="text-base block mb-1">{STALL_EMOJI[s.type] ?? "🏪"}</span>
            <span className="leading-snug">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
