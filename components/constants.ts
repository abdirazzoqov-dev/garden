// ============================================================
// PARK CENTRAL — Static Seed Data & Constants
// ============================================================

import type {
  Stall, Employee, Product, Transaction, AttendanceLog,
  WsEvent, StallType, StallStatus, ProductCategory,
} from "./types";

// ── Stall type metadata ───────────────────────────────────────
export const STALL_TYPE_META: Record<StallType, { label: string; emoji: string; color: string; bg: string }> = {
  FASTFOOD:   { label: "Fast-Food",     emoji: "🍔", color: "text-orange-700",  bg: "bg-orange-50  border-orange-200"  },
  TEAHOUSE:   { label: "Choyxona",      emoji: "🫖", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  CAFE:       { label: "Kafe / Restoran",emoji: "☕", color: "text-amber-700",   bg: "bg-amber-50   border-amber-200"   },
  STALL:      { label: "Savdo Rastasi", emoji: "🛍️", color: "text-purple-700",  bg: "bg-purple-50  border-purple-200"  },
  ATTRACTION: { label: "Attraksion",    emoji: "🎢", color: "text-blue-700",    bg: "bg-blue-50    border-blue-200"    },
  SERVICE:    { label: "Xizmat",        emoji: "🔧", color: "text-slate-700",   bg: "bg-slate-50   border-slate-200"   },
};

export const STALL_STATUS_META: Record<StallStatus, { label: string; badge: string }> = {
  ACTIVE:      { label: "Faol",        badge: "badge-green"  },
  CLOSED:      { label: "Yopiq",       badge: "badge-slate"  },
  MAINTENANCE: { label: "Ta'mirda",    badge: "badge-amber"  },
};

export const PRODUCT_CATEGORY_META: Record<ProductCategory, { label: string; emoji: string }> = {
  FOOD:     { label: "Taom",         emoji: "🍽️" },
  DRINK:    { label: "Ichimlik",     emoji: "🥤" },
  DESSERT:  { label: "Desert",       emoji: "🍦" },
  SNACK:    { label: "Snack",        emoji: "🍿" },
  TEA:      { label: "Choy",         emoji: "🍵" },
  HOOKAH:   { label: "Xalyopa",      emoji: "💨" },
  TICKET:   { label: "Chipta",       emoji: "🎫" },
  SOUVENIR: { label: "Suvenirlar",   emoji: "🎁" },
  OTHER:    { label: "Boshqa",       emoji: "📦" },
};

// ── Initial Stalls ────────────────────────────────────────────
export const INITIAL_STALLS: Stall[] = [
  {
    id: "stall_1", name: "Markaziy Fast-Food",     type: "FASTFOOD",   status: "ACTIVE",
    description: "Burger, shaurma, hot-dog va ichimliklar",
    openTime: "09:00", closeTime: "22:00", floor: "Asosiy maydon", createdAt: "2026-01-01",
  },
  {
    id: "stall_2", name: "Bog' Choyxonasi",         type: "TEAHOUSE",   status: "ACTIVE",
    description: "An'anaviy o'zbek choyxonasi, 20 ta stol",
    openTime: "08:00", closeTime: "23:00", tableCount: 20, floor: "Ko'l bo'yi", createdAt: "2026-01-01",
  },
  {
    id: "stall_3", name: "Ko'ngilochar Attraksion", type: "ATTRACTION",  status: "ACTIVE",
    description: "Tsirk, karusel va bola attraksionlari",
    openTime: "10:00", closeTime: "21:00", floor: "Sharqiy qanot", createdAt: "2026-01-01",
  },
  {
    id: "stall_4", name: "Suvenirlar Markazi",      type: "STALL",       status: "ACTIVE",
    description: "Esdalik buyumlar, o'yinchoqlar, bayroqlar",
    openTime: "09:00", closeTime: "21:00", floor: "Kirish qismi", createdAt: "2026-01-01",
  },
  {
    id: "stall_5", name: "Muzqaymoq Dükoni",        type: "STALL",       status: "ACTIVE",
    description: "Muzqaymoq, shakar-paxta va shirinliklar",
    openTime: "09:00", closeTime: "21:00", floor: "Asosiy maydon", createdAt: "2026-01-01",
  },
  {
    id: "stall_6", name: "VIP Kafe",                type: "CAFE",        status: "ACTIVE",
    description: "Premium kafe, 10 ta stol, Wi-Fi",
    openTime: "10:00", closeTime: "22:00", tableCount: 10, floor: "2-qavat", createdAt: "2026-01-01",
  },
];

// ── Initial Employees ─────────────────────────────────────────
export const INITIAL_EMPLOYEES: Employee[] = [
  { id: "emp_1", name: "Dilshod Abdirazzokov", role: "MANAGER",   stallId: undefined,  baseSalary: 6500000, bonusPercentage: 2, isCheckedIn: true,  lastCheckIn: "08:30", username: "dilshod", password: "111" },
  { id: "emp_2", name: "Shahzod Alimov",       role: "SELLER",    stallId: "stall_1",  baseSalary: 3500000, bonusPercentage: 5, isCheckedIn: true,  lastCheckIn: "08:45", username: "shahzod", password: "222" },
  { id: "emp_3", name: "Laylo Karimova",        role: "SELLER",    stallId: "stall_5",  baseSalary: 3200000, bonusPercentage: 7, isCheckedIn: false,                        username: "laylo",   password: "333" },
  { id: "emp_4", name: "Jamshid Tojiyev",       role: "ATTENDANT", stallId: "stall_3",  baseSalary: 4000000, bonusPercentage: 4, isCheckedIn: true,  lastCheckIn: "08:50", username: "jamshid", password: "444" },
  { id: "emp_5", name: "Zulfiya Yusupova",      role: "WAITER",    stallId: "stall_2",  baseSalary: 2800000, bonusPercentage: 6, isCheckedIn: true,  lastCheckIn: "09:00", username: "zulfiya", password: "555" },
  { id: "emp_6", name: "Bobur Raximov",         role: "CHEF",      stallId: "stall_1",  baseSalary: 5000000, bonusPercentage: 3, isCheckedIn: true,  lastCheckIn: "08:00", username: "bobur",   password: "666" },
  { id: "emp_7", name: "Admin",                 role: "ADMIN",     stallId: undefined,  baseSalary: 8000000, bonusPercentage: 0, isCheckedIn: true,  lastCheckIn: "08:00", username: "admin",   password: "admin" },
];

// ── Initial Products ──────────────────────────────────────────
export const INITIAL_PRODUCTS: Product[] = [
  // Fast-food
  { id: "prod_1", name: "Sirlangan Burger Klasik", category: "FOOD",    price: 32000, costPrice: 18000, stock: 45,  minStockAlert: 10, unit: "dona",    prepTime: 7,  isAvailable: true,  stallId: "stall_1", stallName: "Markaziy Fast-Food",     description: "Mol go'shtli burger, sous, sabzavot", createdAt: "2026-01-01" },
  { id: "prod_2", name: "Shaurma Mol go'shtli",    category: "FOOD",    price: 38000, costPrice: 22000, stock: 28,  minStockAlert: 8,  unit: "dona",    prepTime: 8,  isAvailable: true,  stallId: "stall_1", stallName: "Markaziy Fast-Food",     description: "Mol go'shtli shaurma, chili sous",    createdAt: "2026-01-01" },
  { id: "prod_3", name: "Coca-Cola 0.5L",          category: "DRINK",   price: 10000, costPrice: 6000,  stock: 9,   minStockAlert: 15, unit: "litr",    prepTime: 0,  isAvailable: true,  stallId: "stall_1", stallName: "Markaziy Fast-Food",     description: "Sovutilgan",                          createdAt: "2026-01-01" },
  { id: "prod_4", name: "Kartoshka Fri (L)",       category: "SNACK",   price: 18000, costPrice: 8000,  stock: 60,  minStockAlert: 12, unit: "porsiya", prepTime: 5,  isAvailable: true,  stallId: "stall_1", stallName: "Markaziy Fast-Food",     description: "Tuzlangan, ketchup bilan",            createdAt: "2026-01-01" },
  // Choyxona
  { id: "prod_5", name: "Ko'k Choy (Chinni)",      category: "TEA",     price: 8000,  costPrice: 2000,  stock: 200, minStockAlert: 30, unit: "piyola",  prepTime: 5,  isAvailable: true,  stallId: "stall_2", stallName: "Bog' Choyxonasi",        description: "Arzon, shirin, ko'k choy",            createdAt: "2026-01-01" },
  { id: "prod_6", name: "Qora Choy + Shirinlik",   category: "TEA",     price: 12000, costPrice: 4000,  stock: 150, minStockAlert: 20, unit: "set",     prepTime: 5,  isAvailable: true,  stallId: "stall_2", stallName: "Bog' Choyxonasi",        description: "Qand-shakar, pechene bilan",          createdAt: "2026-01-01" },
  { id: "prod_7", name: "Samsa (2 dona)",           category: "FOOD",    price: 16000, costPrice: 7000,  stock: 40,  minStockAlert: 10, unit: "porsiya", prepTime: 0,  isAvailable: true,  stallId: "stall_2", stallName: "Bog' Choyxonasi",        description: "Issiq, qo'y go'shtli samsa",          createdAt: "2026-01-01" },
  { id: "prod_8", name: "Xalyopa (1 soat)",        category: "HOOKAH",  price: 80000, costPrice: 35000, stock: 15,  minStockAlert: 3,  unit: "dona",    prepTime: 10, isAvailable: true,  stallId: "stall_2", stallName: "Bog' Choyxonasi",        description: "Premium tutun, 5 xil ta'm",          createdAt: "2026-01-01" },
  // Attraksion
  { id: "prod_9", name: "Katta Tsirk Chiptasi",    category: "TICKET",  price: 50000, costPrice: 0,     stock: 120, minStockAlert: 20, unit: "dona",    prepTime: 0,  isAvailable: true,  stallId: "stall_3", stallName: "Ko'ngilochar Attraksion", description: "Bolalar va kattalar uchun",           createdAt: "2026-01-01" },
  { id: "prod_10",name: "Karusel Chiptasi",         category: "TICKET",  price: 20000, costPrice: 0,     stock: 200, minStockAlert: 30, unit: "dona",    prepTime: 0,  isAvailable: true,  stallId: "stall_3", stallName: "Ko'ngilochar Attraksion", description: "5 ta aylanish",                      createdAt: "2026-01-01" },
  // Suvenirlar
  { id: "prod_11",name: "Esdalik Bog' Flagi",       category: "SOUVENIR",price: 25000, costPrice: 8000,  stock: 12,  minStockAlert: 5,  unit: "dona",    prepTime: 0,  isAvailable: true,  stallId: "stall_4", stallName: "Suvenirlar Markazi",     description: "24x36 sm, yuvishga chidamli",        createdAt: "2026-01-01" },
  // Muzqaymoq
  { id: "prod_12",name: "Muzqaymoq Gilosli",        category: "DESSERT", price: 14000, costPrice: 6000,  stock: 3,   minStockAlert: 5,  unit: "dona",    prepTime: 0,  isAvailable: true,  stallId: "stall_5", stallName: "Muzqaymoq Dükoni",       description: "100ml, giloslisous",                 createdAt: "2026-01-01" },
  { id: "prod_13",name: "Shakar-paxta (Katta)",     category: "DESSERT", price: 12000, costPrice: 3000,  stock: 22,  minStockAlert: 6,  unit: "dona",    prepTime: 2,  isAvailable: true,  stallId: "stall_5", stallName: "Muzqaymoq Dükoni",       description: "Katta vanna, turli rang",            createdAt: "2026-01-01" },
  // VIP Kafe
  { id: "prod_14",name: "Kapuchino",                category: "DRINK",   price: 28000, costPrice: 10000, stock: 50,  minStockAlert: 8,  unit: "stakan",  prepTime: 4,  isAvailable: true,  stallId: "stall_6", stallName: "VIP Kafe",               description: "Italyan arabika, sut ko'pigi",       createdAt: "2026-01-01" },
  { id: "prod_15",name: "Tiramisu",                 category: "DESSERT", price: 45000, costPrice: 18000, stock: 8,   minStockAlert: 3,  unit: "porsiya", prepTime: 0,  isAvailable: true,  stallId: "stall_6", stallName: "VIP Kafe",               description: "Klassik italyan desert",             createdAt: "2026-01-01" },
];

// ── Initial Transactions ──────────────────────────────────────
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_001", amount: 142000, paymentMethod: "CARD",
    employeeId: "emp_2", employeeName: "Shahzod Alimov",
    stallId: "stall_1", stallName: "Markaziy Fast-Food",
    items: [
      { productName: "Sirlangan Burger Klasik", quantity: 3, price: 32000 },
      { productName: "Coca-Cola 0.5L",          quantity: 2, price: 10000 },
      { productName: "Shaurma Mol go'shtli",    quantity: 1, price: 38000 },
    ],
    createdAt: "10:14:12", syncStatus: "SYNCED",
  },
  {
    id: "txn_002", amount: 52000, paymentMethod: "MOBILE",
    employeeId: "emp_5", employeeName: "Zulfiya Yusupova",
    stallId: "stall_2", stallName: "Bog' Choyxonasi",
    items: [
      { productName: "Ko'k Choy (Chinni)",    quantity: 2, price: 8000  },
      { productName: "Samsa (2 dona)",         quantity: 2, price: 16000 },
    ],
    createdAt: "10:05:43", syncStatus: "SYNCED",
  },
  {
    id: "txn_003", amount: 150000, paymentMethod: "CASH",
    employeeId: "emp_4", employeeName: "Jamshid Tojiyev",
    stallId: "stall_3", stallName: "Ko'ngilochar Attraksion",
    items: [{ productName: "Katta Tsirk Chiptasi", quantity: 3, price: 50000 }],
    createdAt: "09:48:21", syncStatus: "SYNCED",
  },
  {
    id: "txn_004", amount: 80000, paymentMethod: "CASH",
    employeeId: "emp_5", employeeName: "Zulfiya Yusupova",
    stallId: "stall_2", stallName: "Bog' Choyxonasi",
    items: [{ productName: "Xalyopa (1 soat)", quantity: 1, price: 80000 }],
    createdAt: "11:20:00", syncStatus: "SYNCED",
  },
];

// ── Initial Attendance ────────────────────────────────────────
export const INITIAL_ATTENDANCE: AttendanceLog[] = [
  { id: "att_1", employeeName: "Dilshod Abdirazzokov", role: "Menejer",    type: "KIRISH", time: "08:30" },
  { id: "att_2", employeeName: "Shahzod Alimov",       role: "Sotuvchi",   type: "KIRISH", time: "08:45" },
  { id: "att_3", employeeName: "Jamshid Tojiyev",      role: "Nazoratchi", type: "KIRISH", time: "08:50" },
  { id: "att_4", employeeName: "Zulfiya Yusupova",     role: "Ofitsiant",  type: "KIRISH", time: "09:00" },
  { id: "att_5", employeeName: "Bobur Raximov",        role: "Oshpaz",     type: "KIRISH", time: "08:00" },
];

// ── Initial WS Events ─────────────────────────────────────────
export const INITIAL_WS_EVENTS: WsEvent[] = [
  { id: "ws_1", time: "11:20:00", text: "Choyxona sotuvi: Zulfiya Yusupova — 80 000 so'm (Xalyopa)",               type: "success" },
  { id: "ws_2", time: "10:14:12", text: "Fast-Food sotuvi: Shahzod Alimov — 142 000 so'm",                          type: "success" },
  { id: "ws_3", time: "10:11:05", text: "[DIQQAT] Muzqaymoq Gilosli zaxirasi kritik kam (3 dona qoldi!)",           type: "warning" },
  { id: "ws_4", time: "08:50:00", text: "Xodim Jamshid Tojiyev attraksion rastasida ish boshladi",                  type: "info"    },
];

// ── Initial Tables ────────────────────────────────────────────
export const INITIAL_TABLES: import("./types").Table[] = [
  // Bog' Choyxonasi — 8 ta stol (stall_2, tableCount: 20)
  { id: "tbl_2_01", number: 1,  stallId: "stall_2", stallName: "Bog' Choyxonasi", capacity: 4, status: "OCCUPIED",  currentOrderId: "ord_001", waiterName: "Zulfiya Yusupova" },
  { id: "tbl_2_02", number: 2,  stallId: "stall_2", stallName: "Bog' Choyxonasi", capacity: 4, status: "FREE" },
  { id: "tbl_2_03", number: 3,  stallId: "stall_2", stallName: "Bog' Choyxonasi", capacity: 6, status: "OCCUPIED",  currentOrderId: "ord_002", waiterName: "Zulfiya Yusupova" },
  { id: "tbl_2_04", number: 4,  stallId: "stall_2", stallName: "Bog' Choyxonasi", capacity: 4, status: "RESERVED",  reservedFor: "Karimov oilasi", reservedAt: "13:00" },
  { id: "tbl_2_05", number: 5,  stallId: "stall_2", stallName: "Bog' Choyxonasi", capacity: 2, status: "FREE" },
  { id: "tbl_2_06", number: 6,  stallId: "stall_2", stallName: "Bog' Choyxonasi", capacity: 8, status: "FREE" },
  { id: "tbl_2_07", number: 7,  stallId: "stall_2", stallName: "Bog' Choyxonasi", capacity: 4, status: "BILL_REQUESTED", currentOrderId: "ord_003", waiterName: "Zulfiya Yusupova" },
  { id: "tbl_2_08", number: 8,  stallId: "stall_2", stallName: "Bog' Choyxonasi", capacity: 4, status: "FREE" },
  // VIP Kafe — 5 ta stol (stall_6, tableCount: 10)
  { id: "tbl_6_01", number: 1,  stallId: "stall_6", stallName: "VIP Kafe", capacity: 2, status: "OCCUPIED",  currentOrderId: "ord_004" },
  { id: "tbl_6_02", number: 2,  stallId: "stall_6", stallName: "VIP Kafe", capacity: 4, status: "FREE" },
  { id: "tbl_6_03", number: 3,  stallId: "stall_6", stallName: "VIP Kafe", capacity: 4, status: "FREE" },
  { id: "tbl_6_04", number: 4,  stallId: "stall_6", stallName: "VIP Kafe", capacity: 6, status: "RESERVED", reservedFor: "Abdullayev", reservedAt: "14:30" },
  { id: "tbl_6_05", number: 5,  stallId: "stall_6", stallName: "VIP Kafe", capacity: 2, status: "FREE" },
];

// ── Initial Orders ────────────────────────────────────────────
export const INITIAL_ORDERS: import("./types").Order[] = [
  {
    id: "ord_001", type: "DINE_IN", status: "PREPARING",
    stallId: "stall_2", stallName: "Bog' Choyxonasi",
    tableId: "tbl_2_01", tableNumber: 1,
    waiterId: "emp_5", waiterName: "Zulfiya Yusupova",
    guestCount: 3,
    items: [
      { id: "oi_1", productId: "prod_5", productName: "Ko'k Choy (Chinni)", category: "TEA",  price: 8000,  quantity: 3, status: "READY",    prepTime: 5 },
      { id: "oi_2", productId: "prod_7", productName: "Samsa (2 dona)",      category: "FOOD", price: 16000, quantity: 2, status: "PREPARING", prepTime: 0 },
    ],
    totalAmount: 56000,
    createdAt: "11:05:00", updatedAt: "11:08:00",
  },
  {
    id: "ord_002", type: "DINE_IN", status: "SERVED",
    stallId: "stall_2", stallName: "Bog' Choyxonasi",
    tableId: "tbl_2_03", tableNumber: 3,
    waiterId: "emp_5", waiterName: "Zulfiya Yusupova",
    guestCount: 5,
    items: [
      { id: "oi_3", productId: "prod_6", productName: "Qora Choy + Shirinlik", category: "TEA",    price: 12000, quantity: 3, status: "SERVED", prepTime: 5 },
      { id: "oi_4", productId: "prod_8", productName: "Xalyopa (1 soat)",       category: "HOOKAH", price: 80000, quantity: 1, status: "SERVED", prepTime: 10 },
    ],
    totalAmount: 116000,
    createdAt: "10:30:00", updatedAt: "10:55:00", servedAt: "10:55:00",
  },
  {
    id: "ord_003", type: "DINE_IN", status: "BILL_REQUESTED",
    stallId: "stall_2", stallName: "Bog' Choyxonasi",
    tableId: "tbl_2_07", tableNumber: 7,
    waiterId: "emp_5", waiterName: "Zulfiya Yusupova",
    guestCount: 2,
    items: [
      { id: "oi_5", productId: "prod_5", productName: "Ko'k Choy (Chinni)", category: "TEA",  price: 8000, quantity: 2, status: "SERVED", prepTime: 5 },
    ],
    totalAmount: 16000,
    createdAt: "11:30:00", updatedAt: "11:45:00", servedAt: "11:40:00",
  },
  {
    id: "ord_004", type: "DINE_IN", status: "NEW",
    stallId: "stall_6", stallName: "VIP Kafe",
    tableId: "tbl_6_01", tableNumber: 1,
    guestCount: 2,
    items: [
      { id: "oi_6", productId: "prod_14", productName: "Kapuchino", category: "DRINK",   price: 28000, quantity: 2, status: "PENDING", prepTime: 4 },
      { id: "oi_7", productId: "prod_15", productName: "Tiramisu",  category: "DESSERT", price: 45000, quantity: 1, status: "PENDING", prepTime: 0 },
    ],
    totalAmount: 101000,
    createdAt: "11:50:00", updatedAt: "11:50:00",
  },
  {
    id: "ord_005", type: "TAKEAWAY", status: "PREPARING",
    stallId: "stall_1", stallName: "Markaziy Fast-Food",
    waiterId: "emp_2", waiterName: "Shahzod Alimov",
    items: [
      { id: "oi_8", productId: "prod_1", productName: "Sirlangan Burger Klasik", category: "FOOD",  price: 32000, quantity: 2, status: "PREPARING", prepTime: 7 },
      { id: "oi_9", productId: "prod_3", productName: "Coca-Cola 0.5L",          category: "DRINK", price: 10000, quantity: 2, status: "READY",     prepTime: 0 },
    ],
    totalAmount: 84000,
    createdAt: "11:55:00", updatedAt: "11:57:00",
  },
];

// ── Loyalty tier config ───────────────────────────────────────
export const LOYALTY_TIERS = {
  BRONZE:   { label: "Bronza",   minSpent: 0,         pointRate: 1,  color: "text-amber-700",    bg: "bg-amber-100  border-amber-200",   emoji: "🥉" },
  SILVER:   { label: "Kumush",   minSpent: 500000,    pointRate: 2,  color: "text-slate-600",    bg: "bg-slate-100  border-slate-200",   emoji: "🥈" },
  GOLD:     { label: "Oltin",    minSpent: 2000000,   pointRate: 3,  color: "text-yellow-700",   bg: "bg-yellow-100 border-yellow-200",  emoji: "🥇" },
  PLATINUM: { label: "Platinum", minSpent: 5000000,   pointRate: 5,  color: "text-purple-700",   bg: "bg-purple-100 border-purple-200",  emoji: "💎" },
} as const;

// Points per 1000 UZS spent
export const POINTS_PER_1000 = 1; // base, multiplied by tier pointRate

// ── Initial Customers ─────────────────────────────────────────
export const INITIAL_CUSTOMERS: import("./types").Customer[] = [
  {
    id: "cust_1", name: "Akbar Toshmatov",   phone: "+998 90 123 4567", email: "akbar@mail.uz",
    tier: "GOLD",     points: 3450, totalSpent: 2850000, visitCount: 18, lastVisit: "2026-06-08",
    birthday: "1990-03-15", isActive: true, createdAt: "2026-01-15",
    notes: "Xalyopa va choy ixlosmandi",
  },
  {
    id: "cust_2", name: "Malika Yusupova",   phone: "+998 91 234 5678",
    tier: "SILVER",   points: 1200, totalSpent: 980000,  visitCount: 9,  lastVisit: "2026-06-07",
    birthday: "1995-07-20", isActive: true, createdAt: "2026-02-10",
  },
  {
    id: "cust_3", name: "Jasur Rahimov",     phone: "+998 93 345 6789",
    tier: "PLATINUM", points: 8900, totalSpent: 6200000, visitCount: 42, lastVisit: "2026-06-09",
    birthday: "1985-11-03", isActive: true, createdAt: "2025-11-01",
    notes: "VIP mijoz, har hafta keladi",
  },
  {
    id: "cust_4", name: "Nodira Karimova",   phone: "+998 97 456 7890",
    tier: "BRONZE",   points: 380,  totalSpent: 320000,  visitCount: 4,  lastVisit: "2026-05-20",
    isActive: true, createdAt: "2026-04-05",
  },
  {
    id: "cust_5", name: "Sanjar Mirzayev",   phone: "+998 99 567 8901",
    tier: "GOLD",     points: 2100, totalSpent: 1750000, visitCount: 14, lastVisit: "2026-06-06",
    birthday: "1992-09-12", isActive: true, createdAt: "2026-01-28",
  },
  {
    id: "cust_6", name: "Feruza Holmatova",  phone: "+998 94 678 9012",
    tier: "SILVER",   points: 760,  totalSpent: 640000,  visitCount: 6,  lastVisit: "2026-05-30",
    isActive: false, createdAt: "2026-03-15",
    notes: "Telefon raqami o'zgardi",
  },
];

// ── Initial Loyalty Transactions ──────────────────────────────
export const INITIAL_LOYALTY_TXN: import("./types").LoyaltyTransaction[] = [
  { id: "lpt_1", customerId: "cust_1", customerName: "Akbar Toshmatov",   type: "EARN",   points: 285,  description: "Choyxona buyurtmasi — 285 000 so'm",    createdAt: "2026-06-08" },
  { id: "lpt_2", customerId: "cust_3", customerName: "Jasur Rahimov",     type: "REDEEM", points: -500, description: "500 ball uchun 50 000 so'm chegirma",     createdAt: "2026-06-09" },
  { id: "lpt_3", customerId: "cust_2", customerName: "Malika Yusupova",   type: "EARN",   points: 80,   description: "Fast-food buyurtmasi — 80 000 so'm",     createdAt: "2026-06-07" },
  { id: "lpt_4", customerId: "cust_3", customerName: "Jasur Rahimov",     type: "BONUS",  points: 200,  description: "Tug'ilgan kun bonusi 🎂",                  createdAt: "2026-06-01" },
  { id: "lpt_5", customerId: "cust_5", customerName: "Sanjar Mirzayev",   type: "EARN",   points: 140,  description: "VIP Kafe — 140 000 so'm",                 createdAt: "2026-06-06" },
];

// ── Initial Discounts ─────────────────────────────────────────
export const INITIAL_DISCOUNTS: import("./types").Discount[] = [
  {
    id: "disc_1",
    name: "Kechki 20% chegirma",
    code: "KECH20",
    type: "PERCENTAGE",
    status: "ACTIVE",
    value: 20,
    minOrderAmount: 50000,
    maxUsageCount: 100,
    usageCount: 23,
    target: "ALL",
    description: "Soat 18:00 dan keyin barcha buyurtmalarga 20% chegirma",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    createdAt: "2026-06-01",
  },
  {
    id: "disc_2",
    name: "Choyxona 10 000 so'm aksiya",
    code: "CHOY10",
    type: "FIXED_AMOUNT",
    status: "ACTIVE",
    value: 10000,
    minOrderAmount: 40000,
    maxUsageCount: 50,
    usageCount: 8,
    target: "STALL",
    stallId: "stall_2",
    stallName: "Bog' Choyxonasi",
    description: "Choyxonada 40 000 so'mdan yuqori buyurtmalarga 10 000 so'm chegirma",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    createdAt: "2026-06-01",
  },
  {
    id: "disc_3",
    name: "2 ta burger — 1 tasi bepul",
    type: "BUY_X_GET_Y",
    status: "ACTIVE",
    value: 0,
    buyQty: 2,
    getQty: 1,
    usageCount: 5,
    target: "STALL",
    stallId: "stall_1",
    stallName: "Markaziy Fast-Food",
    description: "2 ta burger sotib olsangiz, 3-tasi bepul",
    startDate: "2026-06-09",
    endDate: "2026-06-15",
    createdAt: "2026-06-09",
  },
  {
    id: "disc_4",
    name: "Yozgi muzqaymoq aksiyasi",
    type: "PERCENTAGE",
    status: "SCHEDULED",
    value: 30,
    usageCount: 0,
    target: "CATEGORY",
    categoryTarget: "DESSERT",
    description: "Barcha desert va muzqaymoqlarga 30% chegirma",
    startDate: "2026-07-01",
    endDate: "2026-08-31",
    createdAt: "2026-06-09",
  },
  {
    id: "disc_5",
    name: "VIP mijoz kod",
    code: "VIP2026",
    type: "PERCENTAGE",
    status: "ACTIVE",
    value: 15,
    maxUsageCount: 200,
    usageCount: 47,
    target: "ALL",
    description: "VIP mijozlar uchun 15% chegirma",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    createdAt: "2026-01-01",
  },
];

// ── Blueprint snippets (unchanged) ───────────────────────────
export const PRISMA_SCHEMA_CODE = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
generator client {
  provider = "prisma-client-js"
}

enum Role          { ADMIN MANAGER SELLER ATTENDANT CHEF WAITER }
enum StallType     { FASTFOOD TEAHOUSE CAFE STALL ATTRACTION SERVICE }
enum StallStatus   { ACTIVE CLOSED MAINTENANCE }
enum PaymentMethod { CASH CARD MOBILE }
enum SyncStatus    { SYNCED PENDING }
enum ProductCategory { FOOD DRINK DESSERT SNACK TEA HOOKAH TICKET SOUVENIR OTHER }

model Stall {
  id          String      @id @default(uuid())
  name        String
  type        StallType
  status      StallStatus @default(ACTIVE)
  description String?
  openTime    String?
  closeTime   String?
  tableCount  Int?
  floor       String?
  createdAt   DateTime    @default(now())
  products    Product[]
  sales       Transaction[]
  tables      Table[]
}

model Product {
  id            String          @id @default(uuid())
  name          String
  category      ProductCategory
  price         Decimal         @db.Decimal(12,2)
  costPrice     Decimal?        @db.Decimal(12,2)
  stock         Int             @default(0)
  minStockAlert Int             @default(5)
  unit          String          @default("dona")
  prepTime      Int             @default(0)
  isAvailable   Boolean         @default(true)
  description   String?
  stallId       String
  stall         Stall           @relation(fields:[stallId], references:[id], onDelete:Cascade)
  createdAt     DateTime        @default(now())
}

model Transaction {
  id            String        @id @default(uuid())
  amount        Decimal       @db.Decimal(12,2)
  paymentMethod PaymentMethod @default(CASH)
  employeeId    String
  stallId       String
  items         Json
  syncStatus    SyncStatus    @default(SYNCED)
  createdAt     DateTime      @default(now())
  employee      User          @relation(fields:[employeeId], references:[id])
  stall         Stall         @relation(fields:[stallId],    references:[id])
}`;

export const API_DOCS_CODE = `================================================================
REST API — Park Central v3.0
================================================================

POST   /api/auth/login
GET    /api/stalls
POST   /api/stalls
PUT    /api/stalls/:id
DELETE /api/stalls/:id

GET    /api/products?stallId=
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

POST   /api/pos/sale
POST   /api/pos/sync-bulk

POST   /api/attendance/check-in
POST   /api/attendance/check-out
GET    /api/payroll/calculate?employeeId=&from=&to=

WebSocket channels:
  stall_sale_registered  { stallId, amount, employeeName }
  stock_warning          { productId, name, currentStock }
  order_status_changed   { orderId, status }
  employee_check_in      { employeeId, time }`;

export const SYNC_ENGINE_CODE = `// hooks/useOfflineSyncEngine.ts
export function useOfflineSyncEngine() {
  const syncWithServer = async (queue) => {
    const res = await fetch("/api/pos/sync-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions: queue }),
    });
    return res.json();
  };
  return { syncWithServer };
}`;
