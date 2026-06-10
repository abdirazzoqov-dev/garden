"use client";

// ============================================================
// PARK CENTRAL — Guest Order Poller
// Admin panel har 2 soniyada yangi QR buyurtmalarni tekshiradi
// va topilganlarni tizimga qo'shadi.
// ============================================================

import { useEffect, useRef, useCallback } from "react";
import type { Order, OrderItem } from "../types";

interface UseGuestOrderPollerOptions {
  enabled:     boolean;
  onNewOrders: (orders: Order[]) => void;
  intervalMs?: number;
}

export function useGuestOrderPoller({
  enabled,
  onNewOrders,
  intervalMs = 2500,
}: UseGuestOrderPollerOptions) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/orders/guest?since=true", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      const raw: any[] = data.orders ?? [];
      if (raw.length === 0) return;

      // Map raw API order → local Order type
      const orders: Order[] = raw.map((o) => ({
        id:          o.id,
        type:        o.type     ?? "DINE_IN",
        status:      "NEW",
        source:      "GUEST_QR" as any,
        stallId:     o.stallId,
        stallName:   o.stallName,
        tableId:     undefined,           // tableId lookup optional
        tableNumber: o.tableNumber ?? undefined,
        guestName:   o.guestName  ?? undefined,
        waiterId:    undefined,
        waiterName:  undefined,
        items:       (o.items ?? []) as OrderItem[],
        totalAmount: o.totalAmount ?? 0,
        createdAt:   o.createdAt,
        updatedAt:   o.updatedAt ?? o.createdAt,
      }));

      onNewOrders(orders);
    } catch {
      // silently ignore network errors
    }
  }, [onNewOrders]);

  useEffect(() => {
    if (!enabled) return;
    // Initial poll
    poll();
    timerRef.current = setInterval(poll, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, poll, intervalMs]);
}
