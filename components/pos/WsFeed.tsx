"use client";

import { motion, AnimatePresence } from "motion/react";
import { Radio } from "lucide-react";
import type { WsEvent } from "../types";

interface WsFeedProps {
  events: WsEvent[];
}

const TYPE_STYLE: Record<WsEvent["type"], { row: string; dot: string; time: string }> = {
  success: {
    row:  "bg-emerald-50 border-emerald-100",
    dot:  "bg-emerald-500",
    time: "text-emerald-600",
  },
  warning: {
    row:  "bg-amber-50 border-amber-100",
    dot:  "bg-amber-400",
    time: "text-amber-600",
  },
  info: {
    row:  "bg-[#f7f5f2] border-[#f0ede8]",
    dot:  "bg-[#4d8751]",
    time: "text-[#637063]",
  },
};

export default function WsFeed({ events }: WsFeedProps) {
  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ede8]">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#4d8751]" />
          <span className="text-sm font-[700] text-[#1e3d1f]">Real-time oqim</span>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-[700] text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
          Jonli
        </span>
      </div>

      {/* Feed */}
      <div className="h-[220px] overflow-y-auto px-4 py-3 space-y-2">
        <AnimatePresence initial={false}>
          {events.map((ev) => {
            const s = TYPE_STYLE[ev.type];
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${s.row}`}
              >
                {/* Dot */}
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] leading-relaxed text-[#283028] font-[500]">
                    {ev.text}
                  </p>
                  <p className={`text-[10px] font-[700] font-mono mt-0.5 ${s.time}`}>
                    {ev.time}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
