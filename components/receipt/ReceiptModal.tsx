"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Printer, Download, CheckCircle2 } from "lucide-react";
import type { Transaction, Order, PaymentMethod } from "../types";
import { formatNumber } from "../utils";

interface ReceiptModalProps {
  transaction?: Transaction | null;
  order?:       Order       | null;
  onClose:      () => void;
}

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CASH:   "Naqd pul",
  CARD:   "Plastik karta",
  MOBILE: "Click / Payme",
};

export default function ReceiptModal({ transaction, order, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  // ── Unified data ───────────────────────────────────────────
  const stallName   = transaction?.stallName   ?? order?.stallName   ?? "—";
  const employeeName= transaction?.employeeName ?? order?.waiterName  ?? "—";
  const createdAt   = transaction?.createdAt   ?? order?.createdAt   ?? "—";
  const payMethod   = (transaction?.paymentMethod ?? order?.paymentMethod) as PaymentMethod | undefined;
  const total       = transaction?.amount ?? order?.totalAmount ?? 0;
  const txId        = transaction?.id ?? order?.id ?? "—";

  const items = transaction
    ? transaction.items.map((i) => ({ name: i.productName, qty: i.quantity, price: i.price }))
    : (order?.items ?? []).map((i) => ({ name: i.productName, qty: i.quantity, price: i.price }));

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  // ── Print ──────────────────────────────────────────────────
  const handlePrint = () => {
    if (!receiptRef.current) return;
    const content = receiptRef.current.innerHTML;
    const win = window.open("", "_blank", "width=400,height=700");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>Chek — Park Central</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Courier New', monospace; font-size: 12px;
               width: 80mm; padding: 8px; color: #000; }
        .center { text-align: center; }
        .bold   { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 6px 0; }
        .row    { display: flex; justify-content: space-between; margin: 2px 0; }
        .total  { font-size: 14px; font-weight: bold; }
        @media print { body { margin: 0; } }
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  if (!transaction && !order) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(10,26,11,.7)", backdropFilter: "blur(8px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: .93, y: 20 }} animate={{ scale: 1, y: 0 }}
          exit={{ scale: .93, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ede8] bg-[#f7f5f2]">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#4d8751]" />
              <span className="text-sm font-[800] text-[#1e3d1f]">Chek ko'rish</span>
            </div>
            <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>

          {/* Receipt preview */}
          <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
            <div
              ref={receiptRef}
              className="font-mono text-[11px] text-black space-y-1 leading-relaxed"
            >
              {/* Header */}
              <div className="center bold text-[13px] mb-1">🌿 PARK CENTRAL</div>
              <div className="center text-[10px] text-gray-500">Dam olish maskani</div>
              <div className="divider" />

              {/* Meta */}
              <div className="row"><span>Rasta:</span><span className="bold">{stallName}</span></div>
              <div className="row"><span>Kassir:</span><span>{employeeName}</span></div>
              <div className="row"><span>Vaqt:</span><span className="font-mono">{createdAt}</span></div>
              <div className="row"><span>Chek #:</span><span className="font-mono text-[10px]">{txId.slice(-8)}</span></div>
              <div className="divider" />

              {/* Items */}
              <div className="bold mb-1">MAHSULOTLAR:</div>
              {items.map((item, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="flex-1 truncate pr-2">{item.name}</span>
                    <span className="font-mono">{formatNumber(item.price * item.qty)}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 pl-2">
                    {item.qty} × {formatNumber(item.price)} so'm
                  </div>
                </div>
              ))}
              <div className="divider" />

              {/* Totals */}
              <div className="row"><span>Oraliq summa:</span><span>{formatNumber(subtotal)} so'm</span></div>
              <div className="row"><span>QQS (0%):</span><span>0 so'm</span></div>
              {payMethod && (
                <div className="row"><span>To'lov:</span><span>{PAYMENT_LABEL[payMethod] ?? payMethod}</span></div>
              )}
              <div className="divider" />
              <div className="row total">
                <span>JAMI:</span>
                <span>{formatNumber(total)} so'm</span>
              </div>
              <div className="divider" />

              {/* Footer */}
              <div className="center text-[10px] text-gray-500 mt-2">
                Xaridingiz uchun rahmat!<br/>
                Park Central — Yagona boshqaruv tizimi
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-5 py-4 border-t border-[#f0ede8] bg-[#f7f5f2]">
            <button onClick={onClose} className="btn btn-secondary flex-1 btn-sm">
              <X className="w-3.5 h-3.5" /> Yopish
            </button>
            <button onClick={handlePrint} className="btn btn-primary flex-1 btn-sm">
              <Printer className="w-3.5 h-3.5" /> Chop etish
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
