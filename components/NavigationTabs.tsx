"use client";

import { ShoppingCart, BarChart3, Users, Settings, Code2 } from "lucide-react";
import type { ActiveTab } from "./types";

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const TABS: {
  id: ActiveTab;
  label: string;
  short: string;
  icon: React.ReactNode;
  accent?: boolean;
}[] = [
  { id: "pos",        label: "POS Kassa",    short: "POS",       icon: <ShoppingCart className="w-4 h-4" /> },
  { id: "dashboard",  label: "Analitika",    short: "Analitika", icon: <BarChart3    className="w-4 h-4" /> },
  { id: "hr",         label: "HR & Payroll", short: "HR",        icon: <Users        className="w-4 h-4" /> },
  { id: "management", label: "Boshqaruv",    short: "Boshqaruv", icon: <Settings     className="w-4 h-4" /> },
  { id: "blueprint",  label: "Blueprint",    short: "Dev",       icon: <Code2        className="w-4 h-4" />, accent: true },
];

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f0ede8] rounded-2xl border border-[#dedad3] w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-[700]
                transition-all duration-150 whitespace-nowrap
                ${isActive
                  ? tab.accent
                    ? "bg-[#1e3d1f] text-white shadow-sm"
                    : "bg-white text-[#1e3d1f] shadow-sm border border-[#dedad3]"
                  : "text-[#637063] hover:text-[#1e3d1f] hover:bg-white/60"
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 border-b border-[#dedad3]" />
    </div>
  );
}
