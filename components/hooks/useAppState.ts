"use client";

// ============================================================
// PARK CENTRAL — Central App State & Business Logic Hook
// ============================================================

import { useState, useEffect } from "react";
import {
  INITIAL_STALLS, INITIAL_EMPLOYEES, INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS, INITIAL_ATTENDANCE, INITIAL_WS_EVENTS,
  INITIAL_TABLES, INITIAL_ORDERS, INITIAL_DISCOUNTS,
  INITIAL_CUSTOMERS, INITIAL_LOYALTY_TXN,
} from "../constants";
import { formatNumber, getUniqueId, getSystemTime, getSystemTimeShort } from "../utils";
import type {
  Stall, Employee, Product, Transaction, AttendanceLog, WsEvent,
  CartItem, PaymentMethod, PayrollResult, PendingActionType,
  ActiveTab, BlueprintSubTab, ManagementSubTab,
  Table, TableStatus, Order, OrderItem, OrderStatus, OrderType,
  Discount, Customer, LoyaltyTransaction, LoyaltyTier,
} from "../types";
import { useNotifications } from "../notifications/useNotifications";
import { useDarkMode }       from "./useDarkMode";

export function useAppState() {
  // ── Dark mode ─────────────────────────────────────────────────
  const { isDark, toggle: toggleDark } = useDarkMode();

  // ── Notifications ─────────────────────────────────────────────
  const notif = useNotifications();

  // ── Navigation ────────────────────────────────────────────────
  const [activeTab,        setActiveTab]        = useState<ActiveTab>("pos");
  const [blueprintSubTab,  setBlueprintSubTab]  = useState<BlueprintSubTab>("prisma");
  const [managementSubTab, setManagementSubTab] = useState<ManagementSubTab>("stalls");
  const [copiedText,       setCopiedText]       = useState<string | null>(null);

  // ── Network ───────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(true);

  // ── Day-close modal ───────────────────────────────────────────
  const [dayCloseOpen, setDayCloseOpen] = useState(false);

  // ── Receipt modal ─────────────────────────────────────────────
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
  const [receiptOrder,       setReceiptOrder]       = useState<Order | null>(null);

  // ── Core data ─────────────────────────────────────────────────
  const [stalls,       setStalls]       = useState<Stall[]>(INITIAL_STALLS);
  const [employees,    setEmployees]    = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [products,     setProducts]     = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // ── Tables & Orders ───────────────────────────────────────────
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // ── Discounts ─────────────────────────────────────────────────
  const [discounts,         setDiscounts]         = useState<Discount[]>(INITIAL_DISCOUNTS);
  const [appliedDiscountId, setAppliedDiscountId] = useState<string | null>(null);

  // ── Customers & Loyalty ───────────────────────────────────────
  const [customers,      setCustomers]      = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyTransaction[]>(INITIAL_LOYALTY_TXN);

  // ── Orders UI state ───────────────────────────────────────────
  const [selectedOrderStallId, setSelectedOrderStallId] = useState<string>("stall_2");
  const [activeOrderId,        setActiveOrderId]        = useState<string | null>(null);

  // ── Sync ──────────────────────────────────────────────────────
  const [syncQueue, setSyncQueue] = useState<Transaction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs,  setSyncLogs]  = useState<string[]>([]);

  // ── Attendance ────────────────────────────────────────────────
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(INITIAL_ATTENDANCE);

  // ── WebSocket ─────────────────────────────────────────────────
  const [wsEvents, setWsEvents] = useState<WsEvent[]>(INITIAL_WS_EVENTS);

  // ── POS ───────────────────────────────────────────────────────
  const [selectedStallIdRaw, setSelectedStallIdRaw] = useState(INITIAL_STALLS[0].id);
  const [activeSellerId,     setActiveSellerId]     = useState("emp_2");
  const [cart,         setCart]         = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const setSelectedStallId = (id: string) => { setSelectedStallIdRaw(id); setCart([]); };

  // ── Auth ──────────────────────────────────────────────────────
  const [pendingSellerId,    setPendingSellerId]    = useState<string | null>(null);
  const [pendingActionType,  setPendingActionType]  = useState<PendingActionType>("switch_seller");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError,    setAuthError]    = useState("");

  // ── AI ────────────────────────────────────────────────────────
  const [aiReport,       setAiReport]       = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // ── Computed ──────────────────────────────────────────────────
  const totalParkRevenue  = transactions.reduce((s, t) => s + t.amount, 0);
  const totalProductsSold = transactions.reduce(
    (s, t) => s + t.items.reduce((a, i) => a + i.quantity, 0), 0
  );
  const criticalStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  const activeOrders     = orders.filter((o) => o.status !== "PAID" && o.status !== "CANCELLED");
  const pendingOrdersCount = orders.filter((o) =>
    o.status === "NEW" || o.status === "CONFIRMED" || o.status === "PREPARING"
  ).length;

  // ── Effects ───────────────────────────────────────────────────

  // Low stock alert
  useEffect(() => {
    const low = products.filter((p) => p.stock <= p.minStockAlert && p.stock > 0);
    if (!low.length) return;
    const t = setTimeout(() => {
      const item = low[Math.floor(Math.random() * low.length)];
      setWsEvents((prev) => {
        if (prev.some((e) => e.text.includes(item.name) && e.text.includes("kam"))) return prev;
        return [{
          id: getUniqueId("ws"), time: getSystemTime(),
          text: `[ZAXIRA] ${item.name}: ${item.stock} ${item.unit ?? "dona"} qoldi (${item.stallName})`,
          type: "warning",
        }, ...prev];
      });
      notif.push(
        "⚠ Zaxira ogohlantirish",
        `${item.name}: ${item.stock} ${item.unit ?? "dona"} qoldi — ${item.stallName}`,
        "warning",
        { actionLabel: "Boshqaruvga o'tish", actionTab: "management" }
      );
    }, 5000);
    return () => clearTimeout(t);
  }, [products]);

  // Simulated live WS
  useEffect(() => {
    const iv = setInterval(() => {
      if (!isOnline || Math.random() <= 0.7) return;
      const rp = products[Math.floor(Math.random() * products.length)];
      setWsEvents((prev) => [{
        id: getUniqueId("ws"), time: getSystemTime(),
        text: `Hamkor kassa sotuvi: ${rp.stallName} — ${formatNumber(rp.price * 2)} so'm`,
        type: "success",
      }, ...prev]);
    }, 15000);
    return () => clearInterval(iv);
  }, [isOnline, products]);

  // ══════════════════════════════════════════════════════════════
  // TABLE ACTIONS
  // ══════════════════════════════════════════════════════════════

  const setTableStatus = (tableId: string, status: TableStatus, extra?: Partial<Table>) => {
    setTables((prev) =>
      prev.map((t) => t.id === tableId ? { ...t, status, ...extra } : t)
    );
  };

  const handleOpenTable = (tableId: string, guestCount: number, waiterId?: string) => {
    const table   = tables.find((t) => t.id === tableId);
    const waiter  = employees.find((e) => e.id === waiterId);
    if (!table) return;

    const newOrder: Order = {
      id:          getUniqueId("ord"),
      type:        "DINE_IN",
      status:      "NEW",
      stallId:     table.stallId,
      stallName:   table.stallName,
      tableId,
      tableNumber: table.number,
      waiterId,
      waiterName:  waiter?.name,
      items:       [],
      totalAmount: 0,
      guestCount,
      createdAt:   getSystemTime(),
      updatedAt:   getSystemTime(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setTableStatus(tableId, "OCCUPIED", {
      currentOrderId: newOrder.id,
      waiterName:     waiter?.name,
    });
    setActiveOrderId(newOrder.id);

    setWsEvents((prev) => [{
      id: getUniqueId("ws"), time: getSystemTime(),
      text: `🪑 Stol #${table.number} ochildi — ${table.stallName} (${guestCount} mehmon)`,
      type: "info",
    }, ...prev]);

    return newOrder.id;
  };

  const handleAddItemToOrder = (
    orderId: string,
    product: Product,
    quantity: number = 1,
    note?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const existIdx = o.items.findIndex((i) => i.productId === product.id && !i.note && !note);
        let newItems: OrderItem[];
        if (existIdx >= 0) {
          newItems = o.items.map((item, idx) =>
            idx === existIdx ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          const newItem: OrderItem = {
            id:          getUniqueId("oi"),
            productId:   product.id,
            productName: product.name,
            category:    product.category,
            price:       product.price,
            quantity,
            note,
            status:      "PENDING",
            prepTime:    product.prepTime,
          };
          newItems = [...o.items, newItem];
        }
        const total = newItems.reduce((s, i) => s + i.price * i.quantity, 0);
        return { ...o, items: newItems, totalAmount: total, updatedAt: getSystemTime() };
      })
    );
  };

  const handleRemoveItemFromOrder = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const newItems  = o.items.filter((i) => i.id !== itemId);
        const total     = newItems.reduce((s, i) => s + i.price * i.quantity, 0);
        return { ...o, items: newItems, totalAmount: total, updatedAt: getSystemTime() };
      })
    );
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const now = getSystemTime();
        const extra: Partial<Order> = { status, updatedAt: now };
        if (status === "SERVED")  extra.servedAt = now;

        // Sync table status
        if (o.tableId) {
          if (status === "BILL_REQUESTED") setTableStatus(o.tableId, "BILL_REQUESTED");
          if (status === "PAID" || status === "CANCELLED") {
            setTableStatus(o.tableId, "FREE", { currentOrderId: undefined, waiterName: undefined });
          }
        }

        setWsEvents((ws) => [{
          id: getUniqueId("ws"), time: now,
          text: getOrderStatusWsText(status, o),
          type: status === "CANCELLED" ? "warning" : status === "PAID" ? "success" : "info",
        }, ...ws]);

        return { ...o, ...extra };
      })
    );
  };

  const handlePayOrder = (orderId: string, method: PaymentMethod) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.totalAmount <= 0) return;

    // Create transaction record
    const txn: Transaction = {
      id:           `txn_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 5)}`,
      amount:       order.totalAmount,
      paymentMethod: method,
      employeeId:   order.waiterId ?? employees[0].id,
      employeeName: order.waiterName ?? employees[0].name,
      stallId:      order.stallId,
      stallName:    order.stallName,
      items:        order.items.map((i) => ({
        productName: i.productName, quantity: i.quantity, price: i.price,
      })),
      createdAt:    getSystemTime(),
      syncStatus:   "SYNCED",
    };

    setTransactions((prev) => [txn, ...prev]);

    // Mark order paid
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "PAID", paymentMethod: method, paidAt: getSystemTime(), updatedAt: getSystemTime() }
          : o
      )
    );

    // Free table
    if (order.tableId) {
      setTableStatus(order.tableId, "FREE", { currentOrderId: undefined, waiterName: undefined });
    }

    setWsEvents((prev) => [{
      id: getUniqueId("ws"), time: getSystemTime(),
      text: `💳 To'lov qabul qilindi: ${order.stallName}${order.tableNumber ? ` Stol #${order.tableNumber}` : ""} — ${formatNumber(order.totalAmount)} so'm (${method})`,
      type: "success",
    }, ...prev]);
  };

  const handleCreateTakeawayOrder = (stallId: string, items: { product: Product; qty: number }[]) => {
    const stall = stalls.find((s) => s.id === stallId);
    if (!stall) return;

    const orderItems: OrderItem[] = items.map(({ product, qty }) => ({
      id:          getUniqueId("oi"),
      productId:   product.id,
      productName: product.name,
      category:    product.category,
      price:       product.price,
      quantity:    qty,
      status:      "PENDING",
      prepTime:    product.prepTime,
    }));

    const total   = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderType: OrderType = stall.type === "FASTFOOD" ? "FASTFOOD" : "TAKEAWAY";

    const newOrder: Order = {
      id:          getUniqueId("ord"),
      type:        orderType,
      status:      "NEW",
      stallId:     stall.id,
      stallName:   stall.name,
      items:       orderItems,
      totalAmount: total,
      createdAt:   getSystemTime(),
      updatedAt:   getSystemTime(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setWsEvents((prev) => [{
      id: getUniqueId("ws"), time: getSystemTime(),
      text: `🥡 Yangi ${orderType === "FASTFOOD" ? "Fast-food" : "Takeaway"} buyurtma: ${stall.name} — ${formatNumber(total)} so'm`,
      type: "info",
    }, ...prev]);

    return newOrder.id;
  };

  const handleUpdateOrderItemStatus = (
    orderId: string,
    itemId: string,
    status: OrderItem["status"]
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const newItems = o.items.map((i) => i.id === itemId ? { ...i, status } : i);
        // Auto-advance order if all items ready
        const allReady = newItems.every((i) => i.status === "READY" || i.status === "SERVED");
        const newStatus = allReady && o.status === "PREPARING" ? "READY" : o.status;
        return { ...o, items: newItems, status: newStatus, updatedAt: getSystemTime() };
      })
    );
  };

  const handleCancelOrder = (orderId: string, reason?: string) => {
    handleUpdateOrderStatus(orderId, "CANCELLED");
    if (reason) {
      setWsEvents((prev) => [{
        id: getUniqueId("ws"), time: getSystemTime(),
        text: `❌ Buyurtma bekor qilindi: ${reason}`,
        type: "warning",
      }, ...prev]);
    }
  };

  const handleSetReservation = (tableId: string, name: string, time: string) => {
    setTableStatus(tableId, "RESERVED", { reservedFor: name, reservedAt: time });
    const table = tables.find((t) => t.id === tableId);
    setWsEvents((prev) => [{
      id: getUniqueId("ws"), time: getSystemTime(),
      text: `📅 Rezervatsiya: ${table?.stallName} Stol #${table?.number} — ${name} (${time})`,
      type: "info",
    }, ...prev]);
  };

  const handleCancelReservation = (tableId: string) => {
    setTableStatus(tableId, "FREE", { reservedFor: undefined, reservedAt: undefined });
  };

  // ── Discount helpers ──────────────────────────────────────────
  const calcDiscountAmount = (amount: number): number => {
    if (!appliedDiscountId) return 0;
    const d = discounts.find((d) => d.id === appliedDiscountId);
    if (!d || d.status !== "ACTIVE") return 0;
    if (d.minOrderAmount && amount < d.minOrderAmount) return 0;
    if (d.type === "PERCENTAGE")   return Math.round(amount * d.value / 100);
    if (d.type === "FIXED_AMOUNT") return Math.min(d.value, amount);
    return 0;
  };

  // ══════════════════════════════════════════════════════════════
  // DISCOUNT CRUD
  // ══════════════════════════════════════════════════════════════

  const handleAddDiscount = (d: Discount) => setDiscounts((prev) => [d, ...prev]);
  const handleUpdateDiscount = (d: Discount) =>
    setDiscounts((prev) => prev.map((x) => x.id === d.id ? d : x));
  const handleDeleteDiscount = (id: string) =>
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  const handleToggleDiscount = (id: string) =>
    setDiscounts((prev) =>
      prev.map((d) => d.id === id
        ? { ...d, status: d.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
        : d
      )
    );

  // ══════════════════════════════════════════════════════════════
  // CUSTOMER & LOYALTY ACTIONS
  // ══════════════════════════════════════════════════════════════

  const getTierFromSpent = (totalSpent: number): LoyaltyTier => {
    if (totalSpent >= 5000000) return "PLATINUM";
    if (totalSpent >= 2000000) return "GOLD";
    if (totalSpent >= 500000)  return "SILVER";
    return "BRONZE";
  };

  const handleAddCustomer    = (c: Customer) => setCustomers((prev) => [c, ...prev]);
  const handleUpdateCustomer = (c: Customer) =>
    setCustomers((prev) => prev.map((x) => x.id === c.id ? c : x));
  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setLoyaltyHistory((prev) => prev.filter((h) => h.customerId !== id));
  };
  const handleToggleCustomerActive = (id: string) =>
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c));

  const handleAddLoyaltyPoints = (customerId: string, points: number, description: string) => {
    const today = new Date().toISOString().split("T")[0];
    const cust  = customers.find((c) => c.id === customerId);
    if (!cust) return;
    setCustomers((prev) => prev.map((c) => c.id === customerId ? { ...c, points: c.points + points } : c));
    setLoyaltyHistory((prev) => [{
      id: getUniqueId("lpt"), customerId, customerName: cust.name,
      type: "BONUS", points, description, createdAt: today,
    }, ...prev]);
  };

  const handleRedeemLoyaltyPoints = (customerId: string, pointsToRedeem: number) => {
    const today = new Date().toISOString().split("T")[0];
    const cust  = customers.find((c) => c.id === customerId);
    if (!cust || cust.points < pointsToRedeem) return;
    setCustomers((prev) => prev.map((c) => c.id === customerId ? { ...c, points: c.points - pointsToRedeem } : c));
    setLoyaltyHistory((prev) => [{
      id: getUniqueId("lpt"), customerId, customerName: cust.name,
      type: "REDEEM", points: -pointsToRedeem,
      description: `${pointsToRedeem} ball almashildi — chegirma olindi`, createdAt: today,
    }, ...prev]);
  };

  // ══════════════════════════════════════════════════════════════
  // POS ACTIONS
  // ══════════════════════════════════════════════════════════════

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0 || !product.isAvailable) return;
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      if (ex) {
        if (ex.quantity >= product.stock) return prev;
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const next = item.quantity + delta;
        if (next <= 0) return null;
        if (next > item.product.stock) return item;
        return { ...item, quantity: next };
      }).filter(Boolean) as CartItem[]
    );
  };

  const handleCheckout = () => {
    if (!cart.length) return;
    const employee = employees.find((e) => e.id === activeSellerId) ?? employees[0];
    const stall    = stalls.find((s) => s.id === selectedStallIdRaw) ?? stalls[0];
    const time     = getSystemTime();
    const rawAmount  = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const discAmount = calcDiscountAmount(rawAmount);
    const amount     = rawAmount - discAmount;

    const newTxn: Transaction = {
      id: `txn_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 5)}`,
      amount, paymentMethod,
      employeeId: employee.id, employeeName: employee.name,
      stallId: stall.id, stallName: stall.name,
      items: cart.map((i) => ({ productName: i.product.name, quantity: i.quantity, price: i.product.price })),
      createdAt: time,
      syncStatus: isOnline ? "SYNCED" : "PENDING",
    };

    setProducts((prev) =>
      prev.map((p) => { const ci = cart.find((c) => c.product.id === p.id); return ci ? { ...p, stock: p.stock - ci.quantity } : p; })
    );
    setTransactions((prev) => [newTxn, ...prev]);

    // Notify
    notif.push(
      "Sotuv muvaffaqiyatli",
      `${employee.name} — ${formatNumber(amount)} so'm (${stall.name})`,
      "success",
      { actionLabel: "Hisobotni ko'rish", actionTab: "reports" }
    );

    // Increment discount usage
    if (appliedDiscountId) {
      setDiscounts((prev) =>
        prev.map((d) => d.id === appliedDiscountId ? { ...d, usageCount: d.usageCount + 1 } : d)
      );
      setAppliedDiscountId(null);
    }

    if (isOnline) {
      setWsEvents((prev) => [{ id: getUniqueId("ws"), time, text: `✅ Sotuv: ${employee.name} (${stall.name}) — ${formatNumber(amount)} so'm`, type: "success" }, ...prev]);
    } else {
      setSyncQueue((prev) => [...prev, newTxn]);
      setWsEvents((prev) => [{ id: getUniqueId("ws"), time, text: `[OFFLINE] ${formatNumber(amount)} so'm IndexedDB navbatiga kiritildi`, type: "warning" }, ...prev]);
    }
    setCart([]);
  };

  // ══════════════════════════════════════════════════════════════
  // OFFLINE SYNC
  // ══════════════════════════════════════════════════════════════

  const runOfflineSync = async () => {
    if (!syncQueue.length || isSyncing) return;
    setIsSyncing(true); setSyncLogs([]);
    const log = (t: string) => setSyncLogs((p) => [...p, t]);
    log("🔍 Sinxronizatsiya boshlandi..."); await delay(800);
    log(`📁 ${syncQueue.length} ta tranzaksiya aniqlandi.`); await delay(1000);
    log("📡 Server xavfsiz kanali: 200 OK"); await delay(600);
    for (let i = 0; i < syncQueue.length; i++) {
      await delay(600);
      log(`📝 [${i + 1}/${syncQueue.length}] ${syncQueue[i].id} — ${formatNumber(syncQueue[i].amount)} so'm`);
    }
    await delay(800); log("📊 PostgreSQL yangilandi.");
    await delay(600); log("📦 Zaxiralar sinxronlashtirildi.");
    await delay(500); log("🎉 Muvaffaqiyatli yakunlandi!");
    setTransactions((prev) => prev.map((t) => t.syncStatus === "PENDING" ? { ...t, syncStatus: "SYNCED" } : t));
    setWsEvents((prev) => [{ id: getUniqueId("ws"), time: getSystemTime(), text: `[SYNC] ${syncQueue.length} ta tranzaksiya PostgreSQL-ga yuklandi`, type: "success" }, ...prev]);
    setSyncQueue([]); setIsSyncing(false);
  };

  // ══════════════════════════════════════════════════════════════
  // HR ACTIONS
  // ══════════════════════════════════════════════════════════════

  const handleEmployeeCheckToggle = (empId: string) => {
    const time = getSystemTimeShort();
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id !== empId) return e;
        const next = !e.isCheckedIn;
        const role = e.role === "MANAGER" ? "Menejer" : e.role === "SELLER" ? "Sotuvchi" : e.role === "CHEF" ? "Oshpaz" : e.role === "WAITER" ? "Ofitsiant" : "Nazoratchi";
        setAttendanceLogs((l) => [{ id: getUniqueId("att"), employeeName: e.name, role, type: next ? "KIRISH" : "CHIQISH", time }, ...l]);
        setWsEvents((w) => [{ id: getUniqueId("ws"), time: `${time}:00`, text: `Xodim ${e.name} ${next ? "ishni boshladi" : "ishni tugatdi"}`, type: next ? "info" : "warning" }, ...w]);
        return { ...e, isCheckedIn: next, lastCheckIn: next ? time : e.lastCheckIn, lastCheckOut: !next ? time : e.lastCheckOut };
      })
    );
  };

  // ══════════════════════════════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════════════════════════════

  const openAuthModal = (empId: string, action: PendingActionType) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    setPendingSellerId(empId); setPendingActionType(action);
    setAuthUsername(emp.username ?? ""); setAuthPassword(""); setAuthError("");
  };

  const closeAuthModal = () => {
    setPendingSellerId(null);
    setAuthUsername(""); setAuthPassword(""); setAuthError("");
  };

  const handleAuthSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!pendingSellerId) return;
    const emp = employees.find((e) => e.id === pendingSellerId);
    if (!emp) { setAuthError("Xodim topilmadi."); return; }
    if (authUsername.trim().toLowerCase() !== emp.username.toLowerCase() || authPassword !== emp.password) {
      setAuthError("Yaroqsiz login va/yoki parol!"); return;
    }
    if (pendingActionType === "switch_seller") {
      setActiveSellerId(pendingSellerId);
      setWsEvents((w) => [{ id: getUniqueId("ws"), time: getSystemTime(), text: `🔑 ${emp.name} POS kassaga kirdi.`, type: "success" }, ...w]);
    } else {
      handleEmployeeCheckToggle(pendingSellerId);
    }
    closeAuthModal();
  };

  // ══════════════════════════════════════════════════════════════
  // PAYROLL
  // ══════════════════════════════════════════════════════════════

  const calculatePayroll = (emp: Employee): PayrollResult => {
    const dailyBase   = Math.round(emp.baseSalary / 30);
    const salesVolume = transactions.filter((t) => t.employeeId === emp.id).reduce((s, t) => s + t.amount, 0);
    const bonusAmount = Math.round((salesVolume * emp.bonusPercentage) / 100);
    return { dailyBase, salesVolume, bonusAmount, totalWage: dailyBase + bonusAmount };
  };

  // ══════════════════════════════════════════════════════════════
  // AI
  // ══════════════════════════════════════════════════════════════

  const getAiDashboardAdvice = async () => {
    setIsGeneratingAi(true); setAiReport("");
    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salesData: {
            stalls: stalls.map((st) => ({ name: st.name, salesTotal: transactions.filter((t) => t.stallId === st.id).reduce((s, t) => s + t.amount, 0) })),
            totalSalesToday: totalParkRevenue,
          },
          lowStockData: products.filter((p) => p.stock <= p.minStockAlert).map((p) => ({ stall: p.stallName, product: p.name, stock: p.stock, min: p.minStockAlert })),
          attendanceData: { activeSellers: employees.filter((e) => e.isCheckedIn).length, totalCount: employees.length },
        }),
      });
      const data = await res.json();
      setAiReport(data.text ?? `Xatolik: ${data.error}`);
    } catch { setAiReport("Server xatoligi: Gemini API javob bermaydi."); }
    finally { setIsGeneratingAi(false); }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // ══════════════════════════════════════════════════════════════
  // MANAGEMENT CRUD
  // ══════════════════════════════════════════════════════════════

  const handleAddStall = (stall: Stall) => {
    setStalls((prev) => [...prev, stall]);
    // Auto-generate tables if tableCount provided
    if (stall.tableCount && stall.tableCount > 0) {
      const newTables: Table[] = Array.from({ length: Math.min(stall.tableCount, 30) }, (_, i) => ({
        id: getUniqueId("tbl"),
        number: i + 1,
        stallId: stall.id,
        stallName: stall.name,
        capacity: 4,
        status: "FREE" as TableStatus,
      }));
      setTables((prev) => [...prev, ...newTables]);
    }
    setWsEvents((prev) => [{ id: getUniqueId("ws"), time: getSystemTime(), text: `🏪 Yangi rasta: «${stall.name}»`, type: "success" }, ...prev]);
  };

  const handleUpdateStall = (updated: Stall) => {
    setStalls((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    setProducts((prev) => prev.map((p) => p.stallId === updated.id ? { ...p, stallName: updated.name } : p));
    setTables((prev) => prev.map((t) => t.stallId === updated.id ? { ...t, stallName: updated.name } : t));
  };

  const handleDeleteStall = (id: string) => {
    const name = stalls.find((s) => s.id === id)?.name ?? "";
    setStalls((prev) => prev.filter((s) => s.id !== id));
    setProducts((prev) => prev.filter((p) => p.stallId !== id));
    setTables((prev) => prev.filter((t) => t.stallId !== id));
    if (selectedStallIdRaw === id) setSelectedStallIdRaw(stalls.find((s) => s.id !== id)?.id ?? "");
    setWsEvents((prev) => [{ id: getUniqueId("ws"), time: getSystemTime(), text: `🗑️ Rasta o'chirildi: «${name}»`, type: "warning" }, ...prev]);
  };

  const handleAddProduct    = (p: Product) => setProducts((prev) => [...prev, p]);
  const handleUpdateProduct = (p: Product) => setProducts((prev) => prev.map((x) => x.id === p.id ? p : x));
  const handleDeleteProduct = (id: string) => { setProducts((prev) => prev.filter((p) => p.id !== id)); setCart((prev) => prev.filter((c) => c.product.id !== id)); };
  const handleToggleProductAvailable = (id: string) => setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isAvailable: !p.isAvailable } : p));

  // ══════════════════════════════════════════════════════════════
  // RETURN
  // ══════════════════════════════════════════════════════════════

  return {
    // data
    stalls, employees, products, transactions,
    attendanceLogs, wsEvents, syncQueue, isSyncing, syncLogs,
    // tables & orders
    tables, orders, activeOrders, pendingOrdersCount,
    selectedOrderStallId, setSelectedOrderStallId,
    activeOrderId, setActiveOrderId,
    // nav
    activeTab, setActiveTab,
    blueprintSubTab, setBlueprintSubTab,
    managementSubTab, setManagementSubTab,
    copiedText,
    // network
    isOnline, setIsOnline,
    // pos
    selectedStallId: selectedStallIdRaw, setSelectedStallId,
    activeSellerId, cart, paymentMethod, setPaymentMethod,
    // auth
    pendingSellerId, pendingActionType,
    authUsername, setAuthUsername,
    authPassword, setAuthPassword,
    authError, openAuthModal, closeAuthModal, handleAuthSubmit,
    // pos actions
    handleAddToCart, handleUpdateCartQty, handleCheckout,
    // order actions
    handleOpenTable, handleAddItemToOrder, handleRemoveItemFromOrder,
    handleUpdateOrderStatus, handlePayOrder,
    handleCreateTakeawayOrder, handleUpdateOrderItemStatus,
    handleCancelOrder, handleSetReservation, handleCancelReservation,
    setTableStatus,
    // other actions
    runOfflineSync, calculatePayroll, getAiDashboardAdvice, copyToClipboard,
    // ai
    aiReport, isGeneratingAi,
    // stats
    totalParkRevenue, totalProductsSold, criticalStockCount,
    // management
    handleAddStall, handleUpdateStall, handleDeleteStall,
    handleAddProduct, handleUpdateProduct, handleDeleteProduct,
    handleToggleProductAvailable,
    // discounts
    discounts, appliedDiscountId, setAppliedDiscountId,
    calcDiscountAmount,
    handleAddDiscount, handleUpdateDiscount, handleDeleteDiscount, handleToggleDiscount,
    // customers & loyalty
    customers, loyaltyHistory,
    handleAddCustomer, handleUpdateCustomer, handleDeleteCustomer,
    handleToggleCustomerActive,
    handleAddLoyaltyPoints, handleRedeemLoyaltyPoints,

    // ── New features ──────────────────────────────────────────
    // Dark mode
    isDark, toggleDark,
    // Notifications
    notifications: notif.notifications,
    unreadCount:   notif.unreadCount,
    pushNotif:     notif.push,
    markNotifRead:    notif.markRead,
    markAllNotifsRead: notif.markAllRead,
    dismissNotif:  notif.dismiss,
    clearAllNotifs:notif.clearAll,
    // Day close
    dayCloseOpen, setDayCloseOpen,
    // Receipt
    receiptTransaction, setReceiptTransaction,
    receiptOrder,       setReceiptOrder,
  };
}

// ── Helpers ───────────────────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getOrderStatusWsText(status: OrderStatus, order: Order): string {
  const loc = order.tableNumber ? `Stol #${order.tableNumber}` : order.stallName;
  switch (status) {
    case "CONFIRMED":      return `✅ Buyurtma tasdiqlandi — ${loc}`;
    case "PREPARING":      return `👨‍🍳 Oshpazxonaga yuborildi — ${loc}`;
    case "READY":          return `🔔 Tayyor! Yetkazish kutilmoqda — ${loc}`;
    case "SERVED":         return `🍽️ Yetkazildi — ${loc} (${formatNumber(order.totalAmount)} so'm)`;
    case "BILL_REQUESTED": return `💳 Hisob so'raldi — ${loc}`;
    case "PAID":           return `💰 To'landi — ${loc} (${formatNumber(order.totalAmount)} so'm)`;
    case "CANCELLED":      return `❌ Bekor qilindi — ${loc}`;
    default:               return `Buyurtma yangilandi — ${loc}`;
  }
}
