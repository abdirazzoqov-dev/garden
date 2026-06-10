"use client";

import {
  Store, ShoppingCart, BarChart3, Users, ClipboardList,
  ChefHat, Tag, FileText, UserCircle, Settings, Code2,
} from "lucide-react";
import type { ActiveTab } from "./types";

interface NavigationTabsProps {
  activeTab:           ActiveTab;
  onTabChange:         (tab: ActiveTab) => void;
  allowedTabs:         ActiveTab[];          // from auth context
  pendingOrdersCount?: number;
  kitchenCount?:       number;
}

const ALL_TABS: {
  id:      ActiveTab;
  label:   string;
  short:   string;
  icon:    React.ReactNode;
  group:   "ops" | "mgmt";
  accent?: boolean;
}[] = [
  // Operations
  { id: "stalls",     label: "Rastalar",    short: "Rastalar",  icon: <Store         className="w-4 h-4" />, group: "ops"  },
  { id: "pos",        label: "POS Kassa",   short: "POS",       icon: <ShoppingCart  className="w-4 h-4" />, group: "ops"  },
  { id: "orders",     label: "Buyurtmalar", short: "Buyurtma",  icon: <ClipboardList className="w-4 h-4" />, group: "ops"  },
  { id: "kds",        label: "Oshpazxona",  short: "KDS",       icon: <ChefHat       className="w-4 h-4" />, group: "ops"  },
  // Management
  { id: "dashboard",  label: "Dashboard",   short: "Dash",      icon: <BarChart3     className="w-4 h-4" />, group: "mgmt" },
  { id: "reports",    label: "Hisobot",     short: "Hisobot",   icon: <FileText      className="w-4 h-4" />, group: "mgmt" },
  { id: "hr",         label: "HR",          short: "HR",        icon: <Users         className="w-4 h-4" />, group: "mgmt" },
  { id: "customers",  label: "Mijozlar",    short: "Mijoz",     icon: <UserCircle    className="w-4 h-4" />, group: "mgmt" },
  { id: "discounts",  label: "Chegirmalar", short: "Chegirma",  icon: <Tag           className="w-4 h-4" />, group: "mgmt" },
  { id: "management", label: "Boshqaruv",   short: "Boshq.",    icon: <Settings      className="w-4 h-4" />, group: "mgmt" },
  { id: "blueprint",  label: "Blueprint",   short: "Dev",       icon: <Code2         className="w-4 h-4" />, group: "mgmt", accent: true },
];

export default function NavigationTabs({
  activeTab, onTabChange, allowedTabs,
  pendingOrdersCount, kitchenCount,
}: NavigationTabsProps) {

  // Filter to only what this user can see
  const visible = ALL_TABS.filter((t) => allowedTabs.includes(t.id));
  const opsTabs  = visible.filter((t) => t.group === "ops");
  const mgmtTabs = visible.filter((t) => t.group === "mgmt");

  const renderTab = (tab: (typeof ALL_TABS)[number]) => {
    const isActive = activeTab === tab.id;
    const badge =
      tab.id === "orders" && pendingOrdersCount && pendingOrdersCount > 0 ? pendingOrdersCount :
      tab.id === "kds"    && kitchenCount       && kitchenCount       > 0 ? kitchenCount       : null;

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
          <span className={`w-5 h-5 rounded-full text-[10px] font-[800]
            flex items-center justify-center shrink-0
            ${tab.id === "kds"
              ? "bg-amber-500 text-white"
              : isActive
                ? "bg-white/20 text-white"
                : "bg-red-500 text-white"
            }`}>
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>
    );
  };

  // If only 1 group has items, show as single strip
  const hasBothGroups = opsTabs.length > 0 && mgmtTabs.length > 0;

  return (
    <div className="mb-8 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {hasBothGroups ? (
          <>
            {/* Operations cluster */}
            {opsTabs.length > 0 && (
              <div className="flex items-center gap-1 p-1 bg-[#f0ede8] rounded-2xl border border-[#dedad3]">
                {opsTabs.map(renderTab)}
              </div>
            )}
            <div className="hidden sm:block w-px h-8 bg-[#dedad3]" />
            {/* Management cluster */}
            {mgmtTabs.length > 0 && (
              <div className="flex items-center gap-1 p-1 bg-[#f0ede8] rounded-2xl border border-[#dedad3]">
                {mgmtTabs.map(renderTab)}
              </div>
            )}
          </>
        ) : (
          /* Single strip */
          <div className="flex items-center gap-1 p-1 bg-[#f0ede8] rounded-2xl border border-[#dedad3]">
            {visible.map(renderTab)}
          </div>
        )}
      </div>
      <div className="border-b border-[#dedad3]" />
    </div>
  );
}
