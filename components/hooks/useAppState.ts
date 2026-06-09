"use client";

// ============================================================
// PARK CENTRAL — Central App State & Business Logic Hook
// ============================================================

import { useState, useEffect } from "react";
import {
  STALLS,
  INITIAL_EMPLOYEES,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ATTENDANCE,
  INITIAL_WS_EVENTS,
} from "../constants";
import { formatNumber, getUniqueId, getSystemTime, getSystemTimeShort } from "../utils";
import type {
  Employee,
  Product,
  Transaction,
  AttendanceLog,
  WsEvent,
  CartItem,
  PaymentMethod,
  PayrollResult,
  PendingActionType,
  ActiveTab,
  BlueprintSubTab,
} from "../types";

export function useAppState() {
  // ── Tab navigation ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>("pos");
  const [blueprintSubTab, setBlueprintSubTab] = useState<BlueprintSubTab>("prisma");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // ── Network mode ────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(true);

  // ── Core data ───────────────────────────────────────────────
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // ── Sync queue (IndexedDB simulation) ───────────────────────
  const [syncQueue, setSyncQueue] = useState<Transaction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // ── Attendance ───────────────────────────────────────────────
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(INITIAL_ATTENDANCE);

  // ── WebSocket event stream ───────────────────────────────────
  const [wsEvents, setWsEvents] = useState<WsEvent[]>(INITIAL_WS_EVENTS);

  // ── POS state ────────────────────────────────────────────────
  const [selectedStallId, setSelectedStallIdRaw] = useState("stall_1");
  const [activeSellerId, setActiveSellerId] = useState("emp_2");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Reset cart when stall changes
  const setSelectedStallId = (id: string) => {
    setSelectedStallIdRaw(id);
    setCart([]);
  };
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  // ── Auth modal ───────────────────────────────────────────────
  const [pendingSellerId, setPendingSellerId] = useState<string | null>(null);
  const [pendingActionType, setPendingActionType] = useState<PendingActionType>("switch_seller");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // ── AI report ────────────────────────────────────────────────
  const [aiReport, setAiReport] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // ── Computed stats ───────────────────────────────────────────
  const totalParkRevenue = transactions.reduce((s, t) => s + t.amount, 0);
  const totalProductsSold = transactions.reduce(
    (s, t) => s + t.items.reduce((a, i) => a + i.quantity, 0),
    0
  );
  const criticalStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  // ── Effects ──────────────────────────────────────────────────

  // Low stock alerts
  useEffect(() => {
    const lowItems = products.filter((p) => p.stock <= p.minStockAlert);
    if (!lowItems.length) return;
    const timer = setTimeout(() => {
      const item = lowItems[Math.floor(Math.random() * lowItems.length)];
      setWsEvents((prev) => {
        if (prev.some((e) => e.text.includes(item.name) && e.text.includes("kam"))) return prev;
        return [
          {
            id: getUniqueId("ws"),
            time: getSystemTime(),
            text: `[ZAXIRA] ${item.name} zaxirasi o'ta kam: ${item.stock} dona qoldi (${item.stallName})`,
            type: "warning",
          },
          ...prev,
        ];
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, [products]);

  // Simulated live WS events
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOnline || Math.random() <= 0.7) return;
      const rp = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 2) + 1;
      setWsEvents((prev) => [
        {
          id: getUniqueId("ws"),
          time: getSystemTime(),
          text: `Hamkor Kassa sotuvi: ${rp.stallName} — ${formatNumber(rp.price * qty)} so'm`,
          type: "success",
        },
        ...prev,
      ]);
    }, 15000);
    return () => clearInterval(interval);
  }, [isOnline, products]);

  // ── Cart actions ─────────────────────────────────────────────

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      if (ex) {
        if (ex.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const next = item.quantity + delta;
          if (next <= 0) return null;
          if (next > item.product.stock) return item;
          return { ...item, quantity: next };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleCheckout = () => {
    if (!cart.length) return;
    const employee = employees.find((e) => e.id === activeSellerId) || employees[0];
    const stall = STALLS.find((s) => s.id === selectedStallId) || STALLS[0];
    const time = getSystemTime();
    const amount = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

    const newTxn: Transaction = {
      id: `txn_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 5)}`,
      amount,
      paymentMethod,
      employeeId: employee.id,
      employeeName: employee.name,
      stallId: stall.id,
      stallName: stall.name,
      items: cart.map((i) => ({
        productName: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      createdAt: time,
      syncStatus: isOnline ? "SYNCED" : "PENDING",
    };

    // Decrement stock
    setProducts((prev) =>
      prev.map((p) => {
        const ci = cart.find((c) => c.product.id === p.id);
        return ci ? { ...p, stock: p.stock - ci.quantity } : p;
      })
    );

    setTransactions((prev) => [newTxn, ...prev]);

    if (isOnline) {
      setWsEvents((prev) => [
        {
          id: getUniqueId("ws"),
          time,
          text: `Yangi sotuv saqlandi: ${employee.name} (${stall.name}) — ${formatNumber(amount)} so'm`,
          type: "success",
        },
        ...prev,
      ]);
    } else {
      setSyncQueue((prev) => [...prev, newTxn]);
      setWsEvents((prev) => [
        {
          id: getUniqueId("ws"),
          time,
          text: `[OFFLINE] Tranzaksiya IndexedDB navbatiga kiritildi: ${formatNumber(amount)} so'm`,
          type: "warning",
        },
        ...prev,
      ]);
    }

    setCart([]);
  };

  // ── Offline sync runner ──────────────────────────────────────

  const runOfflineSync = async () => {
    if (!syncQueue.length || isSyncing) return;
    setIsSyncing(true);
    setSyncLogs([]);

    const log = (text: string) => setSyncLogs((prev) => [...prev, text]);

    log("🔍 Sinxronizatsiya boshlandi...");
    await delay(800);
    log(`📁 Tarmoqsiz rejimda saqlangan ${syncQueue.length} ta tranzaksiya aniqlandi.`);
    await delay(1000);
    log("📡 Server xavfsiz kanali tekshirilmoqda: status=200 OK");
    await delay(600);

    for (let i = 0; i < syncQueue.length; i++) {
      await delay(600);
      log(
        `📝 Navbatdagi tranzaksiya yuborildi [${i + 1}/${syncQueue.length}] ID: ${syncQueue[i].id} — ${formatNumber(syncQueue[i].amount)} so'm`
      );
    }

    await delay(800);
    log("📊 PostgreSQL Tranzaksion jadvallari yangilandi.");
    await delay(600);
    log("📦 Zaxira miqdorlari sinxronlashtirildi.");
    await delay(500);
    log("🎉 Sinxronizatsiya muvaffaqiyatli yakunlandi!");

    setTransactions((prev) =>
      prev.map((t) => (t.syncStatus === "PENDING" ? { ...t, syncStatus: "SYNCED" } : t))
    );

    const time = getSystemTime();
    setWsEvents((prev) => [
      {
        id: getUniqueId("ws"),
        time,
        text: `[SYNC] ${syncQueue.length} ta tranzaksiya IndexedDB'dan PostgreSQL-ga muvaffaqiyatli yuklandi`,
        type: "success",
      },
      ...prev,
    ]);

    setSyncQueue([]);
    setIsSyncing(false);
  };

  // ── HR actions ───────────────────────────────────────────────

  const handleEmployeeCheckToggle = (empId: string) => {
    const time = getSystemTimeShort();
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id !== empId) return e;
        const next = !e.isCheckedIn;
        const roleLabel =
          e.role === "MANAGER" ? "Menejer" : e.role === "SELLER" ? "Sotuvchi" : "Nazoratchi";
        setAttendanceLogs((logs) => [
          {
            id: getUniqueId("att"),
            employeeName: e.name,
            role: roleLabel,
            type: next ? "KIRISH" : "CHIQISH",
            time,
          },
          ...logs,
        ]);
        setWsEvents((ws) => [
          {
            id: getUniqueId("ws"),
            time: `${time}:00`,
            text: `Xodim ${e.name} ${next ? "ishni boshladi (Check-in)" : "ishni tugatdi (Check-out)"}`,
            type: next ? "info" : "warning",
          },
          ...ws,
        ]);
        return {
          ...e,
          isCheckedIn: next,
          lastCheckIn: next ? time : e.lastCheckIn,
          lastCheckOut: !next ? time : e.lastCheckOut,
        };
      })
    );
  };

  // ── Auth modal ───────────────────────────────────────────────

  const openAuthModal = (empId: string, action: PendingActionType) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    setPendingSellerId(empId);
    setPendingActionType(action);
    setAuthUsername(emp.username || "");
    setAuthPassword("");
    setAuthError("");
  };

  const closeAuthModal = () => {
    setPendingSellerId(null);
    setAuthUsername("");
    setAuthPassword("");
    setAuthError("");
  };

  const handleAuthSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!pendingSellerId) return;

    const emp = employees.find((e) => e.id === pendingSellerId);
    if (!emp) { setAuthError("Xodim topilmadi."); return; }

    if (
      authUsername.trim().toLowerCase() !== emp.username.toLowerCase() ||
      authPassword !== emp.password
    ) {
      setAuthError("Yaroqsiz login va/yoki parol!");
      return;
    }

    if (pendingActionType === "switch_seller") {
      setActiveSellerId(pendingSellerId);
      const time = getSystemTime();
      setWsEvents((ws) => [
        {
          id: getUniqueId("ws"),
          time,
          text: `🔑 Avtorizatsiya: ${emp.name} POS tushum kassa tizimiga kirdi.`,
          type: "success",
        },
        ...ws,
      ]);
    } else {
      handleEmployeeCheckToggle(pendingSellerId);
    }

    closeAuthModal();
  };

  // ── Payroll calculator ───────────────────────────────────────

  const calculatePayroll = (emp: Employee): PayrollResult => {
    const dailyBase = Math.round(emp.baseSalary / 30);
    const salesVolume = transactions
      .filter((t) => t.employeeId === emp.id)
      .reduce((s, t) => s + t.amount, 0);
    const bonusAmount = Math.round((salesVolume * emp.bonusPercentage) / 100);
    return { dailyBase, salesVolume, bonusAmount, totalWage: dailyBase + bonusAmount };
  };

  // ── AI advisor ───────────────────────────────────────────────

  const getAiDashboardAdvice = async () => {
    setIsGeneratingAi(true);
    setAiReport("");
    try {
      const lowStockAlerts = products
        .filter((p) => p.stock <= p.minStockAlert)
        .map((p) => ({ stall: p.stallName, product: p.name, stock: p.stock, min: p.minStockAlert }));

      const stallSales = STALLS.map((st) => ({
        name: st.name,
        salesTotal: transactions
          .filter((t) => t.stallId === st.id)
          .reduce((s, t) => s + t.amount, 0),
      }));

      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salesData: {
            stalls: stallSales,
            totalSalesToday: transactions.reduce((s, t) => s + t.amount, 0),
          },
          lowStockData: lowStockAlerts,
          attendanceData: {
            activeSellers: employees.filter((e) => e.isCheckedIn).length,
            totalCount: employees.length,
          },
        }),
      });

      const data = await res.json();
      setAiReport(data.text ?? `Xatolik: ${data.error}`);
    } catch {
      setAiReport("Server xatoligi: Gemini API javob bermaydi.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // ── Clipboard ────────────────────────────────────────────────

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // ── Return ───────────────────────────────────────────────────
  return {
    // data
    stalls: STALLS,
    employees,
    products,
    transactions,
    attendanceLogs,
    wsEvents,
    syncQueue,
    isSyncing,
    syncLogs,
    // tab nav
    activeTab, setActiveTab,
    blueprintSubTab, setBlueprintSubTab,
    copiedText,
    // network
    isOnline, setIsOnline,
    // pos
    selectedStallId, setSelectedStallId,
    activeSellerId,
    cart,
    paymentMethod, setPaymentMethod,
    // auth
    pendingSellerId,
    pendingActionType,
    authUsername, setAuthUsername,
    authPassword, setAuthPassword,
    authError,
    openAuthModal,
    closeAuthModal,
    handleAuthSubmit,
    // actions
    handleAddToCart,
    handleUpdateCartQty,
    handleCheckout,
    runOfflineSync,
    calculatePayroll,
    getAiDashboardAdvice,
    copyToClipboard,
    // ai
    aiReport,
    isGeneratingAi,
    // stats
    totalParkRevenue,
    totalProductsSold,
    criticalStockCount,
  };
}

// ── Helper ────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
