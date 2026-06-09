"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Clock, CalendarCheck, Plus, X, CheckCircle2 } from "lucide-react";
import type { Table, TableStatus, Stall, Employee, Order } from "../types";

interface FloorPlanProps {
  tables: Table[];
  stall: Stall;
  orders: Order[];
  employees: Employee[];
  onOpenTable: (tableId: string, guestCount: number, waiterId?: string) => void;
  onSelectOrder: (orderId: string) => void;
  onSetReservation: (tableId: string, name: string, time: string) => void;
  onCancelReservation: (tableId: string) => void;
}

type ModalType = "open" | "reserve" | null;

const STATUS_STYLE: Record<TableStatus, { bg: string; border: string; label: string; dot: string }> = {
  FREE:            { bg: "bg-white hover:bg-[#eef7ef]",       border: "border-[#dedad3] hover:border-[#4d8751]", label: "Bo'sh",          dot: "bg-[#4d8751]"   },
  OCCUPIED:        { bg: "bg-[#eef7ef]",                      border: "border-[#4d8751]",                         label: "Band",           dot: "bg-emerald-500" },
  RESERVED:        { bg: "bg-amber-50",                       border: "border-amber-300",                        label: "Rezerv",         dot: "bg-amber-500"   },
  BILL_REQUESTED:  { bg: "bg-blue-50",                        border: "border-blue-300",                         label: "Hisob kutilmoqda",dot: "bg-blue-500"    },
};

export default function FloorPlan({
  tables, stall, orders, employees,
  onOpenTable, onSelectOrder, onSetReservation, onCancelReservation,
}: FloorPlanProps) {
  const [modalType,   setModalType]   = useState<ModalType>(null);
  const [selectedTbl, setSelectedTbl] = useState<Table | null>(null);

  // Open-table form state
  const [guestCount, setGuestCount]   = useState(2);
  const [waiterId,   setWaiterId]     = useState("");

  // Reservation form state
  const [resName, setResName] = useState("");
  const [resTime, setResTime] = useState("");

  const stallTables = tables.filter((t) => t.stallId === stall.id);
  const waiters     = employees.filter((e) => e.role === "WAITER" || e.role === "SELLER");

  const openModal = (table: Table, type: ModalType) => {
    setSelectedTbl(table);
    setModalType(type);
    setGuestCount(2);
    setWaiterId(waiters[0]?.id ?? "");
    setResName(""); setResTime("");
  };

  const closeModal = () => { setModalType(null); setSelectedTbl(null); };

  const handleOpen = () => {
    if (!selectedTbl) return;
    onOpenTable(selectedTbl.id, guestCount, waiterId || undefined);
    closeModal();
  };

  const handleReserve = () => {
    if (!selectedTbl || !resName.trim() || !resTime) return;
    onSetReservation(selectedTbl.id, resName.trim(), resTime);
    closeModal();
  };

  // Stats
  const freeCount  = stallTables.filter((t) => t.status === "FREE").length;
  const bandCount  = stallTables.filter((t) => t.status === "OCCUPIED" || t.status === "BILL_REQUESTED").length;
  const resCount   = stallTables.filter((t) => t.status === "RESERVED").length;

  return (
    <div className="space-y-4">
      {/* ── Stats strip ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Bo'sh",    count: freeCount, cls: "bg-[#eef7ef] text-[#1e3d1f] border-[#b8d9ba]" },
          { label: "Band",     count: bandCount, cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
          { label: "Rezerv",   count: resCount,  cls: "bg-amber-100  text-amber-800  border-amber-200"  },
          { label: "Jami",     count: stallTables.length, cls: "bg-[#f0ede8] text-[#637063] border-[#dedad3]" },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-[700] ${s.cls}`}>
            <span className="text-base font-[800]">{s.count}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Grid ── */}
      {stallTables.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-[#9daa9e]">
          <CalendarCheck className="w-10 h-10 stroke-[1.2]" />
          <p className="text-sm font-[600]">Bu rastada stol mavjud emas</p>
          <p className="text-xs text-[#c4ccc4]">Boshqaruv bo'limida stol qo'shing</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {stallTables.map((table) => {
            const st      = STATUS_STYLE[table.status];
            const order   = orders.find((o) => o.id === table.currentOrderId);
            const elapsed = order
              ? Math.floor((Date.now() - new Date(`2026-01-01 ${order.createdAt}`).getTime()) / 60000)
              : 0;

            return (
              <motion.button
                key={table.id}
                layout
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (table.status === "OCCUPIED" || table.status === "BILL_REQUESTED") {
                    if (table.currentOrderId) onSelectOrder(table.currentOrderId);
                  } else if (table.status === "FREE") {
                    openModal(table, "open");
                  }
                }}
                className={`
                  relative flex flex-col items-center justify-between
                  p-4 rounded-2xl border-2 transition-all text-left
                  ${st.bg} ${st.border}
                  ${table.status === "RESERVED" ? "cursor-default" : "cursor-pointer"}
                `}
              >
                {/* Status dot */}
                <span className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${st.dot} ${table.status === "OCCUPIED" ? "pulse-dot" : ""}`} />

                {/* Table number */}
                <div className="w-10 h-10 rounded-full bg-white border border-[#f0ede8] shadow-sm flex items-center justify-center mb-2">
                  <span className="text-base font-[800] text-[#1e3d1f]">{table.number}</span>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-1 text-[10px] text-[#637063] font-[600]">
                  <Users className="w-3 h-3" />
                  <span>{table.capacity} kishi</span>
                </div>

                {/* Status label */}
                <span className={`mt-1.5 text-[10px] font-[700] px-2 py-0.5 rounded-full
                  ${table.status === "FREE"            ? "text-[#4d8751] bg-[#d8edda]"
                    : table.status === "OCCUPIED"      ? "text-emerald-800 bg-emerald-100"
                    : table.status === "RESERVED"      ? "text-amber-800 bg-amber-100"
                    : "text-blue-800 bg-blue-100"
                  }`}>
                  {st.label}
                </span>

                {/* Occupied details */}
                {order && (
                  <div className="mt-2 w-full space-y-0.5 text-center">
                    <p className="text-[10px] font-[600] text-[#1e3d1f] truncate">{order.waiterName ?? "—"}</p>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-[#637063]">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono font-[700]">{order.createdAt}</span>
                    </div>
                    <p className="text-[10px] font-[800] text-[#1e3d1f] font-mono">
                      {order.totalAmount > 0
                        ? `${(order.totalAmount / 1000).toFixed(0)}k so'm`
                        : `${order.items.length} ta taom`}
                    </p>
                  </div>
                )}

                {/* Reserved details */}
                {table.status === "RESERVED" && (
                  <div className="mt-2 w-full text-center space-y-0.5">
                    <p className="text-[10px] font-[700] text-amber-800 truncate">{table.reservedFor}</p>
                    <p className="text-[10px] text-amber-600 font-mono font-[700]">{table.reservedAt}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); onCancelReservation(table.id); }}
                      className="text-[9px] text-red-500 hover:text-red-700 font-[700] mt-0.5 underline"
                    >
                      Bekor qilish
                    </button>
                  </div>
                )}

                {/* Free: reserve link */}
                {table.status === "FREE" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openModal(table, "reserve"); }}
                    className="mt-2 text-[9px] text-[#4d8751] hover:text-[#1e3d1f] font-[700] flex items-center gap-0.5"
                  >
                    <CalendarCheck className="w-2.5 h-2.5" /> Rezerv
                  </button>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ── Open table modal ── */}
      <AnimatePresence>
        {modalType === "open" && selectedTbl && (
          <Modal title={`Stol #${selectedTbl.number} — Ochish`} onClose={closeModal}>
            <div className="space-y-4">
              <div className="p-3 bg-[#f7f5f2] rounded-xl border border-[#f0ede8] text-xs space-y-1 text-[#637063]">
                <p><strong className="text-[#1e3d1f]">Rasta:</strong> {stall.name}</p>
                <p><strong className="text-[#1e3d1f]">Sig'im:</strong> {selectedTbl.capacity} kishi</p>
              </div>

              <div className="space-y-1.5">
                <label className="section-label">Mehmonlar soni</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="btn-icon"><span className="text-lg font-bold">−</span></button>
                  <span className="text-xl font-[800] text-[#1e3d1f] w-8 text-center">{guestCount}</span>
                  <button onClick={() => setGuestCount(Math.min(selectedTbl.capacity, guestCount + 1))}
                    className="btn-icon"><span className="text-lg font-bold">+</span></button>
                </div>
              </div>

              {waiters.length > 0 && (
                <div className="space-y-1.5">
                  <label className="section-label">Ofitsiant</label>
                  <select className="input" value={waiterId}
                    onChange={(e) => setWaiterId(e.target.value)}>
                    <option value="">— Belgilanmagan —</option>
                    {waiters.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="btn btn-secondary flex-1">Bekor</button>
                <button onClick={handleOpen} className="btn btn-primary flex-1">
                  <CheckCircle2 className="w-4 h-4" /> Ochish
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ── Reserve modal ── */}
        {modalType === "reserve" && selectedTbl && (
          <Modal title={`Stol #${selectedTbl.number} — Rezervatsiya`} onClose={closeModal}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="section-label">Mijoz ismi</label>
                <input className="input" placeholder="masalan: Karimov oilasi"
                  value={resName} onChange={(e) => setResName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="section-label">Kelish vaqti</label>
                <input type="time" className="input" value={resTime}
                  onChange={(e) => setResTime(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="btn btn-secondary flex-1">Bekor</button>
                <button onClick={handleReserve} disabled={!resName.trim() || !resTime}
                  className="btn btn-primary flex-1">
                  <CalendarCheck className="w-4 h-4" /> Rezerv qilish
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Reusable modal wrapper ─────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,26,11,.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: .93, y: 20 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: .93, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-[#1e3d1f] via-[#4d8751] to-[#91c494]" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ede8]">
          <h3 className="text-sm font-[800] text-[#1e3d1f]">{title}</h3>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}
