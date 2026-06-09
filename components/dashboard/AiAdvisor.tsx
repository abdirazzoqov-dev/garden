"use client";

import { Sparkles, RefreshCw, Cpu } from "lucide-react";

interface AiAdvisorProps {
  aiReport: string;
  isGenerating: boolean;
  onRefresh: () => void;
}

export default function AiAdvisor({ aiReport, isGenerating, onRefresh }: AiAdvisorProps) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[#1e3d1f]"
         style={{ background: "linear-gradient(135deg, #0a1a0b 0%, #162d17 50%, #0f1f10 100%)" }}>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-[.06]"
             style={{ background: "radial-gradient(circle, #91c494 0%, transparent 70%)" }} />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-[.04]"
             style={{ background: "radial-gradient(circle, #6aaa6e 0%, transparent 70%)" }} />
      </div>

      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-[#4d8751] via-[#91c494] to-transparent" />

      <div className="relative p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1e3d1f] border border-[#2d5230] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#91c494]" />
            </div>
            <div>
              <h4 className="text-sm font-[700] text-white flex items-center gap-2">
                Gemini AI Analitigi
                <span className="badge" style={{ background: "#1e3d1f", color: "#91c494", borderColor: "#2d5230", fontSize: "9px" }}>
                  gemini-2.0-flash
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Savdo, zaxira va xodimlar bo'yicha strategik tahlil
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isGenerating}
            className="btn btn-sm shrink-0"
            style={{
              background: "#1e3d1f",
              color: "#d8edda",
              border: "1px solid #2d5230",
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Tahlil qilinmoqda..." : "Yangilash"}
          </button>
        </div>

        {/* Content area */}
        <div className="min-h-[100px]">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-[#2d5230] border-t-[#91c494] animate-spin" />
                <Cpu className="w-5 h-5 text-[#91c494] absolute inset-0 m-auto" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-[600] text-slate-300">AI tahlil qilmoqda...</p>
                <p className="text-xs text-slate-500 font-mono">gemini-2.0-flash · streaming</p>
              </div>
            </div>
          ) : aiReport ? (
            <div className="prose-ai">
              {aiReport.split("\n").map((line, idx) => {
                if (!line.trim()) return <div key={idx} className="h-1.5" />;

                if (/^###?\s/.test(line)) {
                  return (
                    <h4 key={idx}>
                      {line.replace(/^###?\s*/, "")}
                    </h4>
                  );
                }
                if (/^\*\*(.+)\*\*$/.test(line)) {
                  return (
                    <p key={idx} className="font-[700] text-white">
                      {line.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                if (/^[-*•]\s/.test(line)) {
                  return (
                    <li key={idx} style={{ paddingLeft: ".25rem", listStyle: "none", display: "flex", gap: ".5rem", alignItems: "flex-start" }}>
                      <span style={{ color: "#91c494", fontSize: "14px", lineHeight: "1.6", flexShrink: 0 }}>▸</span>
                      <span>{line.replace(/^[-*•]\s/, "")}</span>
                    </li>
                  );
                }
                return <p key={idx}>{line}</p>;
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <Sparkles className="w-8 h-8 text-[#2d5230]" />
              <p className="text-sm text-slate-400 font-[500] max-w-xs">
                «Yangilash» tugmasini bosib bugungi park ma'lumotlariga asoslangan AI tahlilini oling
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
