"use client";

import { motion } from "motion/react";
import { Copy, Check } from "lucide-react";
import { PRISMA_SCHEMA_CODE, API_DOCS_CODE, SYNC_ENGINE_CODE } from "../constants";
import type { BlueprintSubTab } from "../types";

interface BlueprintTabProps {
  subTab: BlueprintSubTab;
  onSubTabChange: (t: BlueprintSubTab) => void;
  copiedText: string | null;
  onCopy: (text: string, label: string) => void;
}

const SUB_TABS: { id: BlueprintSubTab; label: string }[] = [
  { id: "prisma", label: "Prisma schema.prisma" },
  { id: "api",    label: "REST API & WebSocket Arxitekturasi" },
  { id: "sync",   label: "Offline Sync Client Logic" },
];

const CONTENT: Record<
  BlueprintSubTab,
  { title: string; desc: string; code: string; copyLabel: string; btnLabel: string }
> = {
  prisma: {
    title: "Relatsion Ma'lumotlar Bazasi Strukturasi (Production-Ready)",
    desc: "Xodimlar, sotuvlar, davomatlar, mahsulot zaxiralari va oylik hisob-kitoblar schemasi",
    code: PRISMA_SCHEMA_CODE,
    copyLabel: "prisma",
    btnLabel: "Prisma faylni nusxalash",
  },
  api: {
    title: "REST API va Socket.io WebSocket Arxitekturasi",
    desc: "Autentifikatsiya, POS, zaxira, davomat va billing oqimi spetsifikatsiyalari",
    code: API_DOCS_CODE,
    copyLabel: "api",
    btnLabel: "API Blueprint nusxalash",
  },
  sync: {
    title: "Client-side Offline Sync Queue (client-hook-pattern)",
    desc: "IndexedDB tushumi, offline navbat va internet ulanganda tranzaksiyalar sinxronizatsiyasi",
    code: SYNC_ENGINE_CODE,
    copyLabel: "sync",
    btnLabel: "Client Sync Hook nusxalash",
  },
};

export default function BlueprintTab({ subTab, onSubTabChange, copiedText, onCopy }: BlueprintTabProps) {
  const content = CONTENT[subTab];

  return (
    <motion.div
      key="blueprint"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      {/* Sub-tab nav */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#F2F4EF] pb-3">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onSubTabChange(t.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              subTab === t.id
                ? "bg-[#2D452E] text-white shadow"
                : "text-[#588157] hover:text-[#2D452E] hover:bg-[#F2F4EF]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className="bg-white p-6 rounded-2xl border border-[#DAD7CD] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">
              {content.title}
            </h4>
            <p className="text-xs text-[#588157] mt-1">{content.desc}</p>
          </div>
          <button
            onClick={() => onCopy(content.code, content.copyLabel)}
            className="bg-[#2D452E] hover:bg-[#3A5A40] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow shrink-0"
          >
            {copiedText === content.copyLabel ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" />
                Nusxa olindi!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                {content.btnLabel}
              </>
            )}
          </button>
        </div>

        <pre className="p-5 rounded-xl bg-[#F2F4EF]/70 border border-[#DAD7CD] font-mono text-[11px] leading-relaxed overflow-x-auto text-[#2D452E] font-semibold max-h-[520px] overflow-y-auto">
          {content.code}
        </pre>
      </div>
    </motion.div>
  );
}
