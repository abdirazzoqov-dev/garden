"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, Users, TrendingUp, Star, Gift, Trash2 } from "lucide-react";
import CustomerCard  from "./CustomerCard";
import CustomerModal from "./CustomerModal";
import type { Customer, CustomerFormData, LoyaltyTransaction, LoyaltyTier, ModalMode } from "../types";
import { LOYALTY_TIERS } from "../constants";
import { formatNumber, getUniqueId } from "../utils";

interface CustomersTabProps {
  customers:       Customer[];
  loyaltyHistory:  LoyaltyTransaction[];
  onAdd:           (c: Customer) => void;
  onUpdate:        (c: Customer) => void;
  onDelete:        (id: string)  => void;
  onToggleActive:  (id: string)  => void;
  onAddPoints:     (customerId: string, points: number, desc: string) => void;
  onRedeemPoints:  (customerId: string, points: number) => void;
}

export default function CustomersTab({
  customers, loyaltyHistory,
  onAdd, onUpdate, onDelete, onToggleActive,
  onAddPoints, onRedeemPoints,
}: CustomersTabProps) {
  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalMode,    setModalMode]    = useState<ModalMode>("create");
  const [editTarget,   setEditTarget]   = useState<Customer | null>(null);
  const [deleteId,     setDeleteId]     = useState<string | null>(null);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [search,       setSearch]       = useState("");
  const [filterTier,   setFilterTier]   = useState<LoyaltyTier | "ALL">("ALL");
  const [filterActive, setFilterActive] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ACTIVE");

  const openCreate = () => { setModalMode("create"); setEditTarget(null); setModalOpen(true); };
  const openEdit   = (c: Customer) => { setModalMode("edit"); setEditTarget(c); setModalOpen(true); };

  const handleSave = (data: CustomerFormData) => {
    if (modalMode === "edit" && editTarget) {
      onUpdate({ ...editTarget, ...data });
    } else {
      onAdd({
        id:          getUniqueId("cust"),
        ...data,
        tier:        "BRONZE",
        points:      0,
        totalSpent:  0,
        visitCount:  0,
        isActive:    true,
        createdAt:   new Date().toISOString().split("T")[0],
      });
    }
    setModalOpen(false);
  };

  // Filtered list
  const filtered = useMemo(() => {
    let list = customers;
    if (filterTier   !== "ALL")      list = list.filter((c) => c.tier === filterTier);
    if (filterActive === "ACTIVE")   list = list.filter((c) => c.isActive);
    if (filterActive === "INACTIVE") list = list.filter((c) => !c.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email ?? "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, filterTier, filterActive, search]);

  // Stats
  const totalPoints  = customers.reduce((s, c) => s + c.points, 0);
  const totalSpent   = customers.reduce((s, c) => s + c.totalSpent, 0);
  const activeCount  = customers.filter((c) => c.isActive).length;
  const tierCounts   = Object.fromEntries(
    (["BRONZE","SILVER","GOLD","PLATINUM"] as LoyaltyTier[]).map((t) => [t, customers.filter((c) => c.tier === t).length])
  );

  // Birthday alerts (next 7 days)
  const birthdaySoon = customers.filter((c) => {
    if (!c.birthday || !c.isActive) return false;
    const today = new Date();
    const bday  = new Date(c.birthday);
    bday.setFullYear(today.getFullYear());
    const diff  = Math.ceil((bday.getTime() - today.getTime()) / 86400000);
    return diff >= 0 && diff <= 7;
  });

  return (
    <motion.div
      key="customers"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-[800] text-[#1e3d1f] flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Mijozlar bazasi va Loyalti tizimi
          </h2>
          <p className="text-[11px] text-[#637063] mt-0.5">
            Doimiy mijozlar, ball tizimi va bonus boshqaruvi
          </p>
        </div>
        <button onClick={openCreate}
          className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-0">
          <Plus className="w-4 h-4" /> Yangi mijoz
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Faol mijozlar",   value: activeCount,                                cls: "text-blue-600",    bg: "bg-blue-50 border-blue-100"       },
          { label: "Jami tushum",     value: `${formatNumber(Math.round(totalSpent/1000))}k so'm`, cls: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Jami balllar",    value: `${formatNumber(totalPoints)} ball`,         cls: "text-violet-600",  bg: "bg-violet-50 border-violet-100"   },
          { label: "Tug'ilgan kun 🎂", value: `${birthdaySoon.length} ta (7 kun)`,        cls: "text-amber-600",   bg: "bg-amber-50 border-amber-100"     },
        ].map((s) => (
          <div key={s.label} className={`p-3.5 rounded-2xl border ${s.bg}`}>
            <p className="text-[10px] font-[700] text-[#637063] uppercase tracking-wide">{s.label}</p>
            <p className={`text-lg font-[800] font-mono ${s.cls} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tier summary ── */}
      <div className="grid grid-cols-4 gap-3">
        {(["BRONZE","SILVER","GOLD","PLATINUM"] as LoyaltyTier[]).map((tier) => {
          const meta  = LOYALTY_TIERS[tier];
          const count = tierCounts[tier] ?? 0;
          return (
            <button key={tier} onClick={() => setFilterTier(filterTier === tier ? "ALL" : tier)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all
                ${filterTier === tier ? `${meta.bg} border-current` : "bg-white border-[#f0ede8] hover:border-[#dedad3]"}`}>
              <span className="text-2xl">{meta.emoji}</span>
              <p className={`text-xs font-[700] ${filterTier === tier ? meta.color : "text-[#637063]"}`}>{meta.label}</p>
              <p className={`text-lg font-[800] ${filterTier === tier ? meta.color : "text-[#1e3d1f]"}`}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* ── Birthday alert ── */}
      {birthdaySoon.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center gap-3">
          <span className="text-2xl shrink-0">🎂</span>
          <div>
            <p className="text-sm font-[800] text-amber-900">Tug'ilgan kun yaqinlashmoqda!</p>
            <p className="text-xs text-amber-700">
              {birthdaySoon.map((c) => c.name).join(", ")} — 7 kun ichida. Bonus ball yuborishni unutmang!
            </p>
          </div>
        </div>
      )}

      {/* ── Search + filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9daa9e]" />
          <input className="input pl-9" placeholder="Ism, telefon yoki email bo'yicha qidiring..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 p-1 bg-[#f0ede8] rounded-xl border border-[#dedad3] shrink-0">
          {(["ALL","ACTIVE","INACTIVE"] as const).map((s) => (
            <button key={s} onClick={() => setFilterActive(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-[700] transition-all
                ${filterActive === s ? "bg-white text-[#1e3d1f] shadow-sm border border-[#dedad3]" : "text-[#637063]"}`}>
              {s === "ALL" ? "Barchasi" : s === "ACTIVE" ? "Faol" : "Nofaol"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Customer grid ── */}
      <p className="text-[11px] text-[#637063]">
        {filtered.length} ta mijoz ko'rsatilmoqda (jami {customers.length})
      </p>

      {filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-[#9daa9e]">
          <Users className="w-10 h-10 stroke-[1.2]" />
          <p className="text-sm font-[600]">Mijoz topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((c) => (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }}>
                <CustomerCard
                  customer={c}
                  loyaltyHistory={loyaltyHistory}
                  isExpanded={expandedId === c.id}
                  onToggleExpand={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  onEdit={() => openEdit(c)}
                  onDelete={() => setDeleteId(c.id)}
                  onToggleActive={() => onToggleActive(c.id)}
                  onAddPoints={(pts, desc) => onAddPoints(c.id, pts, desc)}
                  onRedeemPoints={(pts) => onRedeemPoints(c.id, pts)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Recent loyalty history ── */}
      <div className="card p-5 space-y-4">
        <h4 className="text-sm font-[800] text-[#1e3d1f] flex items-center gap-2">
          <Gift className="w-4 h-4 text-violet-500" />
          Oxirgi ball amaliyotlari
        </h4>
        {loyaltyHistory.length === 0 ? (
          <p className="text-[#9daa9e] text-sm py-4 text-center">Hali amal yo'q</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mijoz</th>
                  <th>Amal turi</th>
                  <th>Tavsif</th>
                  <th className="text-right">Balllar</th>
                  <th className="text-right">Sana</th>
                </tr>
              </thead>
              <tbody>
                {loyaltyHistory.slice(0, 10).map((h) => (
                  <tr key={h.id}>
                    <td>
                      <p className="font-[700] text-[#1e3d1f] text-xs">{h.customerName}</p>
                    </td>
                    <td>
                      <span className={`badge text-[10px] border ${
                        h.type === "EARN"   ? "badge-green"
                        : h.type === "REDEEM" ? "bg-violet-100 text-violet-700 border-violet-200"
                        : h.type === "BONUS"  ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "badge-slate"
                      }`}>
                        {h.type === "EARN" ? "✓ Topildi" : h.type === "REDEEM" ? "↓ Almashildi" : h.type === "BONUS" ? "🎁 Bonus" : "✗ Muddati"}
                      </span>
                    </td>
                    <td>
                      <p className="text-xs text-[#637063] truncate max-w-[200px]">{h.description}</p>
                    </td>
                    <td className="text-right">
                      <span className={`font-[800] font-mono text-xs ${h.points > 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {h.points > 0 ? "+" : ""}{h.points}
                      </span>
                    </td>
                    <td className="text-right font-mono text-[11px] text-[#9daa9e]">{h.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Customer modal ── */}
      {modalOpen && (
        <CustomerModal
          mode={modalMode}
          customer={editTarget}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* ── Delete confirm ── */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(10,26,11,.72)", backdropFilter: "blur(8px)" }}
          >
            <motion.div initial={{ scale: .93, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .93, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-[800] text-[#1e3d1f]">Mijoz o'chirilsinmi?</p>
                  <p className="text-xs text-[#637063]">
                    «{customers.find((c) => c.id === deleteId)?.name}» va barcha ball tarixi yo'qoladi.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn btn-secondary flex-1">Bekor</button>
                <button onClick={() => { onDelete(deleteId); setDeleteId(null); }}
                  className="btn flex-1 bg-red-600 hover:bg-red-700 text-white border-0">
                  <Trash2 className="w-4 h-4" /> O'chirish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
