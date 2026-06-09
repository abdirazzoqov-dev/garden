"use client";

import { ShoppingCart, BarChart3, Users, ClipboardList, ChefHat, Tag, Settings, Code2 } from "lucide-react";
import type { ActiveTab } from "./types";

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingOrdersCount?: number;
  kitchenCount?: number;
}

const TABS: {
  id: ActiveTab;
  label: string;
  short: string;
  icon: React.ReactNode;
  accent?: boolean;
}[] = [
  { id: "pos",        label: "POS Kassa",    short: "POS",       icon: <ShoppingCart  className="w-4 h-4" /> },
  { id: "orders",     label: "Buyurtmalar",  short: "Buyurtma",  icon: <ClipboardList className="w-4 h-4" /> },
  { id: "kds",        label: "Oshpazxona",   short: "KDS",       icon: <ChefHat       className="w-4 h-4" /> },
  { id: "dashboard",  label: "Analitika",    short: "Analitika", icon: <BarChart3     className="w-4 h-4" /> },
  { id: "hr",         label: "HR & Payroll", short: "HR",        icon: <Users         className="w-4 h-4" /> },
  { id: "discounts",  label: "Chegirmalar",  short: "Chegirma",  icon: <Tag           className="w-4 h-4" /> },
  { id: "management", label: "Boshqaruv",    short: "Boshqaruv", icon: <Settings      className="w-4 h-4" /> },
  { id: "blueprint",  label: "Blueprint",    short: "Dev",       icon: <Code2         className="w-4 h-4" />, accent: true },
];

export default function NavigationTabs({ activeTab, onTabChange, pendingOrdersCount, kitchenCount }: NavigationTabsProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f0ede8] rounded-2xl border border-[#dedad3] w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const badge =
            tab.id === "orders" && pendingOrdersCount && pendingOrdersCount > 0 ? pendingOrdersCount :
            tab.id === "kds"    && kitchenCount       && kitchenCount > 0       ? kitchenCount : null;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-[700]
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
              {badge && (
                <span className={`
                  w-5 h-5 rounded-full text-[10px] font-[800] flex items-center justify-center shrink-0
                  ${tab.id === "kds" ? "bg-amber-500 text-white" : isActive ? "bg-[#1e3d1f] text-white" : "bg-red-500 text-white"}
                `}>
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 border-b border-[#dedad3]" />
    </div>
  );
}
