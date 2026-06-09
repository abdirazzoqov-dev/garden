"use client";

import { Sparkles, RefreshCw } from "lucide-react";

interface AiAdvisorProps {
  aiReport: string;
  isGenerating: boolean;
  onRefresh: () => void;
}

export default function AiAdvisor({ aiReport, isGenerating, onRefresh }: AiAdvisorProps) {
  return (
    <div className="bg-[#2D452E] rounded-2xl border border-[#3A5A40] p-6 relative overflow-hidden shadow-md">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Sparkles className="h-32 w-32 text-[#E9EDC9]" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 text-[#E9EDC9] rounded-xl border border-white/10 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Gemini AI Park Analitigi
            </h4>
            <p className="text-[11px] text-[#A3B18A]">
              Savdo, zaxira va xodimlar bo'yicha sun'iy intellekt tavsiyasi
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isGenerating}
          className="bg-[#E9EDC9] hover:bg-[#D8E2DC] text-[#2D452E] font-bold text-xs py-2.5 px-5 rounded-full flex items-center gap-2 transition-all shadow shrink-0 disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "Tahlil qilinmoqda..." : "AI Tahlilini Yangilash"}
        </button>
      </div>

      {/* Content */}
      {isGenerating ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <p className="text-xs text-[#A3B18A] font-mono text-center">
            Gemini-2.0-flash modeliga so'rov yuborilmoqda...
          </p>
        </div>
      ) : aiReport ? (
        <div className="prose-park space-y-1">
          {aiReport.split("\n").map((line, idx) => {
            if (line.startsWith("###") || line.startsWith("##")) {
              return (
                <h4 key={idx} className="text-sm font-bold text-[#E9EDC9] mt-4 mb-1.5">
                  {line.replace(/^#{2,3}\s*/, "").trim()}
                </h4>
              );
            }
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={idx} className="pl-3 border-l-2 border-[#A3B18A]/50 font-bold text-white my-1">
                  {line.replace(/\*\*/g, "").trim()}
                </p>
              );
            }
            if (/^[-*]\s/.test(line)) {
              return (
                <li key={idx} className="list-disc ml-5 my-0.5 text-[#E9EDC9] text-xs">
                  {line.replace(/^[-*]\s/, "").trim()}
                </li>
              );
            }
            if (!line.trim()) return <div key={idx} className="h-1" />;
            return (
              <p key={idx} className="text-white/85 text-xs leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-[#A3B18A]">
          <p className="text-sm font-medium">
            Tugmani bosib bugungi park ma'lumotlariga mos AI strategik tahlil oling.
          </p>
        </div>
      )}
    </div>
  );
}
