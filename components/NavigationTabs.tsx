"use client";

import { ShoppingCart, TrendingUp, Users, FileCode2 } from "lucide-react";
import type { ActiveTab } from "./types";

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const TABS: {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  accent?: boolean;
}[] = [
  { id: "pos",       label: "POS Kassa Moduli",       icon: <ShoppingCart className="h-4 w-4" /> },
  { id: "dashboard", label: "Analitika & Dashboard",   icon: <TrendingUp   className="h-4 w-4" /> },
  { id: "hr",        label: "HR & Payroll (Oylik)",    icon: <Users        className="h-4 w-4" /> },
  { id: "blueprint", label: "Arxitekturaviy Blueprint", icon: <FileCode2    className="h-4 w-4" />, accent: true },
];

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 mb-8 border-b border-[#DAD7CD] pb-4">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2
              ${tab.accent && isActive
                ? "bg-gradient-to-r from-emerald-800 to-emerald-950 text-[#E9EDC9] shadow"
                : isActive
                ? "bg-[#2D452E] text-white shadow"
                : "text-[#588157] hover:text-[#2D452E] hover:bg-[#A3B18A]/10"
              }
              ${tab.accent ? "sm:ml-auto" : ""}
            `}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.id === "pos" ? "POS" : tab.id === "dashboard" ? "Analytics" : tab.id === "hr" ? "HR" : "Blueprint"}</span>
          </button>
        );
      })}
    </nav>
  );
}
