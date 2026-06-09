"use client";

import { motion, AnimatePresence } from "motion/react";
import type { WsEvent } from "../types";

interface WsFeedProps {
  events: WsEvent[];
}

const TYPE_STYLES: Record<WsEvent["type"], string> = {
  success: "border-emerald-100 text-emerald-800 bg-emerald-50",
  warning: "border-amber-200  text-amber-800  bg-amber-50",
  info:    "border-[#DAD7CD]  text-[#2D3A2D]  bg-[#F2F4EF]/50",
};

const TIME_STYLES: Record<WsEvent["type"], string> = {
  success: "text-emerald-600",
  warning: "text-amber-600",
  info:    "text-[#588157]",
};

export default function WsFeed({ events }: WsFeedProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#DAD7CD] shadow-sm">
      <h4 className="text-xs uppercase tracking-wider font-bold text-[#2D452E] flex items-center justify-between mb-4">
        <span>WebSocket Real-time Stream</span>
        <span className="h-2 w-2 rounded-full bg-[#3A5A40] animate-ping" />
      </h4>

      <div className="space-y-2 h-[200px] overflow-y-auto pr-1 font-mono text-[10px]">
        <AnimatePresence>
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className={`p-2.5 rounded-xl border flex items-start gap-2 ${TYPE_STYLES[ev.type]}`}
            >
              <span className={`font-bold shrink-0 ${TIME_STYLES[ev.type]}`}>
                [{ev.time}]
              </span>
              <span className="flex-1 leading-relaxed">{ev.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
