// ============================================================
// PARK CENTRAL — Global TypeScript Type Definitions
// ============================================================

export type ActiveTab = "pos" | "dashboard" | "hr" | "blueprint";
export type BlueprintSubTab = "prisma" | "api" | "sync";
export type PaymentMethod = "CASH" | "CARD" | "MOBILE";
export type SyncStatus = "SYNCED" | "PENDING";
export type EmployeeRole = "ADMIN" | "SELLER" | "ATTENDANT" | "MANAGER";
export type StallType = "STALL" | "ATTRACTION" | "CAFE" | "SERVICE";
export type AttendanceType = "KIRISH" | "CHIQISH";
export type WsEventType = "info" | "warning" | "success";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStockAlert: number;
  stallId: string;
  stallName: string;
}

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

export interface Stall {
  id: string;
  name: string;
  type: StallType;
}

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

export interface AttendanceLog {
  id: string;
  employeeName: string;
  role: string;
  type: AttendanceType;
  time: string;
}

export interface WsEvent {
  id: string;
  time: string;
  text: string;
  type: WsEventType;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PayrollResult {
  dailyBase: number;
  salesVolume: number;
  bonusAmount: number;
  totalWage: number;
}

export type PendingActionType = "switch_seller" | "check_toggle";
