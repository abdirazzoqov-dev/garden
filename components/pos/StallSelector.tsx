"use client";

import type { Stall } from "../types";

interface StallSelectorProps {
  stalls: Stall[];
  selectedStallId: string;
  onSelect: (id: string) => void;
}

const STALL_META: Record<string, { emoji: string; typeLabel: string; color: string }> = {
  CAFE:       { emoji: "🍔", typeLabel: "Taomlanish",  color: "from-orange-50 to-amber-50 border-orange-200"   },
  STALL:      { emoji: "🎪", typeLabel: "Rasta",        color: "from-purple-50 to-violet-50 border-purple-200"  },
  ATTRACTION: { emoji: "🎢", typeLabel: "Attraksion",   color: "from-blue-50 to-cyan-50 border-blue-200"        },
  SERVICE:    { emoji: "🔧", typeLabel: "Xizmat",       color: "from-slate-50 to-gray-50 border-slate-200"      },
};

export default function StallSelector({ stalls, selectedStallId, onSelect }: StallSelectorProps) {
  return (
    <div className="card p-5">
      <p className="section-label mb-3">Sotuv nuqtasini tanlang</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stalls.map((s) => {
          const meta   = STALL_META[s.type] ?? STALL_META.STALL;
          const active = selectedStallId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`
                relative flex flex-col gap-2 p-4 rounded-xl border-2 text-left
                transition-all duration-150 group
                ${active
                  ? "bg-[#1e3d1f] border-[#1e3d1f] shadow-md"
                  : `bg-gradient-to-br ${meta.color} hover:border-[#4d8751] hover:shadow-sm`
                }
              `}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#91c494]" />
              )}

              <span className="text-2xl leading-none">{meta.emoji}</span>

              <div>
                <p className={`text-[10px] font-[700] uppercase tracking-wider mb-0.5
                  ${active ? "text-[#91c494]" : "text-[#637063]"}`}>
                  {meta.typeLabel}
                </p>
                <p className={`text-xs font-[700] leading-snug
                  ${active ? "text-white" : "text-[#283028]"}`}>
                  {s.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
