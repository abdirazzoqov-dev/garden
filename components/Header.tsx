"use client";

import { Database, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  isOnline: boolean;
  setIsOnline: (v: boolean) => void;
}

export default function Header({ isOnline, setIsOnline }: HeaderProps) {
  return (
    <header className="border-b border-[#DAD7CD] bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* Logo & title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#2D452E] text-white rounded-xl shadow-md">
            <Database className="h-5 w-5 text-[#E9EDC9]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#2D452E] flex items-center gap-2 flex-wrap">
              Park Central
              <span className="text-[10px] px-2 py-0.5 bg-[#A3B18A]/20 text-[#2D452E] rounded-full font-mono border border-[#DAD7CD]">
                V3.0 Production
              </span>
            </h1>
            <p className="text-[11px] text-[#588157]">
              Dam olish maskani yagona boshqaruv va moliya raqamli ekotizimi
            </p>
          </div>
        </div>

        {/* Network mode toggle */}
        <div className="flex items-center gap-3 bg-[#F2F4EF] py-1.5 px-3 rounded-full border border-[#DAD7CD]">
          <span className="text-[11px] font-semibold text-[#588157] hidden sm:block">
            Kassa Rejimi:
          </span>

          <button
            onClick={() => setIsOnline(true)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
              isOnline
                ? "bg-[#2D452E] text-white shadow"
                : "text-[#588157] hover:text-[#2D452E]"
            }`}
          >
            <Wifi className="h-3 w-3" />
            Online
          </button>

          <button
            onClick={() => setIsOnline(false)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
              !isOnline
                ? "bg-amber-100 text-amber-800 border border-amber-200 shadow"
                : "text-[#588157] hover:text-[#2D452E]"
            }`}
          >
            <WifiOff className="h-3 w-3" />
            Offline
          </button>
        </div>
      </div>
    </header>
  );
}
