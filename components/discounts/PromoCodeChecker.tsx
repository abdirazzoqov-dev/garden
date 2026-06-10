"use client";

import { useState } from "react";
import { Tag, CheckCircle2, X, Sparkles } from "lucide-react";
import type { Discount } from "../types";
import { formatNumber } from "../utils";

interface PromoCodeCheckerProps {
  discounts: Discount[];
  orderAmount: number;
  appliedDiscountId: string | null;
  onApply: (discountId: string | null) => void;
}

export default function PromoCodeChecker({
  discounts, orderAmount, appliedDiscountId, onApply,
}: PromoCodeCheckerProps) {
  const [code,    setCode]    = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const applied = discounts.find((d) => d.id === appliedDiscountId);

  const handleApply = () => {
    setError(""); setSuccess("");
    if (!code.trim()) { setError("Promo-kod kiriting"); return; }

    const found = discounts.find(
      (d) => d.code?.toUpperCase() === code.trim().toUpperCase() && d.status === "ACTIVE"
    );

    if (!found) { setError("Promo-kod topilmadi yoki faol emas"); return; }
    if (found.maxUsageCount && found.usageCount >= found.maxUsageCount) {
      setError("Bu promo-kod ishlatish limitiga yetdi"); return;
    }
    if (found.minOrderAmount && orderAmount < found.minOrderAmount) {
      setError(`Minimal buyurtma summasi: ${formatNumber(found.minOrderAmount)} so'm`); return;
    }

    onApply(found.id);
    setSuccess(`«${found.name}» chegirmasi qo'llandi!`);
    setCode("");
  };

  const handleRemove = () => {
    onApply(null);
    setSuccess(""); setError("");
  };

  // Calculate discount amount
  const calcDiscount = (d: Discount): number => {
    if (d.type === "PERCENTAGE")   return Math.round(orderAmount * d.value / 100);
    if (d.type === "FIXED_AMOUNT") return Math.min(d.value, orderAmount);
    return 0;
  };

  return (
    <div className="space-y-3">
      {/* Applied discount display */}
      {applied ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-violet-50 border-2 border-violet-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
            <div>
              <p className="text-xs font-[800] text-violet-800">{applied.name}</p>
              <p className="text-[10px] text-violet-600 font-[600]">
                {applied.type === "PERCENTAGE"
                  ? `${applied.value}% chegirma — ${formatNumber(calcDiscount(applied))} so'm tejash`
                  : applied.type === "FIXED_AMOUNT"
                  ? `${formatNumber(applied.value)} so'm chegirma`
                  : `${applied.buyQty} ta ol, ${applied.getQty} ta bepul`
                }
              </p>
            </div>
          </div>
          <button onClick={handleRemove}
            className="btn-icon btn-icon-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9daa9e]" />
            <input
              className="input pl-9 font-mono uppercase text-sm"
              placeholder="PROMO KOD"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />
          </div>
          <button onClick={handleApply}
            className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-0 shrink-0">
            <Sparkles className="w-3.5 h-3.5" /> Qo'llash
          </button>
        </div>
      )}

      {/* Error / success messages */}
      {error && (
        <p className="text-xs text-red-600 font-[600] flex items-center gap-1.5">
          <X className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      {success && (
        <p className="text-xs text-violet-700 font-[700] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> {success}
        </p>
      )}
    </div>
  );
}
