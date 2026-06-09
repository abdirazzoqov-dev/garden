"use client";

// ============================================================
// PARK CENTRAL — Barcode Scanner Panel (POS)
// Used inside POS tab to scan → add to cart
// ============================================================

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ScanBarcode, Keyboard, Camera, CameraOff,
  CheckCircle2, AlertCircle, X, Search,
} from "lucide-react";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";
import type { Product } from "../types";

interface BarcodeScannerProps {
  products:    Product[];
  onAddToCart: (product: Product) => void;
  onClose:     () => void;
}

type TabMode = "manual" | "camera";

export default function BarcodeScanner({
  products, onAddToCart, onClose,
}: BarcodeScannerProps) {
  const [mode,         setMode]         = useState<TabMode>("manual");
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [notFound,     setNotFound]     = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Handle a scanned/entered code ──────────────────────────
  const handleScan = (code: string) => {
    setNotFound(false);
    setMatchedProduct(null);

    // Search by barcode field OR by product ID
    const found = products.find(
      (p) => p.barcode === code || p.id === code
    );

    if (found) {
      setMatchedProduct(found);
    } else {
      setNotFound(true);
      setTimeout(() => setNotFound(false), 2500);
    }
  };

  const scanner = useBarcodeScanner({
    onScan: handleScan,
    minLength: 4,
    listenGlobal: false,
  });

  const handleAddFound = () => {
    if (!matchedProduct) return;
    onAddToCart(matchedProduct);
    setMatchedProduct(null);
    scanner.setManualCode("");
    // Keep panel open for more scans
  };

  const handleCameraToggle = () => {
    if (scanner.camActive) {
      scanner.stopCamera();
    } else if (videoRef.current) {
      scanner.startCamera(videoRef.current);
    }
  };

  const statusIcon = {
    idle:     <ScanBarcode className="w-5 h-5 text-[#4d8751]" />,
    scanning: <Camera      className="w-5 h-5 text-blue-500 animate-pulse" />,
    success:  <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error:    <AlertCircle  className="w-5 h-5 text-red-500" />,
  }[scanner.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="card overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0ede8] bg-[#f7f5f2]">
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className="text-sm font-[700] text-[#1e3d1f]">Barcode / QR Skaner</span>
          {scanner.lastCode && (
            <span className="font-mono text-[11px] text-[#4d8751] bg-[#eef7ef] px-2 py-0.5 rounded-full">
              {scanner.lastCode}
            </span>
          )}
        </div>
        <button onClick={onClose} className="btn-icon btn-icon-sm">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Mode tabs ── */}
        <div className="flex gap-1 p-1 bg-[#f0ede8] rounded-xl border border-[#dedad3]">
          {([
            { id: "manual" as const, label: "Qo'lda kiritish", icon: <Keyboard className="w-3.5 h-3.5" /> },
            { id: "camera" as const, label: "Kamera",          icon: <Camera   className="w-3.5 h-3.5" /> },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setMode(tab.id); if (tab.id !== "camera") scanner.stopCamera(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                text-xs font-[700] transition-all
                ${mode === tab.id
                  ? "bg-white text-[#1e3d1f] shadow-sm border border-[#dedad3]"
                  : "text-[#637063] hover:text-[#1e3d1f]"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Manual entry mode ── */}
        {mode === "manual" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9daa9e]" />
                <input
                  autoFocus
                  className="input pl-9 font-mono"
                  placeholder="Barcode raqamini kiriting..."
                  value={scanner.manualCode}
                  onChange={(e) => scanner.setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && scanner.submitManual()}
                />
              </div>
              <button
                onClick={scanner.submitManual}
                disabled={!scanner.manualCode.trim()}
                className="btn btn-primary btn-sm disabled:opacity-50"
              >
                <ScanBarcode className="w-4 h-4" />
                Qidirish
              </button>
            </div>

            <p className="text-[11px] text-[#637063]">
              💡 USB barcode skaner ulangan bo'lsa — barcode skanerlash bilan ham ishlaydi (Enter bilan tasdiqlanadi)
            </p>
          </div>
        )}

        {/* ── Camera mode ── */}
        {mode === "camera" && (
          <div className="space-y-3">
            {/* Video preview */}
            <div className={`relative rounded-2xl overflow-hidden bg-black border-2 transition-all
              ${scanner.camActive ? "border-[#4d8751]" : "border-[#dedad3]"}`}
              style={{ aspectRatio: "4/3" }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Overlay: scanning guide */}
              {scanner.camActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-56 h-32">
                    {/* Corner brackets */}
                    {[
                      "top-0 left-0 border-t-2 border-l-2",
                      "top-0 right-0 border-t-2 border-r-2",
                      "bottom-0 left-0 border-b-2 border-l-2",
                      "bottom-0 right-0 border-b-2 border-r-2",
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-6 h-6 border-[#4d8751] ${cls}`} />
                    ))}
                    {/* Scan line animation */}
                    <motion.div
                      animate={{ y: [0, 112, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-1 right-1 h-0.5 bg-[#4d8751] opacity-80 shadow-[0_0_6px_#4d8751]"
                    />
                  </div>
                </div>
              )}

              {/* Camera off state */}
              {!scanner.camActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60">
                  <CameraOff className="w-12 h-12" />
                  <p className="text-sm font-[600]">Kamera o'chiq</p>
                </div>
              )}
            </div>

            {/* Toggle camera */}
            <button
              onClick={handleCameraToggle}
              className={`btn btn-full btn-sm ${
                scanner.camActive
                  ? "bg-red-500 hover:bg-red-600 text-white border-0"
                  : "btn-primary"
              }`}
            >
              {scanner.camActive
                ? <><CameraOff className="w-4 h-4" /> Kamerani o'chirish</>
                : <><Camera    className="w-4 h-4" /> Kamerani yoqish</>
              }
            </button>

            {scanner.camActive && (
              <p className="text-[11px] text-[#4d8751] text-center font-[600]">
                📷 Barcode yoki QR kodni kameraga tutib turing
              </p>
            )}
          </div>
        )}

        {/* ── Error ── */}
        {scanner.error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 font-[600]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {scanner.error}
          </div>
        )}

        {/* ── Not found ── */}
        <AnimatePresence>
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 font-[700]"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              Bu barcode bo'yicha mahsulot topilmadi
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Matched product ── */}
        <AnimatePresence>
          {matchedProduct && (
            <motion.div
              initial={{ opacity: 0, scale: .97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-[800] text-[#1e3d1f] truncate">{matchedProduct.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs font-[700] text-[#4d8751] font-mono">
                      {matchedProduct.price.toLocaleString()} so'm
                    </span>
                    <span className="text-[10px] text-[#637063]">{matchedProduct.stallName}</span>
                    <span className={`text-[10px] font-[700] px-1.5 py-0.5 rounded-full
                      ${matchedProduct.stock <= 0
                        ? "bg-red-100 text-red-600"
                        : matchedProduct.stock <= matchedProduct.minStockAlert
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                      }`}>
                      {matchedProduct.stock} dona
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddFound}
                disabled={matchedProduct.stock <= 0}
                className="btn btn-primary btn-full disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Savatga qo'shish — {matchedProduct.name}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
