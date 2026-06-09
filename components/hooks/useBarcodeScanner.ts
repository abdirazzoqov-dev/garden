"use client";

// ============================================================
// PARK CENTRAL — Barcode Scanner Hook
// Supports:
//   1. Keyboard "wedge" scanner (USB scanner → input field)
//   2. Manual barcode entry
//   3. Camera scanning via BarcodeDetector API (Chrome 83+)
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

export type ScannerStatus = "idle" | "scanning" | "success" | "error";

interface UseBarcodeOptions {
  /** Called every time a valid barcode is detected */
  onScan: (code: string) => void;
  /** Minimum barcode length (default: 4) */
  minLength?: number;
  /** Enable keyboard wedge listener globally (default: false) */
  listenGlobal?: boolean;
}

// ── EAN-13 checksum validator ──────────────────────────────────
export function validateEAN13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  const digits = code.split("").map(Number);
  const sum = digits.slice(0, 12).reduce(
    (acc, d, i) => acc + (i % 2 === 0 ? d : d * 3),
    0
  );
  const check = (10 - (sum % 10)) % 10;
  return check === digits[12];
}

// ── Generate EAN-13 barcode ────────────────────────────────────
export function generateEAN13(): string {
  // Prefix 200 = internal / store use
  const digits = [2, 0, 0, ...Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))];
  const sum = digits.reduce((acc, d, i) => acc + (i % 2 === 0 ? d : d * 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return [...digits, check].join("");
}

// ── Generate simple internal SKU ──────────────────────────────
export function generateSKU(prefix = "PC"): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

// ── Main hook ─────────────────────────────────────────────────
export function useBarcodeScanner({
  onScan,
  minLength = 4,
  listenGlobal = false,
}: UseBarcodeOptions) {
  const [manualCode, setManualCode]   = useState("");
  const [status,     setStatus]       = useState<ScannerStatus>("idle");
  const [lastCode,   setLastCode]     = useState<string | null>(null);
  const [error,      setError]        = useState<string | null>(null);
  const [camActive,  setCamActive]    = useState(false);

  const bufferRef     = useRef("");
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef      = useRef<HTMLVideoElement | null>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const detectorRef   = useRef<any>(null);
  const rafRef        = useRef<number | null>(null);

  // ── Emit a scanned code ──────────────────────────────────────
  const emit = useCallback((code: string) => {
    const trimmed = code.trim();
    if (trimmed.length < minLength) return;
    setLastCode(trimmed);
    setStatus("success");
    onScan(trimmed);
    setTimeout(() => setStatus("idle"), 1500);
  }, [onScan, minLength]);

  // ── Keyboard wedge listener (USB barcode scanner acts as keyboard) ──
  useEffect(() => {
    if (!listenGlobal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Enter") {
        if (bufferRef.current.length >= minLength) {
          emit(bufferRef.current);
        }
        bufferRef.current = "";
        return;
      }

      // Only accumulate printable characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        // Auto-flush after 80ms gap (real scanners fire very fast)
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (bufferRef.current.length >= minLength) {
            emit(bufferRef.current);
          }
          bufferRef.current = "";
        }, 80);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [listenGlobal, emit, minLength]);

  // ── Manual submit ────────────────────────────────────────────
  const submitManual = useCallback(() => {
    if (!manualCode.trim()) {
      setError("Barcode bo'sh bo'lishi mumkin emas");
      return;
    }
    setError(null);
    emit(manualCode.trim());
    setManualCode("");
  }, [manualCode, emit]);

  // ── Camera scanner ───────────────────────────────────────────
  const startCamera = useCallback(async (videoEl: HTMLVideoElement) => {
    setError(null);
    try {
      // Check BarcodeDetector API
      if (!("BarcodeDetector" in window)) {
        setError("Brauzeringiz kamera skanerini qo'llab-quvvatlamaydi. Qo'lda kiritishdan foydalaning.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });

      streamRef.current  = stream;
      videoRef.current   = videoEl;
      videoEl.srcObject  = stream;
      await videoEl.play();

      // @ts-ignore — BarcodeDetector not in TS lib yet
      detectorRef.current = new window.BarcodeDetector({
        formats: ["ean_13", "ean_8", "code_128", "code_39", "qr_code", "upc_a"],
      });

      setCamActive(true);
      setStatus("scanning");
      scanFrame();
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Kamera ruxsati berilmadi. Brauzer sozlamalarini tekshiring.");
      } else {
        setError("Kamerani ishga tushirishda xatolik: " + err.message);
      }
      setStatus("error");
    }
  }, []);

  const scanFrame = useCallback(() => {
    const video    = videoRef.current;
    const detector = detectorRef.current;
    if (!video || !detector || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    detector
      .detect(video)
      .then((barcodes: any[]) => {
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue as string;
          emit(code);
          // Pause briefly to avoid duplicate reads
          setTimeout(() => {
            rafRef.current = requestAnimationFrame(scanFrame);
          }, 1500);
        } else {
          rafRef.current = requestAnimationFrame(scanFrame);
        }
      })
      .catch(() => {
        rafRef.current = requestAnimationFrame(scanFrame);
      });
  }, [emit]);

  const stopCamera = useCallback(() => {
    if (rafRef.current)    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (videoRef.current)  videoRef.current.srcObject = null;
    streamRef.current  = null;
    detectorRef.current = null;
    setCamActive(false);
    setStatus("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    manualCode,
    setManualCode,
    submitManual,
    startCamera,
    stopCamera,
    camActive,
    status,
    lastCode,
    error,
    // utils
    generateEAN13,
    generateSKU,
    validateEAN13,
  };
}
