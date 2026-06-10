"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, QrCode, Download, ExternalLink, Smartphone } from "lucide-react";
import type { Stall, Product, Table } from "../types";
import { PRODUCT_CATEGORY_META, STALL_TYPE_META } from "../constants";
import { formatNumber } from "../utils";

interface QRMenuModalProps {
  stall:    Stall;
  table?:   Table | null;
  products: Product[];
  onClose:  () => void;
}

// ── Simple QR code renderer using canvas ──────────────────────
// We use a data URI approach — encodes URL as QR-like visual
// (In production: use qrcode.react library)
function QRPlaceholder({ value, size = 180 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw a decorative QR-like pattern (visual demo)
    canvas.width  = size;
    canvas.height = size;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const cell = size / 21;
    // Simple pattern derived from URL chars
    const hash = [...value].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);

    ctx.fillStyle = "#1e3d1f";

    // Corner squares
    const drawSquare = (x: number, y: number, n: number) => {
      ctx.fillRect(x * cell, y * cell, n * cell, n * cell);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect((x + 1) * cell, (y + 1) * cell, (n - 2) * cell, (n - 2) * cell);
      ctx.fillStyle = "#1e3d1f";
      ctx.fillRect((x + 2) * cell, (y + 2) * cell, (n - 4) * cell, (n - 4) * cell);
    };
    drawSquare(0, 0, 7);
    drawSquare(14, 0, 7);
    drawSquare(0, 14, 7);

    // Data cells
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;
        if (((hash ^ (r * 31 + c * 17)) & 1) === 1) {
          ctx.fillStyle = "#1e3d1f";
          ctx.fillRect(c * cell + 1, r * cell + 1, cell - 2, cell - 2);
        }
      }
    }

    // Center logo area
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(8 * cell, 8 * cell, 5 * cell, 5 * cell);
    ctx.font = `${cell * 3.5}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🌿", size / 2, size / 2);
  }, [value, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

// ── Guest-facing menu view ─────────────────────────────────────
function GuestMenuView({ stall, table, products }: { stall: Stall; table?: Table | null; products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const meta = STALL_TYPE_META[stall.type];

  const availableProducts = products.filter((p) => p.stallId === stall.id && p.isAvailable);
  const categories = ["ALL", ...Array.from(new Set(availableProducts.map((p) => p.category)))];

  const filtered = activeCategory === "ALL"
    ? availableProducts
    : availableProducts.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-[#f7f5f2] min-h-full rounded-2xl overflow-hidden border border-[#dedad3]">
      {/* Menu header */}
      <div className={`p-4 text-center text-white ${
        stall.type === "FASTFOOD" ? "bg-gradient-to-br from-orange-700 to-amber-600"
        : stall.type === "TEAHOUSE" ? "bg-gradient-to-br from-emerald-800 to-teal-700"
        : "bg-gradient-to-br from-[#1e3d1f] to-[#4d8751]"
      }`}>
        <div className="text-3xl mb-1">{meta.emoji}</div>
        <h3 className="text-base font-[800]">{stall.name}</h3>
        {table && <p className="text-[11px] text-white/70">Stol #{table.number}</p>}
        {stall.openTime && (
          <p className="text-[11px] text-white/70 mt-0.5">
            {stall.openTime} — {stall.closeTime}
          </p>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 px-3 py-2.5 overflow-x-auto bg-white border-b border-[#f0ede8]">
        {categories.map((cat) => {
          const catMeta = cat !== "ALL" ? PRODUCT_CATEGORY_META[cat as keyof typeof PRODUCT_CATEGORY_META] : null;
          return (
            <button key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-[700] border whitespace-nowrap transition-all
                ${activeCategory === cat
                  ? "bg-[#1e3d1f] text-white border-[#1e3d1f]"
                  : "bg-white text-[#637063] border-[#dedad3] hover:border-[#4d8751]"
                }`}>
              {catMeta && <span>{catMeta.emoji}</span>}
              <span>{catMeta ? catMeta.label : "Barchasi"}</span>
            </button>
          );
        })}
      </div>

      {/* Product list */}
      <div className="p-3 space-y-2 max-h-[340px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-[#9daa9e] text-sm py-8">Mahsulot topilmadi</p>
        ) : filtered.map((p) => {
          const catMeta = PRODUCT_CATEGORY_META[p.category];
          return (
            <div key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#f0ede8] shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#f7f5f2] border border-[#f0ede8] flex items-center justify-center text-xl shrink-0">
                {p.name.match(/^\p{Emoji}/u)?.[0] ?? catMeta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-[700] text-[#1e3d1f] truncate">
                  {p.name.replace(/^\p{Emoji}\s*/u, "")}
                </p>
                {p.description && (
                  <p className="text-[10px] text-[#9daa9e] truncate">{p.description}</p>
                )}
                {p.prepTime != null && p.prepTime > 0 && (
                  <p className="text-[10px] text-[#637063]">⏱ {p.prepTime} daqiqa</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-[800] text-[#1e3d1f] font-mono">
                  {formatNumber(p.price)}
                </p>
                <p className="text-[10px] text-[#637063]">so'm</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 text-center border-t border-[#f0ede8]">
        <p className="text-[10px] text-[#9daa9e]">🌿 Park Central — Raqamli menyu</p>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────
export default function QRMenuModal({ stall, table, products, onClose }: QRMenuModalProps) {
  const [activeView, setActiveView] = useState<"qr" | "menu">("qr");

  const menuUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/menu/${stall.id}${table ? `?table=${table.number}` : ""}`;

  const handleDownloadQR = () => {
    const canvas = document.querySelector<HTMLCanvasElement>("#qr-canvas canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `${stall.name}-QR.png`;
    a.click();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(10,26,11,.72)", backdropFilter: "blur(8px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: .93, y: 20 }} animate={{ scale: 1, y: 0 }}
          exit={{ scale: .93, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-[#1e3d1f] via-[#4d8751] to-[#91c494]" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ede8]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d8edda] flex items-center justify-center">
                <QrCode className="w-4.5 h-4.5 text-[#1e3d1f]" />
              </div>
              <div>
                <h3 className="text-sm font-[800] text-[#1e3d1f]">QR Menyu</h3>
                <p className="text-[11px] text-[#637063]">
                  {stall.name}{table ? ` · Stol #${table.number}` : ""}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 m-4 mb-0 bg-[#f0ede8] rounded-xl border border-[#dedad3]">
            <button onClick={() => setActiveView("qr")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-[700] transition-all
                ${activeView === "qr" ? "bg-white text-[#1e3d1f] shadow-sm border border-[#dedad3]" : "text-[#637063]"}`}>
              <QrCode className="w-3.5 h-3.5" /> QR kod
            </button>
            <button onClick={() => setActiveView("menu")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-[700] transition-all
                ${activeView === "menu" ? "bg-white text-[#1e3d1f] shadow-sm border border-[#dedad3]" : "text-[#637063]"}`}>
              <Smartphone className="w-3.5 h-3.5" /> Menyu ko'rinishi
            </button>
          </div>

          <div className="p-4">
            {activeView === "qr" ? (
              <div className="space-y-4">
                {/* QR code */}
                <div id="qr-canvas" className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-2xl border-2 border-[#f0ede8] shadow-sm">
                    <QRPlaceholder value={menuUrl} size={200} />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-[700] text-[#1e3d1f]">
                      {stall.name}{table ? ` — Stol #${table.number}` : ""}
                    </p>
                    <p className="text-[10px] text-[#637063] break-all font-mono">{menuUrl}</p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-3 bg-[#eef7ef] rounded-xl border border-[#b8d9ba]">
                  <p className="text-[11px] font-[700] text-[#1e3d1f] mb-1">
                    📱 Telefon orqali skanerlash
                  </p>
                  <p className="text-[10px] text-[#637063] leading-relaxed">
                    Mijoz telefonining kamera ilovasini ochib, ushbu QR kodga yo'naltirsin.
                    Menyu avtomatik ochiladi.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={handleDownloadQR}
                    className="btn btn-secondary btn-sm flex-1">
                    <Download className="w-3.5 h-3.5" /> Yuklab olish
                  </button>
                  <button
                    onClick={() => window.open(menuUrl, "_blank")}
                    className="btn btn-primary btn-sm flex-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Ochish
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] text-[#637063] text-center">
                  Mijoz telefonda ko'radigan ko'rinish:
                </p>
                <GuestMenuView stall={stall} table={table} products={products} />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
