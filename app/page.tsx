"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Calculator, 
  FileCode2, 
  Activity, 
  HelpCircle, 
  Copy, 
  Sparkles, 
  Check,
  Lock,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types matching relational schemas
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStockAlert: number;
  stallId: string;
  stallName: string;
}

interface Employee {
  id: string;
  name: string;
  role: "ADMIN" | "SELLER" | "ATTENDANT" | "MANAGER";
  baseSalary: number; // monthly UZS
  bonusPercentage: number; // % commission on items sold
  isCheckedIn: boolean;
  username: string;
  password: string;
  lastCheckIn?: string;
  lastCheckOut?: string;
}

interface Stall {
  id: string;
  name: string;
  type: "STALL" | "ATTRACTION" | "CAFE" | "SERVICE";
}

interface Transaction {
  id: string;
  amount: number;
  paymentMethod: "CASH" | "CARD" | "MOBILE";
  employeeId: string;
  employeeName: string;
  stallId: string;
  stallName: string;
  items: { productName: string; quantity: number; price: number }[];
  createdAt: string;
  syncStatus: "SYNCED" | "PENDING";
}

interface AttendanceLog {
  id: string;
  employeeName: string;
  role: string;
  type: "KIRISH" | "CHIQISH";
  time: string;
}

// Custom helpers to prevent client/server locale hydration mismatches and duplicate key collisions
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const getUniqueId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export default function ParkCentralApp() {
  // --- STATE SYSTEM ---
  const [activeTab, setActiveTab] = useState<"pos" | "dashboard" | "hr" | "blueprint">("pos");
  const [blueprintSubTab, setBlueprintSubTab] = useState<"prisma" | "api" | "sync">("prisma");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Internet connectivity state Simulation
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  // Simulated DB State
  const stalls: Stall[] = [
    { id: "stall_1", name: "Markaziy Fast-Food Restorani", type: "CAFE" },
    { id: "stall_2", name: "Muzqaymoq va Shakar-paxta", type: "STALL" },
    { id: "stall_3", name: "Sirk va Ko'ngilochar Attraksion", type: "ATTRACTION" },
    { id: "stall_4", name: "Suvenirlar va O'yinchoqlar Markazi", type: "STALL" }
  ];

  const [employees, setEmployees] = useState<Employee[]>([
    { id: "emp_1", name: "Dilshod Abdirazzokov", role: "MANAGER", baseSalary: 6500000, bonusPercentage: 2, isCheckedIn: true, lastCheckIn: "08:30", username: "dilshod", password: "111" },
    { id: "emp_2", name: "Shahzod Alimov", role: "SELLER", baseSalary: 3500000, bonusPercentage: 5, isCheckedIn: true, lastCheckIn: "08:45", username: "shahzod", password: "222" },
    { id: "emp_3", name: "Laylo Karimova", role: "SELLER", baseSalary: 3200000, bonusPercentage: 7, isCheckedIn: false, username: "laylo", password: "333" },
    { id: "emp_4", name: "Jamshid Tojiyev", role: "ATTENDANT", baseSalary: 4000000, bonusPercentage: 4, isCheckedIn: true, lastCheckIn: "08:50", username: "jamshid", password: "444" }
  ]);

  const [products, setProducts] = useState<Product[]>([
    { id: "prod_1", name: "Sirlangan Burger Klasik", price: 32000, stock: 45, minStockAlert: 10, stallId: "stall_1", stallName: "Markaziy Fast-Food Restorani" },
    { id: "prod_2", name: "Shaurma Mol go'shtli", price: 38000, stock: 28, minStockAlert: 8, stallId: "stall_1", stallName: "Markaziy Fast-Food Restorani" },
    { id: "prod_3", name: "Coca-Cola 0.5L", price: 10000, stock: 9, minStockAlert: 15, stallId: "stall_1", stallName: "Markaziy Fast-Food Restorani" },
    { id: "prod_4", name: "Muzqaymoq Gilosli", price: 14000, stock: 3, minStockAlert: 5, stallId: "stall_2", stallName: "Muzqaymoq va Shakar-paxta" },
    { id: "prod_5", name: "Shakar-paxta (Katta vanna)", price: 12000, stock: 22, minStockAlert: 6, stallId: "stall_2", stallName: "Muzqaymoq va Shakar-paxta" },
    { id: "prod_6", name: "Katta Tsirk Chiptasi", price: 50000, stock: 120, minStockAlert: 20, stallId: "stall_3", stallName: "Sirk va Ko'ngilochar Attraksion" },
    { id: "prod_7", name: "Esdalik Bog' Flagi", price: 25000, stock: 12, minStockAlert: 5, stallId: "stall_4", stallName: "Suvenirlar va O'yinchoqlar Markazi" }
  ]);

  // Sales records
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "txn_001",
      amount: 142000,
      paymentMethod: "CARD",
      employeeId: "emp_2",
      employeeName: "Shahzod Alimov",
      stallId: "stall_1",
      stallName: "Markaziy Fast-Food Restorani",
      items: [
        { productName: "Sirlangan Burger Klasik", quantity: 3, price: 32000 },
        { productName: "Coca-Cola 0.5L", quantity: 2, price: 10000 },
        { productName: "Shaurma Mol go'shtli", quantity: 1, price: 38000 }
      ],
      createdAt: "10:14:12",
      syncStatus: "SYNCED"
    },
    {
      id: "txn_002",
      amount: 40000,
      paymentMethod: "MOBILE",
      employeeId: "emp_3",
      employeeName: "Laylo Karimova",
      stallId: "stall_2",
      stallName: "Muzqaymoq va Shakar-paxta",
      items: [
        { productName: "Shakar-paxta (Katta vanna)", quantity: 2, price: 12000 },
        { productName: "Muzqaymoq Gilosli", quantity: 1, price: 14000 }
      ],
      createdAt: "10:05:43",
      syncStatus: "SYNCED"
    },
    {
      id: "txn_003",
      amount: 150000,
      paymentMethod: "CASH",
      employeeId: "emp_4",
      employeeName: "Jamshid Tojiyev",
      stallId: "stall_3",
      stallName: "Sirk va Ko'ngilochar Attraksion",
      items: [
        { productName: "Katta Tsirk Chiptasi", quantity: 3, price: 50000 }
      ],
      createdAt: "09:48:21",
      syncStatus: "SYNCED"
    }
  ]);

  // Client-side IndexedDB Sync Queue simulated in state / localStorage
  const [syncQueue, setSyncQueue] = useState<Transaction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  
  // Attendance and Payroll logs
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([
    { id: "att_1", employeeName: "Dilshod Abdirazzokov", role: "Menejer", type: "KIRISH", time: "08:30" },
    { id: "att_2", employeeName: "Shahzod Alimov", role: "Sotuvchi", type: "KIRISH", time: "08:45" },
    { id: "att_3", employeeName: "Jamshid Tojiyev", role: "Nazoratchi", type: "KIRISH", time: "08:50" }
  ]);

  // Live WebSocket activity stream simulation
  const [wsEvents, setWsEvents] = useState<{ id: string; time: string; text: string; type: "info" | "warning" | "success" }[]>([
    { id: "ws_1", time: "10:14:12", text: "Kassa sotuvi: Shahzod Alimov (Fast-Food) - 142 000 so'm", type: "success" },
    { id: "ws_2", time: "10:11:05", text: "[DIQQAT] Muzqaymoq Gilosli zaxirasi kam (3 dona kutilmoqda!)", type: "warning" },
    { id: "ws_3", time: "08:50:00", text: "Xodim Jamshid Tojiyev Sirk rastasida ish boshladi (Check-in)", type: "info" }
  ]);

  // --- POS STALL SELECTION & CART STATE ---
  const [selectedStallId, setSelectedStallId] = useState<string>("stall_1");
  const [activeSellerId, setActiveSellerId] = useState<string>("emp_2");
  
  // Custom auth & credentials modal state
  const [pendingSellerId, setPendingSellerId] = useState<string | null>(null);
  const [pendingActionType, setPendingActionType] = useState<"switch_seller" | "check_toggle">("switch_seller");
  const [authUsername, setAuthUsername] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "MOBILE">("CASH");

  // AI Advisor Smart response state
  const [aiReport, setAiReport] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // --- REAL-TIME STOCKS & LOW STOCK DETECTOR ---
  useEffect(() => {
    // Check if any product has gone below critical stock
    const lowStockItems = products.filter(p => p.stock <= p.minStockAlert);
    if (lowStockItems.length > 0) {
      // Simulate periodic push notification of stock alert
      const timer = setTimeout(() => {
        const item = lowStockItems[Math.floor(Math.random() * lowStockItems.length)];
        const systemTime = new Date().toLocaleTimeString("uz-UZ", { hour12: false });
        
        // Evade duplicate pushes in the WS stream log
        setWsEvents(prev => {
          const exists = prev.some(e => e.text.includes(item.name) && e.text.includes("kam"));
          if (exists) return prev;
          return [
            {
              id: getUniqueId("ws"),
              time: systemTime,
              text: `[ZAXIRA] ${item.name} zaxirasi o'ta kam: ${item.stock} dona qoldi (${item.stallName})`,
              type: "warning"
            },
            ...prev
          ];
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [products]);

  // Trigger simulated stream updates to mimic an active amusement park
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly simulate an external offline seller processing or other updates
      const eventChance = Math.random();
      const systemTime = new Date().toLocaleTimeString("uz-UZ", { hour12: false });
      
      if (isOnline && eventChance > 0.7) {
        // Online sale event simulation from other stalls
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        const totalAmount = randomProduct.price * qty;
        
        setWsEvents(prev => [
          {
            id: getUniqueId("ws"),
            time: systemTime,
            text: `Hamkor Kassa sotuvi: ${randomProduct.stallName} - ${formatNumber(totalAmount)} so'm`,
            type: "success"
          },
          ...prev
        ]);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isOnline, products]);

  // --- CART CONTROLS ---
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // check stock limits
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, val: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const targetQty = item.quantity + val;
        const maxStock = item.product.stock;
        if (targetQty <= 0) return null;
        if (targetQty > maxStock) return item;
        return { ...item, quantity: targetQty };
      }
      return item;
    }).filter(Boolean) as any);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const employee = employees.find(e => e.id === activeSellerId) || employees[0];
    const stall = stalls.find(s => s.id === selectedStallId) || stalls[0];
    const systemTime = new Date().toLocaleTimeString("uz-UZ", { hour12: false });
    const amount = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

    const transactionItems = cart.map(item => ({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));

    const newTxn: Transaction = {
      id: `txn_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 5)}`,
      amount,
      paymentMethod,
      employeeId: employee.id,
      employeeName: employee.name,
      stallId: stall.id,
      stallName: stall.name,
      items: transactionItems,
      createdAt: systemTime,
      syncStatus: isOnline ? "SYNCED" : "PENDING"
    };

    // Decrement stock in our simulated master state
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(c => c.product.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    }));

    if (isOnline) {
      // Direct Server Sync
      setTransactions(prev => [newTxn, ...prev]);
      setWsEvents(prev => [
        {
          id: getUniqueId("ws"),
          time: systemTime,
          text: `Yangi sotuv saqlandi: ${employee.name} (${stall.name}) - ${formatNumber(amount)} so'm`,
          type: "success"
        },
        ...prev
      ]);
    } else {
      // Local Database (IndexedDB Simulation Queue)
      setSyncQueue(prev => [...prev, newTxn]);
      // Also register draft locally to show responsiveness offline
      setTransactions(prev => [newTxn, ...prev]);
      setWsEvents(prev => [
        {
          id: getUniqueId("ws"),
          time: systemTime,
          text: `[OFFLINE] Tranzaksiya IndexedDB navbatiga kiritildi: ${formatNumber(amount)} so'm`,
          type: "warning"
        },
        ...prev
      ]);
    }

    // Clear cart
    setCart([]);
  };

  // --- MANUAL OFFLINE TO ONLINE SYNCHRONIZATION RUNNER ---
  const runOfflineSync = async () => {
    if (syncQueue.length === 0 || isSyncing) return;
    setIsSyncing(true);
    setSyncLogs([]);

    const log = (text: string) => {
      setSyncLogs(prev => [...prev, text]);
    };

    log("🔍 Sinxronizatsiya boshlandi...");
    await new Promise(r => setTimeout(r, 800));
    log(`📁 Tarmoqsiz rejimda saqlangan ${syncQueue.length} ta tranzaksiya aniqlandi.`);
    await new Promise(r => setTimeout(r, 1000));
    log("📡 Server xavfsiz kanali tekshirilmoqda: status=200 OK");
    await new Promise(r => setTimeout(r, 600));

    // Sync items step by step
    for (let i = 0; i < syncQueue.length; i++) {
       const item = syncQueue[i];
       await new Promise(r => setTimeout(r, 600));
       log(`📝 Navbatdagi tranzaksiya yuborildi [${i + 1}/${syncQueue.length}] ID: ${item.id} - ${formatNumber(item.amount)} so'm`);
    }

    await new Promise(r => setTimeout(r, 800));
    log("📊 PostgreSQL Tranzaksion jadvallari yangilandi.");
    await new Promise(r => setTimeout(r, 600));
    log("📦 Zaxira miqdorlari (Inventory tracking) sinxronlashtirildi.");
    await new Promise(r => setTimeout(r, 500));
    log("🎉 Sinxronizatsiya muvaffaqiyatli yakunlandi!");

    // Set everything synchronized in transactions state
    setTransactions(prev => prev.map(txn => {
      if (txn.syncStatus === "PENDING") {
        return { ...txn, syncStatus: "SYNCED" };
      }
      return txn;
    }));

    const systemTime = new Date().toLocaleTimeString("uz-UZ", { hour12: false });
    setWsEvents(prev => [
      {
        id: getUniqueId("ws"),
        time: systemTime,
        text: `[SYNC] ${syncQueue.length} ta tranzaksiya IndexedDB'dan PostgreSQL-ga muvaffaqiyatli yuklandi`,
        type: "success"
      },
      ...prev
    ]);

    setSyncQueue([]);
    setIsSyncing(false);
  };

  // --- HR / EMPLOYEE CONTROLS (CHECK-IN / OUT) ---
  const handleEmployeeCheckToggle = (empId: string) => {
    const systemTime = new Date().toLocaleTimeString("uz-UZ", { hour12: false, hour: '2-digit', minute: '2-digit' });
    setEmployees(prev => prev.map(e => {
      if (e.id === empId) {
        const nextState = !e.isCheckedIn;
        const newLog: AttendanceLog = {
          id: getUniqueId("att"),
          employeeName: e.name,
          role: e.role === "MANAGER" ? "Menejer" : e.role === "SELLER" ? "Sotuvchi" : "Nazoratchi",
          type: nextState ? "KIRISH" : "CHIQISH",
          time: systemTime
        };
        setAttendanceLogs(l => [newLog, ...l]);
        
        setWsEvents(ws => [
          {
            id: getUniqueId("ws"),
            time: `${systemTime}:00`,
            text: `Xodim ${e.name} ${nextState ? "ishni boshladi (Check-in)" : "ishni tugatdi (Check-out)"}`,
            type: nextState ? "info" : "warning"
          },
          ...ws
        ]);

        return {
          ...e,
          isCheckedIn: nextState,
          lastCheckIn: nextState ? systemTime : e.lastCheckIn,
          lastCheckOut: !nextState ? systemTime : e.lastCheckOut
        };
      }
      return e;
    }));
  };

  // --- SUBMIT CREDENTIALS FOR VERIFICATION ---
  const handleAuthSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pendingSellerId) return;

    const targetEmp = employees.find(emp => emp.id === pendingSellerId);
    if (!targetEmp) {
      setAuthError("Xodim topilmadi.");
      return;
    }

    const trimmedUser = authUsername.trim().toLowerCase();
    const correctUser = (targetEmp.username || "").toLowerCase();
    
    if (trimmedUser !== correctUser || authPassword !== targetEmp.password) {
      setAuthError("Yaroqsiz login va/yoki parol!");
      return;
    }

    // Success!
    if (pendingActionType === "switch_seller") {
      setActiveSellerId(pendingSellerId);
      const systemTime = new Date().toLocaleTimeString("uz-UZ", { hour12: false });
      setWsEvents(ws => [
        {
          id: getUniqueId("ws"),
          time: systemTime,
          text: `🔑 Avtorizatsiya: ${targetEmp.name} POS tushum kassa tizimiga kirdi.`,
          type: "success"
        },
        ...ws
      ]);
    } else if (pendingActionType === "check_toggle") {
      handleEmployeeCheckToggle(pendingSellerId);
    }

    // Clear state
    setPendingSellerId(null);
    setAuthUsername("");
    setAuthPassword("");
    setAuthError("");
  };

  // --- CALC PAYROLL FUNCTION ---
  // Calculates live commission and pay based on transactions done by specific employee
  const calculatePayroll = (emp: Employee) => {
    // Basic day salary: daily split 30 days
    const dailyBase = Math.round(emp.baseSalary / 30);
    
    // Find all synced transactions for this employee during today
    const employeeSales = transactions
      .filter(t => t.employeeId === emp.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const bonusAmount = Math.round((employeeSales * emp.bonusPercentage) / 100);
    const totalWage = dailyBase + bonusAmount;

    return {
      dailyBase,
      salesVolume: employeeSales,
      bonusAmount,
      totalWage
    };
  };

  // --- AI PARK ADVISOR STRATEGY GENERATION ---
  const getAiDashboardAdvice = async () => {
    setIsGeneratingAi(true);
    setAiReport("");
    try {
      // Filter critical resources
      const lowStockAlerts = products.filter(p => p.stock <= p.minStockAlert).map(p => ({
        stall: p.stallName,
        product: p.name,
        stock: p.stock,
        min: p.minStockAlert
      }));

      // Map sale volumes per stall
      const stallSales = stalls.map(st => {
        const salesAmount = transactions
          .filter(t => t.stallId === st.id)
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          name: st.name,
          salesTotal: salesAmount
        };
      });

      // Attendance overview
      const activeEmployeesCount = employees.filter(e => e.isCheckedIn).length;

      const response = await fetch("/app/api/gemini/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          salesData: {
            stalls: stallSales,
            totalSalesToday: transactions.reduce((sum, t) => sum + t.amount, 0)
          },
          lowStockData: lowStockAlerts,
          attendanceData: {
            activeSellers: activeEmployeesCount,
            totalCount: employees.length
          }
        })
      });

      const data = await response.json();
      if (data.text) {
        setAiReport(data.text);
      } else if (data.error) {
        setAiReport(`Xatolik: ${data.error}`);
      }
    } catch (err: any) {
      setAiReport("Server xatoligi: Gemini API javob bermaydi.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Help copy text function
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // --- STATS COMPILER FOR GRAPHS ---
  const totalParkRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalProductsSold = transactions.reduce((sum, t) => sum + t.items.reduce((acc, item) => acc + item.quantity, 0),0);
  const criticalStockItemsCount = products.filter(p => p.stock <= p.minStockAlert).length;

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#2D3A2D] font-sans selection:bg-[#A3B18A] selection:text-[#2D452E] transition-colors duration-300 pb-12">
      
      {/* HEADER RAIL */}
      <header className="border-b border-[#DAD7CD] bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2D452E] text-white rounded-xl shadow-md">
              <Database className="h-6 w-6 text-[#E9EDC9]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#2D452E] flex items-center gap-2">
                Park Central <span className="text-xs px-2.5 py-0.5 bg-[#A3B18A]/20 text-[#2D452E] rounded-full font-mono border border-[#DAD7CD]">V3.0 Production</span>
              </h1>
              <p className="text-xs text-[#588157]">Dam olish maskani yagona boshqaruv va moliya raqamli ekotizimi</p>
            </div>
          </div>

          {/* NETWORKING STATUS SWITCHER */}
          <div className="flex items-center gap-4 bg-[#F2F4EF] py-1.5 px-3 rounded-full border border-[#DAD7CD]">
            <span className="text-xs font-semibold text-[#588157]">Kassa Rejimi:</span>
            
            <button 
              id="btn-online-toggle"
              onClick={() => setIsOnline(true)}
              className={`flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full font-bold transition-all ${
                isOnline 
                  ? "bg-[#2D452E] text-white shadow" 
                  : "text-[#588157] hover:text-[#2D452E]"
              }`}
            >
              <Wifi className="h-3 w-3" /> Online
            </button>
            
            <button 
              id="btn-offline-toggle"
              onClick={() => setIsOnline(false)}
              className={`flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full font-bold transition-all ${
                !isOnline 
                  ? "bg-amber-100 text-amber-800 border border-amber-200 shadow" 
                  : "text-[#588157] hover:text-[#2D452E]"
              }`}
            >
              <WifiOff className="h-3 w-3" /> Offline (IndexedDB)
            </button>
          </div>

        </div>
      </header>

      {/* CORE FRAME GRID */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* TAB CONTROLLERS */}
        <div id="navigation-tabs" className="flex flex-wrap items-center justify-start gap-2 mb-8 border-b border-[#DAD7CD] pb-4">
          <button
            id="tab-btn-pos"
            onClick={() => setActiveTab("pos")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "pos" 
                ? "bg-[#2D452E] text-white shadow" 
                : "text-[#588157] hover:text-[#2D452E] hover:bg-[#A3B18A]/10"
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> POS Kassa Moduli
          </button>
          
          <button
            id="tab-btn-analytics"
            onClick={() => {
              setActiveTab("dashboard");
              if (!aiReport) getAiDashboardAdvice();
            }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "dashboard" 
                ? "bg-[#2D452E] text-white shadow" 
                : "text-[#588157] hover:text-[#2D452E] hover:bg-[#A3B18A]/10"
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Analitika & Dashboard
          </button>

          <button
            id="tab-btn-hr"
            onClick={() => setActiveTab("hr")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "hr" 
                ? "bg-[#2D452E] text-white shadow" 
                : "text-[#588157] hover:text-[#2D452E] hover:bg-[#A3B18A]/10"
            }`}
          >
            <Users className="h-4 w-4" /> HR & Payroll (Oylik)
          </button>

          <button
            id="tab-btn-blueprint"
            onClick={() => setActiveTab("blueprint")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 md:ml-auto ${
              activeTab === "blueprint" 
                ? "bg-gradient-to-r from-emerald-800 to-emerald-950 text-[#E9EDC9] shadow" 
                : "text-[#588157] hover:text-[#2D452E] hover:bg-[#A3B18A]/10"
            }`}
          >
            <FileCode2 className="h-4 w-4" /> Arxitekturaviy Blueprint
          </button>
        </div>

        {/* ACTIVE MODULE VIEWPORTS */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: POS KASSA INTERFEYSI */}
          {activeTab === "pos" && (
            <motion.div 
              key="pos" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* POS CONTROLS - PRODUCT SELECTOR & STALL SELECTOR (COL-8) */}
              <div id="pos-product-section" className="lg:col-span-8 space-y-6">
                
                {/* STALL SELECT PANEL */}
                <div className="bg-white p-6 rounded-[2rem] border border-[#DAD7CD] shadow-sm">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#588157] block mb-3">Sotuv Nuqtasi (Rasta / Attraksion)</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stalls.map(s => (
                      <button
                        key={s.id}
                        id={`stall-tab-${s.id}`}
                        onClick={() => {
                          setSelectedStallId(s.id);
                          setCart([]); // Reset cart when changing stalls
                        }}
                        className={`p-4 rounded-2xl text-xs font-semibold text-left transition-all border ${
                          selectedStallId === s.id 
                            ? "bg-[#2D452E]/10 border-[#2D452E] text-[#2D452E] font-bold shadow-sm" 
                            : "bg-[#F2F4EF]/50 border-[#DAD7CD] text-[#588157] hover:border-[#588157] hover:bg-[#F2F4EF]"
                        }`}
                      >
                        <span className="text-[10px] text-[#A3B18A] block font-medium">
                          {s.type === "CAFE" ? "🍟 Taomlanish" : s.type === "ATTRACTION" ? "🎢 Attraksion" : "🎪 Rasta"}
                        </span>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ACTIVE SELLER AND STATUS */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#F2F4EF] p-5 rounded-[2rem] border border-[#DAD7CD]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#A3B18A] flex items-center justify-center text-[#2D452E] font-bold">
                      S
                    </div>
                    <div>
                      <span className="text-[10px] text-[#588157] block uppercase tracking-wider font-bold">Navbatchi Sotuvchi:</span>
                      <select 
                        id="seller-select"
                        value={activeSellerId} 
                        onChange={(e) => {
                          const nextId = e.target.value;
                          const targetEmp = employees.find(emp => emp.id === nextId);
                          if (targetEmp) {
                            setPendingSellerId(nextId);
                            setPendingActionType("switch_seller");
                            setAuthUsername(targetEmp.username || "");
                            setAuthPassword("");
                            setAuthError("");
                          }
                        }}
                        className="bg-transparent text-sm font-bold text-[#2D452E] focus:outline-none border-b border-transparent focus:border-[#3A5A40] pr-4 cursor-pointer"
                      >
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id} className="bg-white text-[#2D3A2D]">
                            {emp.name} ({emp.role === "MANAGER" ? "Menejer" : "Sotuvchi"}) {!emp.isCheckedIn && "[Check-out qilingan!]"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium px-4 py-1.5 bg-emerald-100 rounded-full border border-emerald-200 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                        PostgreSQL bilan faol ulangan
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium px-4 py-1.5 bg-amber-100 rounded-full border border-amber-200 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse"></span>
                        Offline rejimda (Navbat: {syncQueue.length} tranzaksiya)
                      </div>
                    )}
                  </div>
                </div>

                {/* DYNAMIC PRODUCTS MATRIX */}
                <div>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">Sotiladigan Tovar va Chiptalar</h3>
                    <span className="text-xs text-[#588157] font-semibold">Tanlangan nuqta mahsulotlari</span>
                  </div>
                  
                  <div id="product-grid" className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {products
                      .filter(p => p.stallId === selectedStallId)
                      .map(p => {
                        const isLowStock = p.stock <= p.minStockAlert;
                        return (
                          <div 
                            key={p.id}
                            id={`product-card-${p.id}`}
                            className={`p-6 rounded-[2rem] relative overflow-hidden flex flex-col justify-between h-48 transition-all border ${
                              isLowStock 
                                ? "bg-white border-amber-400 shadow-sm" 
                                : "bg-white border-[#DAD7CD] hover:border-[#588157] shadow-sm hover:shadow"
                            }`}
                          >
                            {/* Low stock badge */}
                            {isLowStock && (
                              <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[10px] px-2.5 py-1 rounded-full font-bold border border-amber-200 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Kam qoldi
                              </div>
                            )}

                            <div>
                              <span className="text-[10px] text-[#A3B18A] font-bold font-mono uppercase tracking-wider">ID: {p.id}</span>
                              <h4 className="text-base font-bold text-[#2D452E] mt-1.5 leading-snug">{p.name}</h4>
                            </div>

                            <div className="flex items-end justify-between mt-3">
                              <div>
                                <span className="text-[10px] text-[#588157] block font-bold">Narx:</span>
                                <span className="text-lg font-black text-[#3A5A40]">{formatNumber(p.price)} {"so'm"}</span>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-[#588157] block font-bold">{"Ombor qoldig'i:"}</span>
                                <span className={`text-xs ml-auto font-mono font-bold ${isLowStock ? "text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200" : "text-[#2D3A2D] bg-[#F2F4EF] px-2 py-0.5 rounded-full border border-[#DAD7CD]"}`}>
                                  {p.stock} dona
                                </span>
                              </div>
                            </div>

                            <button
                              id={`add-btn-${p.id}`}
                              onClick={() => handleAddToCart(p)}
                              disabled={p.stock <= 0}
                              className={`w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                p.stock <= 0
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                  : "bg-[#2D452E] hover:bg-[#3A5A40] text-white shadow"
                              }`}
                            >
                              <Plus className="h-4 w-4" /> {"Savatga qo'shish"}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* OFFLINE CLIENT RECOVERY SIMULATOR CARD */}
                {!isOnline && syncQueue.length > 0 && (
                  <div className="bg-amber-50 border border-amber-300 rounded-[2rem] p-6 relative overflow-hidden shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="p-3.5 bg-amber-100 text-amber-800 rounded-2xl border border-amber-200">
                        <WifiOff className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-amber-900">IndexedDB Tarmoqsiz Zaxira Sinxronizatsiyasi</h4>
                        <p className="text-xs text-amber-800 leading-relaxed max-w-xl">
                          Siz offline rejimda sotuvlarni davom ettirdingiz. Tranzaksiyalar moliya xavfsizligi nuqtai nazaridan kompyuteringizning lokal 
                          <strong className="text-amber-900"> {"IndexedDB (State Cache) navbatida saqlanmoqda"}</strong>. Internet tiklanganda, ushbu paketlarni osongina server bazasiga yuborishingiz mumkin.
                        </p>
                        
                        <div className="pt-4 flex flex-wrap items-center gap-3">
                          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100/50 px-2.5 py-1 rounded-full border border-amber-200 font-mono">Navbatda: {syncQueue.length} ta yuborilmagan tranzaksiya</span>
                          <button 
                            id="btn-sync-now"
                            onClick={() => {
                              setIsOnline(true);
                              setTimeout(() => {
                                runOfflineSync();
                              }, 100);
                            }}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                          >
                            {"Simulyatsiyani Online-ga o'tkazish & Sinxronlash"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* POS SIDEBAR - CART & CHECKOUT (COL-4) */}
              <div id="pos-cart-section" className="lg:col-span-4 space-y-6">
                
                <div className="bg-white p-6 rounded-[2rem] border border-[#DAD7CD] shadow-sm flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#F2F4EF] pb-4 mb-4">
                      <h3 className="text-xs uppercase tracking-wider font-bold text-[#2D452E] flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-[#3A5A40]" /> POS Kassa Savati
                      </h3>
                      <span className="bg-[#A3B18A]/20 text-[#2D452E] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#DAD7CD]">
                        {cart.reduce((sum, i) => sum + i.quantity, 0)} element
                      </span>
                    </div>

                    {cart.length === 0 ? (
                      <div className="text-center py-16 text-[#588157] space-y-3">
                        <ShoppingCart className="h-10 w-10 mx-auto text-[#A3B18A] stroke-[1.5]" />
                        <p className="text-xs">{"Savat bo'sh. Chap tomondan mahsulot tanlang."}</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                        {cart.map(item => (
                          <div 
                            key={item.product.id}
                            className="bg-[#F2F4EF]/50 p-3 rounded-2xl flex items-center justify-between gap-2 border border-[#DAD7CD]"
                          >
                            <div>
                              <h4 className="text-xs font-bold text-[#2D3A2D] line-clamp-1">{item.product.name}</h4>
                              <p className="text-[10px] text-[#588157] mt-0.5 font-bold">{formatNumber(item.product.price)} {"so'm"} x {item.quantity}</p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateCartQty(item.product.id, -1)}
                                className="h-6 w-6 bg-[#DAD7CD]/50 hover:bg-[#DAD7CD] active:scale-95 flex items-center justify-center rounded-lg text-[#2D452E] transition-all"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-bold font-mono text-[#2D452E] w-5 text-center">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateCartQty(item.product.id, 1)}
                                className="h-6 w-6 bg-[#DAD7CD]/50 hover:bg-[#DAD7CD] active:scale-95 flex items-center justify-center rounded-lg text-[#2D452E] transition-all"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#F2F4EF] pt-4 mt-6">
                    {/* PAY CHOICE */}
                    <div className="mb-4">
                      <span className="text-[10px] text-[#588157] block mb-2 font-bold uppercase tracking-wider">{"To'lov Turi:"}</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(["CASH", "CARD", "MOBILE"] as const).map(m => (
                          <button
                            key={m}
                            onClick={() => setPaymentMethod(m)}
                            className={`py-2 px-2 rounded-xl text-[10px] font-bold text-center border capitalize transition-all ${
                              paymentMethod === m 
                                ? "bg-[#2D452E] border-[#2D452E] text-white shadow-sm" 
                                : "bg-[#F2F4EF]/50 border-[#DAD7CD] text-[#588157] hover:border-[#588157]"
                            }`}
                          >
                            {m === "CASH" ? "Naqd" : m === "CARD" ? "Terminal" : "Click / Payme"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PRICING */}
                    <div className="space-y-2 text-xs mb-5">
                      <div className="flex justify-between text-[#588157] font-medium">
                        <span>Aylanish summasi:</span>
                        <span className="font-semibold">{formatNumber(cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0))} {"so'm"}</span>
                      </div>
                      <div className="flex justify-between text-[#588157] font-medium">
                        <span>QQS (0% osonlashtirilgan):</span>
                        <span className="font-semibold">0 {"so'm"}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-[#2D452E] pt-2.5 border-t border-[#F2F4EF]">
                        <span>Yakuniy Hisob:</span>
                        <span className="text-[#2D452E] font-black">
                          {formatNumber(cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0))} {"so'm"}
                        </span>
                      </div>
                    </div>

                    <button
                      id="btn-pos-checkout"
                      disabled={cart.length === 0}
                      onClick={handleCheckout}
                      className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        cart.length === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                          : "bg-[#2D452E] hover:bg-[#3A5A40] text-white shadow-lg hover:scale-[1.01]"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" /> 
                      {isOnline ? "Sotuvni Qabul Qilish (Sync)" : "Sotuv (Offline IndexedDB'ga saqlash)"}
                    </button>
                  </div>
                </div>

                {/* WS ACTIVITY FEED (SIMULATED ENDPOINT FEED) */}
                <div className="bg-white p-5 rounded-[2rem] border border-[#DAD7CD] shadow-sm">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-[#2D452E] flex items-center justify-between mb-4">
                    <span>WebSocket Real-time Stream</span>
                    <span className="h-2 w-2 rounded-full bg-[#3A5A40] animate-ping"></span>
                  </h4>
                  <div className="space-y-2 h-[180px] overflow-y-auto pr-1 font-mono text-[10px]">
                    <AnimatePresence>
                      {wsEvents.map((ev) => (
                        <motion.div 
                          key={ev.id}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-2.5 rounded-xl border flex items-start gap-2 transition-all bg-[#F2F4EF]/50 border-[#DAD7CD] ${
                            ev.type === "warning" ? "border-amber-200 text-amber-800 bg-amber-50" :
                            ev.type === "success" ? "border-emerald-100 text-emerald-800 bg-emerald-50" :
                            "text-[#2D3A2D]"
                          }`}
                        >
                          <span className={`${ev.type === "warning" ? "text-amber-600" : ev.type === "success" ? "text-emerald-600" : "text-[#588157]"} font-bold`}>[{ev.time}]</span>
                          <span className="flex-1 leading-relaxed">{ev.text}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: ANALITIKA & DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              
              {/* METRICS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Bugungi jami tushum:</span>
                    <h3 className="text-2xl font-bold text-cyan-400 mt-1 font-mono">{formatNumber(totalParkRevenue)} <span className="text-xs text-slate-400 uppercase">{"so'm"}</span></h3>
                    <p className="text-[10px] text-slate-500 mt-1">{"Sinxronlangan asosiy baza bo'yicha"}</p>
                  </div>
                  <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Sotilgan tovarlar:</span>
                    <h3 className="text-2xl font-bold text-white mt-1 font-mono">{totalProductsSold} dona</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Stallar kesimida sotuv miqdori</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Zaxira tahlili (Alerts):</span>
                    <h3 className={`text-2xl font-bold mt-1 font-mono ${criticalStockItemsCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                      {criticalStockItemsCount} ta tovar kam
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">Yetkazib berish talab etiladi</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${criticalStockItemsCount > 0 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Navbatdagi sinxronizatsiya:</span>
                    <h3 className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{syncQueue.length} paket</h3>
                    <p className="text-[10px] text-slate-500 mt-1">IndexedDB kompyuterda kutilmoqda</p>
                  </div>
                  <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>

              </div>

              {/* OFFLINE MANAGE PANEL */}
              {syncQueue.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 p-5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-200 border-t-amber-700"></div>
                    <div>
                      <p className="text-sm font-bold text-amber-900">{"Tarmoqsiz rejimda saqlangan o'zgarishlar mavjud"}</p>
                      <p className="text-xs text-amber-800">Ushbu tranzaksiyalarni asosiy PostgreSQL billing bazasiga yozish va umumiy aylanmani hisoblash lozim.</p>
                    </div>
                  </div>
                  <button
                    id="btn-run-manual-sync"
                    onClick={runOfflineSync}
                    disabled={isSyncing}
                    className="bg-[#2D452E] hover:bg-[#3A5A40] text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} /> Sinxronizatsiyani ishga tushirish (Push)
                  </button>
                </div>
              )}

              {/* SYNC LABELS ANIMATION VIEW */}
              {syncLogs.length > 0 && (
                <div className="bg-[#F2F4EF] p-5 rounded-[2rem] border border-[#DAD7CD] font-mono text-xs text-[#2D3A2D] max-h-[160px] overflow-y-auto space-y-1 shadow-sm">
                  <p className="text-[#588157] select-none pb-1.5 border-b border-[#DAD7CD] mb-1.5 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]"><Activity className="h-3 w-3" /> Sinxronizatsiya loglari:</p>
                  {syncLogs.map((logStr, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[#A3B18A] font-bold">▶</span>
                      <span>{logStr}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CHARTS CONTAINER (BESPOKE INTERACTIVE SVGS) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* REVENUE BY STALLS CHART */}
                <div className="bg-white p-6 rounded-[2rem] border border-[#DAD7CD] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">{"Rastalar bo'yicha tushum dinamikasi"}</h4>
                      <p className="text-[10px] text-[#588157]">Har bir savdo burchagi tushumi ({"so'm"})</p>
                    </div>
                    <span className="text-[10px] font-mono bg-[#A3B18A]/20 text-[#2D452E] px-2.5 py-1 rounded-full border border-[#DAD7CD] font-bold">Jonli hisobot</span>
                  </div>

                  {/* CUSTOM BEAUTIFUL SVG BAR GRAPH */}
                  <div className="h-64 flex flex-col justify-between pt-4">
                    <div className="flex-1 flex gap-6 items-end justify-center px-4">
                      {stalls.map(s => {
                        const stallAmount = transactions
                          .filter(t => t.stallId === s.id)
                          .reduce((sum, t) => sum + t.amount, 0);
                        
                        // Find peak value
                        const maxVal = Math.max(...stalls.map(st => 
                          transactions.filter(t => t.stallId === st.id).reduce((sum, t) => sum + t.amount, 0)
                        )) || 100000;
                        
                        const heightPercent = maxVal > 0 ? (stallAmount / maxVal) * 80 : 5;

                        return (
                          <div key={s.id} className="flex-1 flex flex-col items-center group">
                            {/* Bar segment */}
                            <div className="w-full relative flex flex-col justify-end" style={{ height: `160px` }}>
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2D452E] text-[10px] font-mono px-2 py-0.5 rounded border border-[#DAD7CD] text-[#E9EDC9] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md pointer-events-none font-bold">
                                {formatNumber(stallAmount)} {"so'm"}
                              </div>
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercent}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="w-full rounded-t-xl bg-gradient-to-t from-[#2D452E]/90 to-[#588157] group-hover:from-[#2D452E] group-hover:to-[#3A5A40] transition-all border-t border-[#DAD7CD] shadow-sm"
                              />
                            </div>
                            
                            {/* Title labels */}
                            <p className="text-[10px] text-[#2D3A2D] font-bold mt-3 text-center line-clamp-1 max-w-[120px] transition-colors group-hover:text-[#2D452E]">
                              {s.name.replace("Fast-Food Restorani", "").replace("ko'ngilochar", "").split(" ")[0]}
                            </p>
                            <p className="text-[9px] text-[#588157] mt-0.5 font-mono font-semibold">
                              {Math.round(stallAmount / 1000)}k {"so'm"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* PRODUCT ZAXIRA / INVENTORY AND DEMAND RADAR */}
                <div className="bg-white p-6 rounded-[2rem] border border-[#DAD7CD] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">Ombor Qoldiqlari Monitoringi</h4>
                        <p className="text-[10px] text-[#588157]">{"Kam qolayotgan tovarlarni o'z vaqtida ta'minlash ogohlantirishlari"}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Re-stock
                      </span>
                    </div>

                    {/* INVENTORY TRACKING TABLE */}
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {products.map(p => {
                        const ratio = p.stock / p.minStockAlert;
                        const isWarning = ratio <= 1.0;
                        const progressPercent = Math.min(100, (p.stock / 150) * 100);

                        return (
                          <div key={p.id} className="bg-[#F2F4EF]/50 p-3 rounded-2xl border border-[#DAD7CD] flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                              <h5 className="text-xs font-bold text-[#2D452E]">{p.name}</h5>
                              <p className="text-[9px] text-[#588157] font-semibold leading-none">{p.stallName}</p>
                            </div>

                            <div className="flex-1 max-w-[140px] hidden md:block">
                              <div className="h-2 w-full bg-[#DAD7CD]/40 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${isWarning ? "bg-amber-500" : "bg-[#3A5A40]"}`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-mono font-bold ${isWarning ? "text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200" : "text-[#2D3A2D] bg-[#DAD7CD]/30 px-2 py-0.5 rounded-full border border-[#DAD7CD]"}`}>
                                  {p.stock} dona 
                                </span>
                                <span className="text-[9px] text-[#588157] font-mono">(Kam: {p.minStockAlert})</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* AI REPORT COMPILER BLOCK */}
              <div id="ai-advisor" className="bg-[#2D452E] rounded-[2rem] border border-[#DAD7CD] p-6 relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles className="h-32 w-32 text-[#E9EDC9]" />
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 border-b border-white/20 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-3 bg-white/10 text-[#E9EDC9] rounded-2xl border border-white/10 shadow-sm">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        Gemini AI Park Analitigi va Tashxis paneli
                      </h4>
                      <p className="text-xs text-[#A3B18A]">{"Har bir savdo burchagi, zaxira va ishchilar davomati bo'yicha sun'iy intellekt tavsiyasi"}</p>
                    </div>
                  </div>

                  <button
                    id="btn-trigger-ai"
                    onClick={getAiDashboardAdvice}
                    disabled={isGeneratingAi}
                    className="bg-[#E9EDC9] hover:bg-[#D8E2DC] text-[#2D452E] font-bold text-xs py-2.5 px-5 rounded-full flex items-center gap-2 transition-all self-stretch md:self-auto justify-center shadow"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingAi ? "animate-spin" : ""}`} /> 
                    {isGeneratingAi ? "Hisobot yig'ilmoqda..." : "AI Tahlilini Yangilash"}
                  </button>
                </div>

                {isGeneratingAi ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    <p className="text-xs text-[#A3B18A] font-mono">{"Gemini-3.5-flash live modeliga so'rov yuborilmoqda, tahlillar qayta ishlanmoqda..."}</p>
                  </div>
                ) : aiReport ? (
                  <div className="prose prose-invert prose-xs max-w-full text-white/95 text-xs leading-relaxed space-y-3 font-medium">
                    {/* Convert simple markdown lists and bold elements */}
                    {aiReport.split("\n").map((line, idx) => {
                      if (line.startsWith("###") || line.startsWith("##")) {
                        return <h4 key={idx} className="text-sm font-bold text-[#E9EDC9] mt-4 mb-2">{line.replace(/###|##/g, "").trim()}</h4>;
                      }
                      if (line.startsWith("**") || line.startsWith("*")) {
                        // Strong or list items
                        return <p key={idx} className="pl-3 border-l border-[#DAD7CD]/50 font-bold text-white my-1">{line.replace(/\*\*|\*/g, "").trim()}</p>;
                      }
                      if (line.startsWith("-") || line.startsWith("* ")) {
                        return <li key={idx} className="list-disc ml-4 my-0.5 text-[#E9EDC9] font-medium">{line.replace(/-|\*/g, "").trim()}</li>;
                      }
                      return <p key={idx} className="mb-2">{line}</p>;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#A3B18A] font-medium">
                    <p className="text-xs">{"Tugmani bosib bugungi park ma'lumotlariga mos AI strategik tahlil oling."}</p>
                  </div>
                )}
              </div>

              {/* RAW TRANSACTION LOG FOR AUDIT JADVALI */}
              <div className="bg-white p-6 rounded-[2rem] border border-[#DAD7CD] shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F2F4EF]">
                  <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">Tranzaksiyalar va Sotuvlar Daftari</h4>
                  <span className="text-[10px] font-mono text-[#588157] font-semibold bg-[#F2F4EF] px-2.5 py-1 rounded-full border border-[#DAD7CD]">PostgreSQL Billing replica</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#F2F4EF] text-[#588157] pb-3 uppercase tracking-wider text-[10px] font-bold">
                        <th className="py-3 font-semibold">Tranzaksiya ID</th>
                        <th className="py-3 font-semibold">Vaqt</th>
                        <th className="py-3 font-semibold">Rasta</th>
                        <th className="py-3 font-semibold">Xodim (Sotuvchi)</th>
                        <th className="py-3 font-semibold">Tovarlar</th>
                        <th className="py-3 font-semibold">{"To'lov usuli"}</th>
                        <th className="py-3 font-semibold text-right">{"Summa (so'm)"}</th>
                        <th className="py-3 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2F4EF] text-[#2D3A2D] font-medium">
                      {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-[#F2F4EF]/50 transition-colors">
                          <td className="py-3 font-mono text-[#588157] font-semibold">{t.id}</td>
                          <td className="py-3 text-[#588157]">{t.createdAt}</td>
                          <td className="py-3 font-bold text-[#2D452E]">{t.stallName}</td>
                          <td className="py-3 text-[#2D452E] font-bold">{t.employeeName}</td>
                          <td className="py-3 text-[#588157] font-serif">
                            {t.items.map(i => `${i.productName} (x${i.quantity})`).join(", ")}
                          </td>
                          <td className="py-3">
                            <span className="text-[10px] px-2.5 py-1 rounded-full font-mono bg-[#F2F4EF] text-[#2D452E] font-bold border border-[#DAD7CD]">
                              {t.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 text-right font-black font-mono text-[#3A5A40]">
                            {formatNumber(t.amount)}
                          </td>
                          <td className="py-3 text-center">
                            {t.syncStatus === "SYNCED" ? (
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                                Sinxronlandi (DB)
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
                                Kutilmoqda (IndexedDB)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 3: HR & PAYROLL MODULE */}
          {activeTab === "hr" && (
            <motion.div 
              key="hr"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* COMPREHENSIVE EMPLOYEES & ATTENDANCE SYSTEM (COL-7) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-white p-6 rounded-[2rem] border border-[#DAD7CD] shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F2F4EF]">
                    <div>
                      <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">Xodimlar Davomati va Boshqaruvi</h4>
                      <p className="text-[10px] text-[#588157]">{"Kirish va chiqish vaqtlarini belgilash (Check-In / Out)"}</p>
                    </div>
                    <span className="text-[10px] bg-[#F2F4EF] text-[#2D452E] py-1 px-2.5 rounded-full font-mono font-bold border border-[#DAD7CD]">Barcha Xodimlar: {employees.length} kishi</span>
                  </div>

                  {/* LIST */}
                  <div className="space-y-4">
                    {employees.map(emp => {
                      const { totalWage } = calculatePayroll(emp);
                      return (
                        <div key={emp.id} className="bg-[#F2F4EF]/50 p-4 rounded-2xl border border-[#DAD7CD] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-3.5 w-3.5 rounded-full ${emp.isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                            <div>
                              <h4 className="text-sm font-bold text-[#2D452E] flex items-center gap-1.5">
                                {emp.name}
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#A3B18A]/20 text-[#2D452E] border border-[#DAD7CD] font-bold">
                                  {emp.role}
                                </span>
                              </h4>
                              
                              {/* ATTENDANCE TIME INFO */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#588157] mt-1">
                                {emp.isCheckedIn ? (
                                  <span className="text-emerald-700 font-bold font-mono">Check-in: {emp.lastCheckIn || "08:30"}</span>
                                ) : (
                                  <span className="text-gray-400 font-bold font-mono">Nofaol rejimda</span>
                                )}
                                <span>•</span>
                                <span className="text-[11px] text-[#2D3A2D] font-medium">KPI Bonus stavkasi: <strong className="text-[#3A5A40] font-mono font-bold">{emp.bonusPercentage}%</strong></span>
                              </div>

                              {/* LOGIN & PASSWORD */}
                              <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                                <span className="text-[#588157] font-semibold">🔑 Login:</span>
                                <code className="bg-[#A3B18A]/20 font-bold px-1.5 py-0.5 rounded text-[#2D452E] font-mono">{emp.username}</code>
                                <span className="text-[#588157] font-semibold ml-1.5">Parol:</span>
                                <code className="bg-[#A3B18A]/20 font-bold px-1.5 py-0.5 rounded text-[#2D452E] font-mono">{emp.password}</code>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end md:self-auto">
                            <button
                              id={`check-btn-${emp.id}`}
                              onClick={() => {
                                setPendingSellerId(emp.id);
                                setPendingActionType("check_toggle");
                                setAuthUsername(emp.username || "");
                                setAuthPassword("");
                                setAuthError("");
                              }}
                              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                                emp.isCheckedIn 
                                  ? "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200" 
                                  : "bg-[#2D452E] hover:bg-[#3A5A40] text-white"
                              }`}
                            >
                              {emp.isCheckedIn ? "Check-Out qilish" : "Check-In qilish"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ATTENDANCE RECENT LOG TABLE */}
                <div className="bg-white p-6 rounded-[2rem] border border-[#DAD7CD] shadow-sm">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-[#2D452E] mb-4">Davomat jurnali (Attendance log)</h4>
                  <div className="max-h-[220px] overflow-y-auto pr-1 text-[#2D3A2D]">
                    <table className="w-full text-left text-xs font-mono font-medium">
                      <thead>
                        <tr className="text-[#588157] pb-2 border-b border-[#F2F4EF] font-bold">
                          <th className="py-2.5">Xodim ismi</th>
                          <th className="py-2.5">Lavozimi</th>
                          <th className="py-2.5">Amal Turi</th>
                          <th className="py-2.5 text-right font-bold">Vaqt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2F4EF]">
                        {attendanceLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-[#F2F4EF]/40">
                            <td className="py-2.5 font-sans font-bold text-[#2D452E]">{log.employeeName}</td>
                            <td className="py-2.5 text-[#588157]">{log.role}</td>
                            <td className="py-2.5">
                              {log.type === "KIRISH" ? (
                                <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-200">KIRISH</span>
                              ) : (
                                <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[9px] font-bold border border-amber-200">CHIQISH</span>
                              )}
                            </td>
                            <td className="py-2.5 text-right text-[#588157]">{log.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* PAYROLL CALCULATOR & COMMISSION SHEETS (COL-5) */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-white p-6 rounded-[2rem] border border-[#DAD7CD] shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#F2F4EF] pb-3 mb-4">
                      <h4 className="text-xs font-bold text-[#2D452E] uppercase tracking-wider flex items-center gap-1.5">
                        <Calculator className="h-4 w-4 text-[#3A5A40]" /> Kunbay KPI & Oylik hisobi
                      </h4>
                      <HelpCircle className="h-4 w-4 text-[#A3B18A]" />
                    </div>

                    <p className="text-xs text-[#588157] leading-relaxed mb-4 font-medium">
                      {"Tizim xodimlar hisob-kitobini "}<strong className="text-[#3A5A40]">ikki xil usulda</strong>{" hisoblaydi: fiksirlangan kunlik stavka hamda sotuv aylanmasidan foiz komissiyalari (KPI) yig'indisi."}
                    </p>

                    <div className="space-y-4">
                      {employees.map(emp => {
                        const { dailyBase, salesVolume, bonusAmount, totalWage } = calculatePayroll(emp);
                        return (
                          <div key={emp.id} className="bg-[#F2F4EF]/50 border border-[#DAD7CD] p-4 rounded-2xl text-xs space-y-2.5">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-[#2D452E] font-bold">{emp.name}</span>
                              <span className="text-[#3A5A40] font-black text-sm">{formatNumber(totalWage)} {"so'm"}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-1.5 text-[#588157] font-mono text-[10px] font-bold">
                              <div>Fiksirlangan stavka (kun):</div>
                              <div className="text-right text-[#2D3A2D]">{formatNumber(dailyBase)} {"so'm"}</div>

                              <div>Bugungi sotuv aylanmasi:</div>
                              <div className="text-right text-[#2D3A2D]">{formatNumber(salesVolume)} {"so'm"}</div>

                              <div>KPI Bonus (% stavka):</div>
                              <div className="text-right text-[#3A5A40] font-black">+{formatNumber(bonusAmount)} {"so'm"} ({emp.bonusPercentage}%)</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-[#F2F4EF] pt-4 mt-6">
                    <div className="bg-[#2D452E]/10 border border-[#2D452E]/20 p-3.5 rounded-2xl text-[11px] text-[#2D452E] font-medium leading-relaxed">
                      💡 Sanoat standartidagi <strong className="text-[#3A5A40] font-bold">Prisma va SQL Payroll relatsiyalari</strong>, hisobotlarni hisoblash algoritmi {"'Arxitekturaviy Blueprint' bo'limida"} keltirilgan.
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 4: ARXITEKTURAVIY BLUEPRINT (TECHNICAL COPY VIEWER) */}
          {activeTab === "blueprint" && (
            <motion.div 
              key="blueprint"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              
              {/* SUB TABS */}
              <div className="flex flex-wrap items-center gap-2 border-b border-[#F2F4EF] pb-3">
                <button
                  onClick={() => setBlueprintSubTab("prisma")}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                    blueprintSubTab === "prisma" 
                      ? "bg-[#2D452E] text-white shadow" 
                      : "text-[#588157] hover:text-[#2D452E] hover:bg-[#F2F4EF]/50"
                  }`}
                >
                  Prisma schema.prisma Schema fayli
                </button>
                <button
                  onClick={() => setBlueprintSubTab("api")}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                    blueprintSubTab === "api" 
                      ? "bg-[#2D452E] text-white shadow" 
                      : "text-[#588157] hover:text-[#2D452E] hover:bg-[#F2F4EF]/50"
                  }`}
                >
                  REST API va WebSocket Arxitekturasi
                </button>
                <button
                  onClick={() => setBlueprintSubTab("sync")}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                    blueprintSubTab === "sync" 
                      ? "bg-[#2D452E] text-white shadow" 
                      : "text-[#588157] hover:text-[#2D452E] hover:bg-[#F2F4EF]/50"
                  }`}
                >
                  Offline Sync Client Logic
                </button>
              </div>

              {blueprintSubTab === "prisma" && (
                <div className="bg-white p-6 rounded-[2rem] border border-[#DAD7CD] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider flex items-center gap-2">
                        Relatsion Ma{"'"}lumotlar Bazasi Strukturasi (Production-Ready)
                      </h4>
                      <p className="text-xs text-[#588157] font-medium">Xodimlar, sotuvlar, davomatlar, mahsulot zaxiralari va oylik hisobloglari munosabatlar schemasi</p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(PRISMA_SCHEMA_CODE, "prisma")}
                      className="bg-[#2D452E] hover:bg-[#3A5A40] text-xs text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow"
                    >
                      {copiedText === "prisma" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-300" /> Nusxa olindi!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Prisma faylni nusxalash
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-5 rounded-2xl bg-[#F2F4EF]/70 border border-[#DAD7CD] font-mono text-[11px] leading-relaxed overflow-x-auto text-[#2D452E] font-bold max-h-[500px]">
                      {PRISMA_SCHEMA_CODE}
                    </pre>
                  </div>
                </div>
              )}

              {blueprintSubTab === "api" && (
                <div className="bg-white p-6 rounded-[2rem] border border-[#DAD7CD] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">REST API va Socket.io WebSocket Arxitekturasi</h4>
                      <p className="text-xs text-[#588157] font-medium">Authentifikatsiya, POS, Zaxira, davomat va billing oqimi spetsifikatsiyalari</p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(API_DOCS_CODE, "api")}
                      className="bg-[#2D452E] hover:bg-[#3A5A40] text-xs text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow"
                    >
                      {copiedText === "api" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-300" /> Nusxa olindi!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> API Blueprint nusxalash
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-5 rounded-2xl bg-[#F2F4EF]/70 border border-[#DAD7CD] font-mono text-[11px] leading-relaxed overflow-x-auto text-[#2D452E] font-bold max-h-[500px]">
                      {API_DOCS_CODE}
                    </pre>
                  </div>
                </div>
              )}

              {blueprintSubTab === "sync" && (
                <div className="bg-white p-6 rounded-[2rem] border border-[#DAD7CD] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">{"Client-side Offline Sync Queue kodi (client-hook-pattern)"}</h4>
                      <p className="text-xs text-[#588157] font-medium">IndexedDB tushumi, offline navbat va internet ulanganda tranzaktsiyalar sinxronizatsiyasi</p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(SYNC_ENGINE_CODE, "sync")}
                      className="bg-[#2D452E] hover:bg-[#3A5A40] text-xs text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow"
                    >
                      {copiedText === "sync" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-300" /> Nusxa olindi!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Client Sync Hook kodi nusxalash
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-5 rounded-2xl bg-[#F2F4EF]/70 border border-[#DAD7CD] font-mono text-[11px] leading-relaxed overflow-x-auto text-[#2D452E] font-bold max-h-[500px]">
                      {SYNC_ENGINE_CODE}
                    </pre>
                  </div>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* CUSTOM AUTHENTICATION OVERLAY MODAL */}
      <AnimatePresence>
        {pendingSellerId && (
          <motion.div
            key="auth-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            id="auth-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] border border-[#DAD7CD] shadow-2xl max-w-md w-full overflow-hidden p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
              id="auth-modal-card"
            >
              <div className="flex items-center gap-3 border-b border-[#F2F4EF] pb-4">
                <div className="p-3 bg-[#2D452E]/10 rounded-2xl text-[#2D452E]">
                  <Lock className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-black text-[#2D452E] uppercase tracking-wider">
                    {pendingActionType === "switch_seller" ? "Sotuvchi Avtorizatsiyasi" : "Xodim Avtorizatsiyasi"}
                  </h3>
                  <p className="text-xs text-[#588157] font-medium">Davom etishdan avval shaxsingizni tasdiqlang</p>
                </div>
              </div>

              <div className="bg-[#F2F4EF]/50 p-4 rounded-2xl border border-[#DAD7CD] text-xs space-y-1 text-[#2D452E]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#588157] block">Tanlangan Xodim:</span>
                <p className="font-bold text-sm text-[#2D452E] flex items-center gap-1.5">
                  {employees.find(e => e.id === pendingSellerId)?.name}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#A3B18A]/20 border border-[#DAD7CD] font-bold">
                    {employees.find(e => e.id === pendingSellerId)?.role}
                  </span>
                </p>
                <p className="text-[9px] text-[#588157] font-mono mt-0.5 font-semibold">
                  Tizimda ID: <span className="text-[#3A5A40] font-sans font-bold">{pendingSellerId}</span>
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuthSubmit();
                }} 
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#588157] uppercase tracking-wider block">Foydalanuvchi nomi (Login):</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3B18A] text-sm font-semibold select-none">
                      @
                    </span>
                    <input
                      type="text"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="Login..."
                      className="w-full bg-[#F2F4EF]/50 border border-[#DAD7CD] rounded-xl py-2.5 pl-8 pr-4 text-sm font-semibold text-[#2D452E] focus:outline-none focus:border-[#2D452E] focus:ring-1 focus:ring-[#2D452E] transition-all"
                      required
                      id="auth-username-field"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#588157] uppercase tracking-wider block">Tizim Paroli:</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3B18A] flex items-center justify-center">
                      <Key className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Parolni kiriting..."
                      className="w-full bg-[#F2F4EF]/50 border border-[#DAD7CD] rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono font-bold text-[#2D452E] focus:outline-none focus:border-[#2D452E] focus:ring-1 focus:ring-[#2D452E] transition-all"
                      required
                      id="auth-password-field"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-205 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" /> {authError}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingSellerId(null);
                      setAuthUsername("");
                      setAuthPassword("");
                      setAuthError("");
                    }}
                    className="w-1/2 bg-gray-100 hover:bg-gray-200 text-[#588157] font-bold py-3 rounded-xl text-xs transition-all border border-gray-200 cursor-pointer text-center"
                    id="auth-modal-cancel-btn"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-[#2D452E] hover:bg-[#3A5A40] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    id="auth-modal-submit-btn"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Tasdiqlash
                  </button>
                </div>
              </form>

              <div className="pt-3.5 border-t border-[#F2F4EF] text-[10px] text-[#588157] flex flex-col gap-1.5 leading-relaxed bg-[#F2F4EF]/30 p-3 rounded-2xl border border-[#DAD7CD]/50">
                <span className="font-black uppercase tracking-wider text-[#3A5A40]">🔑 TIZIM SAKRAN GAN PAROLLAR:</span>
                <p className="space-y-0.5">
                  Xodim faol parollari (HR ro&apos;yxatida ko&apos;rsatilgan):<br/>
                  • Dilshod: <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">dilshod</code> / <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">111</code><br/>
                  • Shahzod: <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">shahzod</code> / <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">222</code><br/>
                  • Laylo: <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">laylo</code> / <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">333</code><br/>
                  • Jamshid: <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">jamshid</code> / <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">444</code>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ============================================
// --- PRODUCTION-READY BLUEPRINT SOURCE CODE TEMPLATES ---
// ============================================

const PRISMA_SCHEMA_CODE = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  SELLER
  ATTENDANT
  MANAGER
}

enum StallType {
  STALL
  ATTRACTION
  CAFE
  SERVICE
}

enum PaymentMethod {
  CASH
  CARD
  MOBILE
}

enum SyncStatus {
  SYNCED
  PENDING
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}

model User {
  id               String       @id @default(uuid())
  email            String       @unique
  passwordHash     String
  name             String
  role             Role         @default(SELLER)
  baseSalary       Decimal      @db.Decimal(12, 2) // Monthly Base Salary in UZS
  bonusPercentage  Decimal      @db.Decimal(5, 2)  // KPI commission percentage
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  // Relations
  sales            Transaction[]
  attendances      Attendance[]
  payrolls         Payroll[]
}

model Location {
  id        String      @id @default(uuid())
  name      String      @unique
  type      StallType   @default(STALL)
  status    String      @default("ACTIVE") // ACTIVE, MAINTENANCE, CLOSED
  createdAt DateTime    @default(now())

  // Relations
  products  Product[]
  sales     Transaction[]
}

model Product {
  id             String       @id @default(uuid())
  name           String
  price          Decimal      @db.Decimal(12, 2)
  stock          Int          @default(0)
  minStockAlert  Int          @default(5)
  locationId     String
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  // relations
  location       Location     @relation(fields: [locationId], references: [id], onDelete: Cascade)
}

model Transaction {
  id             String        @id @default(uuid())
  amount         Decimal       @db.Decimal(12, 2)
  paymentMethod  PaymentMethod @default(CASH)
  employeeId     String
  locationId     String
  items          Json          // Structured Snapshot of sold items: [{ productId, name, qty, price }]
  syncStatus     SyncStatus    @default(SYNCED) // For tracking offline-injected bulk loads
  createdAt      DateTime      @default(now())

  // relations
  employee       User          @relation(fields: [employeeId], references: [id])
  location       Location      @relation(fields: [locationId], references: [id])

  @@index([employeeId])
  @@index([locationId])
  @@index([createdAt])
}

model Attendance {
  id          String           @id @default(uuid())
  employeeId  String
  checkIn     DateTime         @default(now())
  checkOut    DateTime?
  status      AttendanceStatus @default(PRESENT)
  createdAt   DateTime         @default(now())

  // relations
  employee    User             @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId])
}

model Payroll {
  id           String        @id @default(uuid())
  employeeId   String
  periodStart  DateTime
  periodEnd    DateTime
  basePay      Decimal       @db.Decimal(12, 2) // Segment base check based on days
  bonusPay     Decimal       @db.Decimal(12, 2) // Automatically compiled sum from Transaction percentage
  totalPaid    Decimal       @db.Decimal(12, 2) // basePay + bonusPay
  paidAt       DateTime      @default(now())
  status       String        @default("PAID")   // PAID, PENDING_APPROVAL

  // relations
  employee     User          @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId])
}`;

const API_DOCS_CODE = `========================================================================
1. AUTHENTICATION (JWT) APIs
========================================================================
POST /api/auth/login
------------------------------------
Sellers and Admins authentication.
* Request:
  {
    "email": "shahzod.alimov@park.uz",
    "password": "Password123"
  }
* Response 200 OK:
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "emp_2", "name": "Shahzod Alimov", "role": "SELLER" }
  }

========================================================================
2. POS (SALES GATEWAY) REST APIs
========================================================================
POST /api/pos/sale
------------------------------------
Standard online sale. Decrements stock inside database transactions.
* Headers: Authorization: Bearer <token>
* Request:
  {
    "amount": 142000,
    "paymentMethod": "CARD",
    "stallId": "stall_1",
    "items": [
      { "productId": "prod_1", "name": "Burger Klasik", "quantity": 3, "price": 32000 },
      { "productId": "prod_3", "name": "Coca-Cola", "quantity": 2, "price": 10000 }
    ]
  }
* Response 201 Created:
  { "success": true, "transactionId": "txn_892711", "newStock": [ { "productId": "prod_1", "stock": 42 } ] }

POST /api/pos/sync-bulk
------------------------------------
Batch synchronizer for Offline-First IndexedDB dumps. Runs inside a single Prisma database transaction.
* Request:
  {
    "transactions": [
      {
        "id": "offline_txn_001",
        "amount": 40000,
        "paymentMethod": "CASH",
        "employeeId": "emp_2",
        "stallId": "stall_2",
        "items": [...],
        "createdAt": "2026-06-09T10:05:00Z"
      }
    ]
  }
* Response 200 OK:
  { "success": true, "syncedCount": 1 }

========================================================================
3. ATTENDANCE & PAYROLL API
========================================================================
POST /api/attendance/check-in
------------------------------------
Worker daily Shift Start.
* Request: { "employeeId": "emp_2" }
* Response 200 OK: { "attendanceId": "att_91", "checkIn": "2026-06-09T08:30:00Z" }

GET /api/payroll/calculate?employeeId=emp_2&periodStart=2026-06-01&periodEnd=2026-06-09
----------------------------------------------------------------------------------------
Compiles live base day-by-day pay and live KPI commissions.
* Formula: Base_Earnings + SUM(Sale.Amount * User.bonusPercentage)
* Response 200 OK:
  {
    "employeeId": "emp_2",
    "baseCompensation": 1050000.00,
    "totalCommisionBonus": 85000.00,
    "payrollTotal": 1135000.00
  }

========================================================================
4. SOCKET.IO WEB-SOCKET CHANNELS (Real-time updates)
========================================================================
Events sent from nodes or server:
* 'stall_sale_registered' -> { "stallId": "stall_1", "amount": 142000, "employeeName": "Shahzod" }
* 'stock_warning' -> { "productId": "prod_3", "name": "Coca-Cola", "currentStock": 9 }
* 'employee_check_in' -> { "employeeId": "emp_1", "time": "08:30" }`;

const SYNC_ENGINE_CODE = `// hooks/useOfflineSyncGrid.ts
import { useState } from "react";

export interface OfflineTransaction {
  id: string;
  amount: number;
  paymentMethod: string;
  employeeId: string;
  stallId: string;
  items: any[];
  createdAt: string;
}

export function useOfflineSyncEngine() {
  const [isSyncing, setIsSyncing] = useState(false);

  // Send queued transactions to target database
  const syncTransactionsWithServer = async (queue: OfflineTransaction[]) => {
    if (queue.length === 0) return { success: true, count: 0 };
    setIsSyncing(true);

    try {
      const response = await fetch("/api/pos/sync-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactions: queue }),
      });

      if (!response.ok) {
        throw new Error("Server Sync API error occurred");
      }

      const result = await response.json();
      setIsSyncing(false);
      return { success: true, count: result.syncedCount };
      
    } catch (err) {
      console.error("Synchronization execution failed:", err);
      setIsSyncing(false);
      return { success: false, error: err };
    }
  };

  return {
    syncTransactionsWithServer,
    isSyncing
  };
}`;
