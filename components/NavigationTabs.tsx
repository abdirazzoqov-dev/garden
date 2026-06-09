"use client";

import {
  Store, ShoppingCart, BarChart3, Users, ClipboardList,
  ChefHat, Tag, FileText, UserCircle, Settings, Code2,
} from "lucide-react";
import type { ActiveTab } from "./types";

interface NavigationTabsProps {
  activeTab:           ActiveTab;
  onTabChange:         (tab: ActiveTab) => void;
  pendingOrdersCount?: number;
  kitchenCount?:       number;
}

// ── Two logical groups ────────────────────────────────────────
// Group A — Operations (left cluster)
// Group B — Management (right cluster, accent)
const TABS: {
  id:       ActiveTab;
  label:    string;
  short:    string;
  icon:     React.ReactNode;
  group:    "ops" | "mgmt";
  accent?:  boolean;
}[] = [
  // Operations
  { id: "stalls",     label: "Rastalar",    short: "Rastalar", icon: <Store         className="w-4 h-4" />, group: "ops"  },
  { id: "pos",        label: "POS Kassa",   short: "POS",      icon: <ShoppingCart  className="w-4 h-4" />, group: "ops"  },
  { id: "orders",     label: "Buyurtmalar", short: "Buyurtma", icon: <ClipboardList className="w-4 h-4" />, group: "ops"  },
  { id: "kds",        label: "Oshpazxona",  short: "KDS",      icon: <ChefHat       className="w-4 h-4" />, group: "ops"  },
  // Analytics
  { id: "dashboard",  label: "Dashboard",   short: "Dash",     icon: <BarChart3     className="w-4 h-4" />, group: "mgmt" },
  { id: "reports",    label: "Hisobot",     short: "Hisobot",  icon: <FileText      className="w-4 h-4" />, group: "mgmt" },
  // People
  { id: "hr",         label: "HR",          short: "HR",       icon: <Users         className="w-4 h-4" />, group: "mgmt" },
  { id: "customers",  label: "Mijozlar",    short: "Mijoz",    icon: <UserCircle    className="w-4 h-4" />, group: "mgmt" },
  // Settings
  { id: "discounts",  label: "Chegirmalar", short: "Chegirma", icon: <Tag           className="w-4 h-4" />, group: "mgmt" },
  { id: "management", label: "Boshqaruv",   short: "Boshq.",   icon: <Settings      className="w-4 h-4" />, group: "mgmt" },
  { id: "blueprint",  label: "Blueprint",   short: "Dev",      icon: <Code2         className="w-4 h-4" />, group: "mgmt", accent: true },
];

export default function NavigationTabs({
  activeTab, onTabChange, pendingOrdersCount, kitchenCount,
}: NavigationTabsProps) {
  const opsTabs   = TABS.filter((t) => t.group === "ops");
  const mgmtTabs  = TABS.filter((t) => t.group === "mgmt");

  const renderTab = (tab: (typeof TABS)[number]) => {
    const isActive = activeTab === tab.id;
    const badge =
      tab.id === "orders"  && pendingOrdersCount && pendingOrdersCount > 0 ? pendingOrdersCount :
      tab.id === "kds"     && kitchenCount       && kitchenCount > 0       ? kitchenCount       : null;

    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`
          relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-[700]
          transition-all duration-150 whitespace-nowrap
          ${isActive
            ? tab.accent
              ? "bg-[#1e3d1f] text-white shadow-sm"
              : tab.id === "stalls"
                ? "bg-gradient-to-r from-[#1e3d1f] to-[#4d8751] text-white shadow-md ring-2 ring-[#91c494]/40"
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
            ${tab.id === "kds" ? "bg-amber-500 text-white" : isActive ? "bg-white/20 text-white" : "bg-red-500 text-white"}
          `}>
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="mb-8 space-y-2">
      {/* ── Tab strip ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Operations cluster */}
        <div className="flex items-center gap-1 p-1 bg-[#f0ede8] rounded-2xl border border-[#dedad3]">
          {opsTabs.map(renderTab)}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-[#dedad3]" />

        {/* Management cluster */}
        <div className="flex items-center gap-1 p-1 bg-[#f0ede8] rounded-2xl border border-[#dedad3]">
          {mgmtTabs.map(renderTab)}
        </div>
      </div>

      {/* ── Underline ── */}
      <div className="border-b border-[#dedad3]" />
    </div>
  );
}


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
