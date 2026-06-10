// ============================================================
// STALL PANELS — Shared helpers & metric calculator
// ============================================================

import type {
  Stall, Product, Transaction, Order, Table,
  Employee, StallMetrics,
} from "../types";

export function computeStallMetrics(
  stall: Stall,
  products: Product[],
  transactions: Transaction[],
  orders: Order[],
  tables: Table[],
  employees: Employee[]
): StallMetrics {
  const stallProducts = products.filter((p) => p.stallId === stall.id);
  const stallTxns     = transactions.filter((t) => t.stallId === stall.id);
  const stallOrders   = orders.filter((o) => o.stallId === stall.id);
  const stallTables   = tables.filter((t) => t.stallId === stall.id);

  const revenue      = stallTxns.reduce((s, t) => s + t.amount, 0);
  const orderCount   = stallTxns.length;
  const activeOrders = stallOrders.filter(
    (o) => o.status !== "PAID" && o.status !== "CANCELLED"
  ).length;
  const lowStockCount = stallProducts.filter(
    (p) => p.stock <= p.minStockAlert
  ).length;
  const tablesOccupied = stallTables.filter(
    (t) => t.status === "OCCUPIED" || t.status === "BILL_REQUESTED"
  ).length;
  const tablesTotal  = stallTables.length;
  const staffOnDuty  = employees.filter((e) => e.isCheckedIn).length;

  return {
    stallId: stall.id,
    revenue,
    orderCount,
    activeOrders,
    lowStockCount,
    tablesOccupied,
    tablesTotal,
    staffOnDuty,
  };
}
