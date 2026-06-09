// ============================================================
// PARK CENTRAL — Global TypeScript Type Definitions
// ============================================================

export type ActiveTab = "pos" | "dashboard" | "hr" | "management" | "blueprint";
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
  | "FOOD"
  | "DRINK"
  | "DESSERT"
  | "SNACK"
  | "TICKET"
  | "SOUVENIR"
  | "TEA"
  | "HOOKAH"
  | "OTHER";

// ── Stall ─────────────────────────────────────────────────────
export interface Stall {
  id: string;
  name: string;
  type: StallType;
  status: StallStatus;
  description?: string;
  openTime?: string;   // e.g. "09:00"
  closeTime?: string;  // e.g. "22:00"
  tableCount?: number; // for TEAHOUSE / CAFE
  floor?: string;      // e.g. "1-qavat", "Ochiq maydon"
  createdAt: string;
}

// ── Product ───────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice?: number;   // purchase / production cost
  stock: number;
  minStockAlert: number;
  unit?: string;        // "dona", "kg", "litr", "porsiya"
  prepTime?: number;    // minutes – for FASTFOOD / TEAHOUSE
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

// ── Management modal ──────────────────────────────────────────
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
