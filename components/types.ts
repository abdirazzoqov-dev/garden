// ============================================================
// PARK CENTRAL — Global TypeScript Type Definitions
// ============================================================

export type ActiveTab = "pos" | "dashboard" | "hr" | "orders" | "management" | "blueprint";
export type BlueprintSubTab = "prisma" | "api" | "sync";
export type ManagementSubTab = "stalls" | "products";
export type PaymentMethod = "CASH" | "CARD" | "MOBILE";
export type SyncStatus = "SYNCED" | "PENDING";
export type EmployeeRole = "ADMIN" | "SELLER" | "ATTENDANT" | "MANAGER" | "CHEF" | "WAITER";
export type StallType = "STALL" | "ATTRACTION" | "CAFE" | "SERVICE" | "FASTFOOD" | "TEAHOUSE";
export type StallStatus = "ACTIVE" | "CLOSED" | "MAINTENANCE";
export type AttendanceType = "KIRISH" | "CHIQISH";
export type WsEventType = "info" | "warning" | "success";
export type ProductCategory =
  | "FOOD" | "DRINK" | "DESSERT" | "SNACK"
  | "TICKET" | "SOUVENIR" | "TEA" | "HOOKAH" | "OTHER";

// ── Table (Stol) ──────────────────────────────────────────────
export type TableStatus = "FREE" | "OCCUPIED" | "RESERVED" | "BILL_REQUESTED";

export interface Table {
  id: string;
  number: number;          // 1, 2, 3 ...
  stallId: string;
  stallName: string;
  capacity: number;        // necha kishi sig'adi
  status: TableStatus;
  currentOrderId?: string; // faol buyurtma ID
  waiterName?: string;
  reservedFor?: string;    // rezervatsiya uchun ism
  reservedAt?: string;
}

// ── Order (Buyurtma) ──────────────────────────────────────────
export type OrderStatus =
  | "NEW"           // yangi qabul qilindi
  | "CONFIRMED"     // ofitsiant tasdiqladi
  | "PREPARING"     // oshpazxonada tayyorlanmoqda
  | "READY"         // tayyor, yetkazilishi kutilmoqda
  | "SERVED"        // stol oldiga yetkazildi
  | "BILL_REQUESTED"// hisob so'raldi
  | "PAID"          // to'landi va yopildi
  | "CANCELLED";    // bekor qilindi

export type OrderType = "DINE_IN" | "TAKEAWAY" | "FASTFOOD";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  note?: string;           // "o'tkir qilmang", "sous ko'p"
  status: "PENDING" | "PREPARING" | "READY" | "SERVED";
  prepTime?: number;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  stallId: string;
  stallName: string;
  tableId?: string;        // DINE_IN uchun
  tableNumber?: number;
  waiterId?: string;
  waiterName?: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  guestCount?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  servedAt?: string;
  paidAt?: string;
}

// ── Stall ─────────────────────────────────────────────────────
export interface Stall {
  id: string;
  name: string;
  type: StallType;
  status: StallStatus;
  description?: string;
  openTime?: string;
  closeTime?: string;
  tableCount?: number;
  floor?: string;
  createdAt: string;
}

// ── Product ───────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice?: number;
  stock: number;
  minStockAlert: number;
  unit?: string;
  prepTime?: number;
  isAvailable: boolean;
  stallId: string;
  stallName: string;
  description?: string;
  createdAt: string;
}

// ── Employee ──────────────────────────────────────────────────
export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  baseSalary: number;
  bonusPercentage: number;
  isCheckedIn: boolean;
  username: string;
  password: string;
  lastCheckIn?: string;
  lastCheckOut?: string;
}

// ── Transaction ───────────────────────────────────────────────
export interface TransactionItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  employeeId: string;
  employeeName: string;
  stallId: string;
  stallName: string;
  items: TransactionItem[];
  createdAt: string;
  syncStatus: SyncStatus;
}

// ── Attendance ────────────────────────────────────────────────
export interface AttendanceLog {
  id: string;
  employeeName: string;
  role: string;
  type: AttendanceType;
  time: string;
}

// ── WebSocket event ───────────────────────────────────────────
export interface WsEvent {
  id: string;
  time: string;
  text: string;
  type: WsEventType;
}

// ── Cart ──────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

// ── Payroll ───────────────────────────────────────────────────
export interface PayrollResult {
  dailyBase: number;
  salesVolume: number;
  bonusAmount: number;
  totalWage: number;
}

// ── Auth ──────────────────────────────────────────────────────
export type PendingActionType = "switch_seller" | "check_toggle";

// ── Management forms ──────────────────────────────────────────
export type ModalMode = "create" | "edit";

export interface StallFormData {
  name: string;
  type: StallType;
  status: StallStatus;
  description: string;
  openTime: string;
  closeTime: string;
  tableCount: number;
  floor: string;
}

export interface ProductFormData {
  name: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  unit: string;
  prepTime: number;
  isAvailable: boolean;
  stallId: string;
  description: string;
}
