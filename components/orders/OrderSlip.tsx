"use client";

// ============================================================
// PARK CENTRAL — Order Slip (Kitchen + Waiter cheki)
// Stol raqami, buyurtma tarkibi, vaqt — chop etish uchun
// ============================================================

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Printer, ChefHat, Clipboard } from "lucide-react";
import type { Order } from "../types";
import { PRODUCT_CATEGORY_META } from "../constants";

interface OrderSlipProps {
  order:   Order;
  type:    "kitchen" | "waiter";   // ikki xil formatda chiqaradi
  onClose: () => void;
}

const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export default function OrderSlip({ order, type, onClose }: OrderSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!slipRef.current) return;
    const content = slipRef.current.innerHTML;
    const win = window.open("", "_blank", "width=320,height=600");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>${type === "kitchen" ? "Oshpaz cheki" : "Ofitsiant cheki"}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          width: 80mm;
          padding: 6px 8px;
          color: #000;
        }
        .center { text-align: center; }
        .bold   { font-weight: 700; }
        .large  { font-size: 16px; font-weight: 900; }
        .xlarge { font-size: 20px; font-weight: 900; }
        .divider { border-top: 1px dashed #000; margin: 6px 0; }
        .row    { display:flex; justify-content:space-between; margin: 2px 0; }
        .item   { margin: 4px 0; }
        .note   { font-style: italic; font-size: 10px; color: #333; }
        .tag    { background:#000; color:#fff; padding:2px 6px; border-radius:3px; font-size:10px; }
        @media print { body { margin:0; } }
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const isKitchen = type === "kitchen";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: .93, y: 20 }} animate={{ scale: 1, y: 0 }}
          exit={{ scale: .93, y: 20 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          {/* Color top bar */}
          <div className={`h-1.5 ${isKitchen ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-[#1e3d1f] to-[#4d8751]"}`} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ede8]">
            <div className="flex items-center gap-2.5">
              {isKitchen
                ? <ChefHat className="w-5 h-5 text-orange-600" />
                : <Clipboard className="w-5 h-5 text-[#4d8751]" />
              }
              <div>
                <h3 className="text-sm font-[800] text-[#1e3d1f]">
                  {isKitchen ? "Oshpaz cheki" : "Ofitsiant cheki"}
                </h3>
                <p className="text-[11px] text-[#637063]">
                  {order.stallName} · {order.tableNumber ? `Stol #${order.tableNumber}` : "Olib ketish"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>

          {/* Slip preview */}
          <div className="px-5 py-4 max-h-[65vh] overflow-y-auto">
            <div
              ref={slipRef}
              className="font-mono text-[11px] text-black space-y-1 leading-relaxed"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {/* Header */}
              <div className="center bold" style={{ fontSize: 14 }}>🌿 PARK CENTRAL</div>
              <div className="center" style={{ color: "#666", fontSize: 10 }}>
                {isKitchen ? "OSHPAZ CHEKI" : "OFITSIANT CHEKI"}
              </div>
              <div className="divider" />

              {/* Table & order info */}
              <div className="row">
                <span className="bold" style={{ fontSize: 15 }}>
                  {order.tableNumber ? `STOL #${order.tableNumber}` : "OLIB KETISH"}
                </span>
                <span style={{ fontSize: 10, color: "#666" }}>{order.createdAt}</span>
              </div>
              <div className="row" style={{ fontSize: 10, color: "#555" }}>
                <span>Rasta: {order.stallName}</span>
                <span>ID: {order.id.slice(-8)}</span>
              </div>
              {order.guestName && (
                <div style={{ fontSize: 10 }}>Mijoz: <strong>{order.guestName}</strong></div>
              )}
              {order.waiterName && !isKitchen && (
                <div style={{ fontSize: 10 }}>Ofitsiant: <strong>{order.waiterName}</strong></div>
              )}
              <div style={{ fontSize: 10 }}>
                Manba: <span style={{ fontWeight: 700 }}>
                  {(order as any).source === "GUEST_QR" ? "📱 QR menyu" : "💻 POS kassa"}
                </span>
              </div>
              <div className="divider" />

              {/* Items */}
              <div className="bold" style={{ fontSize: 11, marginBottom: 4 }}>BUYURTMA:</div>
              {order.items.map((item, i) => {
                const catMeta = PRODUCT_CATEGORY_META[item.category];
                return (
                  <div key={item.id} className="item">
                    <div className="row">
                      <span className="bold">
                        {catMeta.emoji} {item.productName}
                      </span>
                      {!isKitchen && (
                        <span>{fmt(item.price * item.quantity)} so'm</span>
                      )}
                    </div>
                    <div style={{ paddingLeft: 12, fontSize: 10, color: "#555" }}>
                      {item.quantity} {isKitchen ? "ta" : `× ${fmt(item.price)} so'm`}
                      {item.prepTime != null && item.prepTime > 0 && isKitchen && (
                        <span> · ⏱ {item.prepTime} min</span>
                      )}
                    </div>
                    {item.note && (
                      <div className="note" style={{ paddingLeft: 12, color: "#d97706" }}>
                        ⚠ {item.note}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="divider" />

              {/* Total (waiter only) */}
              {!isKitchen && (
                <div className="row bold" style={{ fontSize: 13 }}>
                  <span>JAMI:</span>
                  <span>{fmt(order.totalAmount)} so'm</span>
                </div>
              )}

              {/* Kitchen: prep note */}
              {isKitchen && (
                <div className="center" style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
                  Tayyor bo'lgach ofitsiantga bering.
                </div>
              )}

              {/* Footer */}
              <div className="center" style={{ fontSize: 9, color: "#aaa", marginTop: 8 }}>
                🌿 Park Central — {new Date().toLocaleDateString("uz-UZ")}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-5 py-4 border-t border-[#f0ede8] bg-[#f7f5f2]">
            <button onClick={onClose} className="btn btn-secondary flex-1 btn-sm">
              <X className="w-3.5 h-3.5" /> Yopish
            </button>
            <button
              onClick={handlePrint}
              className={`btn flex-1 btn-sm text-white border-0 ${
                isKitchen
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-[#1e3d1f] hover:bg-[#2d5230]"
              }`}
            >
              <Printer className="w-3.5 h-3.5" /> Chop etish
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
