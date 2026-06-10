"use client";

// ============================================================
// PARK CENTRAL — Barcode Label Print
// Renders SVG barcode stripes + prints label sheet
// ============================================================

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Printer, QrCode, BarChart2, Minus, Plus } from "lucide-react";
import type { Product } from "../types";
import { formatNumber } from "../utils";

interface BarcodePrintProps {
  products: Product[];   // products that have a barcode
  onClose:  () => void;
}

// ── Minimal SVG barcode renderer (Code-128-like visual) ───────
function BarcodeSVG({ code, width = 200, height = 60 }: { code: string; width?: number; height?: number }) {
  // Create a deterministic bar pattern from the code string
  const bars: { x: number; w: number; black: boolean }[] = [];
  let x = 4;
  const barUnit = (width - 8) / (code.length * 11 + 4);

  // Start guard
  bars.push({ x, w: barUnit, black: true  }); x += barUnit;
  bars.push({ x, w: barUnit, black: false }); x += barUnit;
  bars.push({ x, w: barUnit, black: true  }); x += barUnit * 1.5;

  for (const ch of code) {
    const v = ch.charCodeAt(0) % 96;
    for (let b = 6; b >= 0; b--) {
      const isBlack = ((v >> b) & 1) === 1;
      const w = barUnit * (b % 3 === 0 ? 2 : 1);
      bars.push({ x, w, black: isBlack });
      x += w + 0.3;
    }
  }

  // Stop guard
  x += barUnit * 0.5;
  bars.push({ x, w: barUnit * 2, black: true  }); x += barUnit * 2;
  bars.push({ x, w: barUnit,     black: false }); x += barUnit;
  bars.push({ x, w: barUnit,     black: true  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={width} height={height} fill="white" />
      {bars.map((b, i) =>
        b.black ? (
          <rect key={i} x={b.x} y={2} width={Math.max(b.w, 0.8)} height={height - 14} fill="black" />
        ) : null
      )}
      <text x={width / 2} y={height - 2} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="black">
        {code}
      </text>
    </svg>
  );
}

// ── QR visual (same as QRMenuModal canvas approach, SVG version) ─
function MiniQR({ code, size = 80 }: { code: string; size?: number }) {
  const cells = 21;
  const cell  = size / cells;
  const hash  = [...code].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);

  const pixels: { r: number; c: number }[] = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;
      if (((hash ^ (r * 31 + c * 17)) & 1) === 1) pixels.push({ r, c });
    }
  }

  const squareCorner = (x: number, y: number, n: number) => (
    <>
      <rect x={x * cell} y={y * cell} width={n * cell} height={n * cell} fill="black" />
      <rect x={(x+1)*cell} y={(y+1)*cell} width={(n-2)*cell} height={(n-2)*cell} fill="white" />
      <rect x={(x+2)*cell} y={(y+2)*cell} width={(n-4)*cell} height={(n-4)*cell} fill="black" />
    </>
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" />
      {squareCorner(0, 0, 7)}
      {squareCorner(14, 0, 7)}
      {squareCorner(0, 14, 7)}
      {pixels.map(({ r, c }, i) => (
        <rect key={i} x={c * cell + 0.5} y={r * cell + 0.5}
          width={cell - 1} height={cell - 1} fill="black" />
      ))}
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize={size * 0.18}
        fontFamily="sans-serif">🌿</text>
    </svg>
  );
}

// ── Label Card ────────────────────────────────────────────────
function LabelCard({ product, type }: { product: Product; type: "barcode" | "qr" }) {
  return (
    <div className="border-2 border-dashed border-[#dedad3] rounded-xl p-3 bg-white
                    flex flex-col items-center gap-1.5 w-52">
      <p className="text-[10px] font-[800] text-[#1e3d1f] text-center leading-tight line-clamp-2">
        {product.name}
      </p>
      <p className="text-xs font-[800] text-[#4d8751] font-mono">
        {formatNumber(product.price)} so'm
      </p>

      {type === "barcode" && product.barcode ? (
        <BarcodeSVG code={product.barcode} width={180} height={52} />
      ) : (
        <MiniQR code={product.barcode ?? product.id} size={72} />
      )}

      <p className="text-[9px] text-[#637063] font-mono text-center">
        {product.stallName}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function BarcodePrint({ products, onClose }: BarcodePrintProps) {
  const [selected, setSelected]   = useState<string[]>([]);
  const [labelType, setLabelType] = useState<"barcode" | "qr">("barcode");
  const [copies,    setCopies]    = useState(1);
  const printRef = useRef<HTMLDivElement>(null);

  const productsWithCode = products.filter((p) => p.barcode);

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAll   = () => setSelected(productsWithCode.map((p) => p.id));
  const deselectAll = () => setSelected([]);

  const handlePrint = () => {
    if (!printRef.current || selected.length === 0) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=800,height=700");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8"><title>Barcode Yorliqlar</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; padding: 12px; }
        .grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .label { border: 1px dashed #ccc; border-radius: 8px; padding: 8px;
                 display: flex; flex-direction: column; align-items: center; gap: 4px;
                 width: 180px; }
        .name  { font-size: 9px; font-weight: 800; text-align: center; line-height: 1.3; }
        .price { font-size: 11px; font-weight: 800; color: #2d7a38; font-family: monospace; }
        .stall { font-size: 8px; color: #666; font-family: monospace; }
        @media print { body { margin: 0; } }
      </style>
      </head><body><div class="grid">${content}</div></body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
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
          initial={{ scale: .93, y: 20 }}
          animate={{ scale: 1,   y: 0  }}
          exit={{    scale: .93, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="h-1 bg-gradient-to-r from-[#1e3d1f] via-[#4d8751] to-[#91c494]" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ede8]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d8edda] flex items-center justify-center">
                <Printer className="w-4.5 h-4.5 text-[#1e3d1f]" />
              </div>
              <div>
                <h3 className="text-base font-[800] text-[#1e3d1f]">Barcode yorliqlar chop etish</h3>
                <p className="text-[11px] text-[#637063]">
                  {productsWithCode.length} ta barcoded mahsulot
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>

          {/* Controls */}
          <div className="px-6 py-4 border-b border-[#f0ede8] space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Label type */}
              <div className="flex gap-1 p-1 bg-[#f0ede8] rounded-xl border border-[#dedad3]">
                {([
                  { id: "barcode" as const, label: "Barcode", icon: <BarChart2 className="w-3.5 h-3.5" /> },
                  { id: "qr"      as const, label: "QR kod",  icon: <QrCode   className="w-3.5 h-3.5" /> },
                ]).map((t) => (
                  <button key={t.id} onClick={() => setLabelType(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[700] transition-all
                      ${labelType === t.id
                        ? "bg-white text-[#1e3d1f] shadow-sm border border-[#dedad3]"
                        : "text-[#637063]"
                      }`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Copies */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-[700] text-[#637063]">Nusxa soni:</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="btn-icon btn-icon-sm"><Minus className="w-3 h-3" /></button>
                  <span className="text-sm font-[800] text-[#1e3d1f] w-6 text-center">{copies}</span>
                  <button onClick={() => setCopies(Math.min(10, copies + 1))}
                    className="btn-icon btn-icon-sm"><Plus className="w-3 h-3" /></button>
                </div>
              </div>

              {/* Select all */}
              <div className="flex gap-2 ml-auto">
                <button onClick={selectAll}   className="btn btn-secondary btn-sm">Barchasi</button>
                <button onClick={deselectAll} className="btn btn-secondary btn-sm">Bekor</button>
              </div>
            </div>

            <p className="text-[11px] text-[#637063]">
              {selected.length > 0
                ? `${selected.length} ta mahsulot tanlandi`
                : "Chop etmoqchi bo'lgan mahsulotlarni tanlang"
              }
            </p>
          </div>

          {/* Product list */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {productsWithCode.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-[#9daa9e]">
                <QrCode className="w-12 h-12 stroke-[1]" />
                <p className="font-[700]">Barcoded mahsulot yo'q</p>
                <p className="text-xs text-center max-w-xs">
                  Mahsulot boshqaruvida mahsulotga barcode biriktiring
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {productsWithCode.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`relative p-3 rounded-2xl border-2 text-left transition-all
                      ${selected.includes(p.id)
                        ? "border-[#4d8751] bg-[#eef7ef]"
                        : "border-[#f0ede8] bg-white hover:border-[#9daa9e]"
                      }`}
                  >
                    {selected.includes(p.id) && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1e3d1f]
                                       flex items-center justify-center text-white text-[9px]">✓</span>
                    )}
                    <p className="text-xs font-[700] text-[#1e3d1f] line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-[#637063] font-mono mt-0.5">{p.barcode}</p>
                    <p className="text-[10px] text-[#4d8751] font-[700] mt-0.5">
                      {formatNumber(p.price)} so'm
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hidden print content */}
          <div className="hidden">
            <div ref={printRef}>
              {selected.flatMap((id) =>
                Array.from({ length: copies }, (_, ci) => {
                  const p = products.find((x) => x.id === id);
                  if (!p) return null;
                  return (
                    <div key={`${id}-${ci}`} className="label">
                      <p className="name">{p.name}</p>
                      <p className="price">{formatNumber(p.price)} so'm</p>
                      {labelType === "barcode" && p.barcode
                        ? <BarcodeSVG code={p.barcode} width={160} height={48} />
                        : <MiniQR code={p.barcode ?? p.id} size={64} />
                      }
                      <p className="stall">{p.stallName}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-[#f0ede8] bg-[#f7f5f2]">
            <button onClick={onClose} className="btn btn-secondary flex-1">
              <X className="w-4 h-4" /> Yopish
            </button>
            <button
              onClick={handlePrint}
              disabled={selected.length === 0}
              className="btn btn-primary flex-1 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              {selected.length > 0
                ? `${selected.length} ta yorliq chop etish (×${copies})`
                : "Mahsulot tanlang"
              }
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
