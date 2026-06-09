// ============================================================
// PARK CENTRAL — Static Seed Data & Blueprint Code Constants
// ============================================================

import type { Stall, Employee, Product, Transaction, AttendanceLog, WsEvent } from "./types";

export const STALLS: Stall[] = [
  { id: "stall_1", name: "Markaziy Fast-Food Restorani", type: "CAFE" },
  { id: "stall_2", name: "Muzqaymoq va Shakar-paxta", type: "STALL" },
  { id: "stall_3", name: "Sirk va Ko'ngilochar Attraksion", type: "ATTRACTION" },
  { id: "stall_4", name: "Suvenirlar va O'yinchoqlar Markazi", type: "STALL" },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: "emp_1", name: "Dilshod Abdirazzokov", role: "MANAGER",   baseSalary: 6500000, bonusPercentage: 2, isCheckedIn: true,  lastCheckIn: "08:30", username: "dilshod", password: "111" },
  { id: "emp_2", name: "Shahzod Alimov",       role: "SELLER",    baseSalary: 3500000, bonusPercentage: 5, isCheckedIn: true,  lastCheckIn: "08:45", username: "shahzod", password: "222" },
  { id: "emp_3", name: "Laylo Karimova",        role: "SELLER",    baseSalary: 3200000, bonusPercentage: 7, isCheckedIn: false,                        username: "laylo",   password: "333" },
  { id: "emp_4", name: "Jamshid Tojiyev",       role: "ATTENDANT", baseSalary: 4000000, bonusPercentage: 4, isCheckedIn: true,  lastCheckIn: "08:50", username: "jamshid", password: "444" },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: "prod_1", name: "Sirlangan Burger Klasik",      price: 32000, stock: 45,  minStockAlert: 10, stallId: "stall_1", stallName: "Markaziy Fast-Food Restorani" },
  { id: "prod_2", name: "Shaurma Mol go'shtli",         price: 38000, stock: 28,  minStockAlert: 8,  stallId: "stall_1", stallName: "Markaziy Fast-Food Restorani" },
  { id: "prod_3", name: "Coca-Cola 0.5L",               price: 10000, stock: 9,   minStockAlert: 15, stallId: "stall_1", stallName: "Markaziy Fast-Food Restorani" },
  { id: "prod_4", name: "Muzqaymoq Gilosli",            price: 14000, stock: 3,   minStockAlert: 5,  stallId: "stall_2", stallName: "Muzqaymoq va Shakar-paxta" },
  { id: "prod_5", name: "Shakar-paxta (Katta vanna)",   price: 12000, stock: 22,  minStockAlert: 6,  stallId: "stall_2", stallName: "Muzqaymoq va Shakar-paxta" },
  { id: "prod_6", name: "Katta Tsirk Chiptasi",         price: 50000, stock: 120, minStockAlert: 20, stallId: "stall_3", stallName: "Sirk va Ko'ngilochar Attraksion" },
  { id: "prod_7", name: "Esdalik Bog' Flagi",           price: 25000, stock: 12,  minStockAlert: 5,  stallId: "stall_4", stallName: "Suvenirlar va O'yinchoqlar Markazi" },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_001", amount: 142000, paymentMethod: "CARD",
    employeeId: "emp_2", employeeName: "Shahzod Alimov",
    stallId: "stall_1", stallName: "Markaziy Fast-Food Restorani",
    items: [
      { productName: "Sirlangan Burger Klasik", quantity: 3, price: 32000 },
      { productName: "Coca-Cola 0.5L",          quantity: 2, price: 10000 },
      { productName: "Shaurma Mol go'shtli",    quantity: 1, price: 38000 },
    ],
    createdAt: "10:14:12", syncStatus: "SYNCED",
  },
  {
    id: "txn_002", amount: 40000, paymentMethod: "MOBILE",
    employeeId: "emp_3", employeeName: "Laylo Karimova",
    stallId: "stall_2", stallName: "Muzqaymoq va Shakar-paxta",
    items: [
      { productName: "Shakar-paxta (Katta vanna)", quantity: 2, price: 12000 },
      { productName: "Muzqaymoq Gilosli",          quantity: 1, price: 14000 },
    ],
    createdAt: "10:05:43", syncStatus: "SYNCED",
  },
  {
    id: "txn_003", amount: 150000, paymentMethod: "CASH",
    employeeId: "emp_4", employeeName: "Jamshid Tojiyev",
    stallId: "stall_3", stallName: "Sirk va Ko'ngilochar Attraksion",
    items: [{ productName: "Katta Tsirk Chiptasi", quantity: 3, price: 50000 }],
    createdAt: "09:48:21", syncStatus: "SYNCED",
  },
];

export const INITIAL_ATTENDANCE: AttendanceLog[] = [
  { id: "att_1", employeeName: "Dilshod Abdirazzokov", role: "Menejer",    type: "KIRISH", time: "08:30" },
  { id: "att_2", employeeName: "Shahzod Alimov",       role: "Sotuvchi",   type: "KIRISH", time: "08:45" },
  { id: "att_3", employeeName: "Jamshid Tojiyev",      role: "Nazoratchi", type: "KIRISH", time: "08:50" },
];

export const INITIAL_WS_EVENTS: WsEvent[] = [
  { id: "ws_1", time: "10:14:12", text: "Kassa sotuvi: Shahzod Alimov (Fast-Food) — 142 000 so'm",            type: "success" },
  { id: "ws_2", time: "10:11:05", text: "[DIQQAT] Muzqaymoq Gilosli zaxirasi kam (3 dona kutilmoqda!)",        type: "warning" },
  { id: "ws_3", time: "08:50:00", text: "Xodim Jamshid Tojiyev Sirk rastasida ish boshladi (Check-in)",        type: "info"    },
];

// ── Blueprint source-code snippets ────────────────────────────────────────────

export const PRISMA_SCHEMA_CODE = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role          { ADMIN SELLER ATTENDANT MANAGER }
enum StallType     { STALL ATTRACTION CAFE SERVICE }
enum PaymentMethod { CASH CARD MOBILE }
enum SyncStatus    { SYNCED PENDING }
enum AttendanceStatus { PRESENT ABSENT LATE EXCUSED }

model User {
  id               String        @id @default(uuid())
  email            String        @unique
  passwordHash     String
  name             String
  role             Role          @default(SELLER)
  baseSalary       Decimal       @db.Decimal(12, 2)
  bonusPercentage  Decimal       @db.Decimal(5, 2)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  sales            Transaction[]
  attendances      Attendance[]
  payrolls         Payroll[]
}

model Location {
  id        String      @id @default(uuid())
  name      String      @unique
  type      StallType   @default(STALL)
  status    String      @default("ACTIVE")
  createdAt DateTime    @default(now())
  products  Product[]
  sales     Transaction[]
}

model Product {
  id            String   @id @default(uuid())
  name          String
  price         Decimal  @db.Decimal(12, 2)
  stock         Int      @default(0)
  minStockAlert Int      @default(5)
  locationId    String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  location      Location @relation(fields: [locationId], references: [id], onDelete: Cascade)
}

model Transaction {
  id            String        @id @default(uuid())
  amount        Decimal       @db.Decimal(12, 2)
  paymentMethod PaymentMethod @default(CASH)
  employeeId    String
  locationId    String
  items         Json
  syncStatus    SyncStatus    @default(SYNCED)
  createdAt     DateTime      @default(now())
  employee      User          @relation(fields: [employeeId], references: [id])
  location      Location      @relation(fields: [locationId], references: [id])
  @@index([employeeId])
  @@index([locationId])
  @@index([createdAt])
}

model Attendance {
  id         String           @id @default(uuid())
  employeeId String
  checkIn    DateTime         @default(now())
  checkOut   DateTime?
  status     AttendanceStatus @default(PRESENT)
  createdAt  DateTime         @default(now())
  employee   User             @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  @@index([employeeId])
}

model Payroll {
  id          String   @id @default(uuid())
  employeeId  String
  periodStart DateTime
  periodEnd   DateTime
  basePay     Decimal  @db.Decimal(12, 2)
  bonusPay    Decimal  @db.Decimal(12, 2)
  totalPaid   Decimal  @db.Decimal(12, 2)
  paidAt      DateTime @default(now())
  status      String   @default("PAID")
  employee    User     @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  @@index([employeeId])
}`;

export const API_DOCS_CODE = `================================================================
1. AUTHENTICATION (JWT)
================================================================
POST /api/auth/login
Request:  { "email": "shahzod@park.uz", "password": "..." }
Response: { "token": "<JWT>", "user": { "id", "name", "role" } }

================================================================
2. POS — SALES GATEWAY
================================================================
POST /api/pos/sale          — online sale, decrements stock
POST /api/pos/sync-bulk     — batch offline→online sync

POST /api/pos/sale
Headers: Authorization: Bearer <token>
Body:
{
  "amount": 142000,
  "paymentMethod": "CARD",
  "stallId": "stall_1",
  "items": [
    { "productId": "prod_1", "name": "Burger", "quantity": 3, "price": 32000 }
  ]
}
Response 201:
{ "success": true, "transactionId": "txn_xxx", "newStock": [...] }

POST /api/pos/sync-bulk
Body: { "transactions": [ ...OfflineTransaction[] ] }
Response 200: { "success": true, "syncedCount": 4 }

================================================================
3. ATTENDANCE & PAYROLL
================================================================
POST /api/attendance/check-in
Body:     { "employeeId": "emp_2" }
Response: { "attendanceId": "att_91", "checkIn": "2026-06-09T08:30:00Z" }

GET /api/payroll/calculate
  ?employeeId=emp_2&periodStart=2026-06-01&periodEnd=2026-06-09
Response:
{
  "baseCompensation": 1050000,
  "totalCommissionBonus": 85000,
  "payrollTotal": 1135000
}

================================================================
4. SOCKET.IO — REAL-TIME CHANNELS
================================================================
Server → Client events:
  stall_sale_registered  { stallId, amount, employeeName }
  stock_warning          { productId, name, currentStock }
  employee_check_in      { employeeId, time }`;

export const SYNC_ENGINE_CODE = `// hooks/useOfflineSyncEngine.ts
import { useState } from "react";

export interface OfflineTransaction {
  id: string;
  amount: number;
  paymentMethod: string;
  employeeId: string;
  stallId: string;
  items: unknown[];
  createdAt: string;
}

export function useOfflineSyncEngine() {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncWithServer = async (queue: OfflineTransaction[]) => {
    if (queue.length === 0) return { success: true, count: 0 };
    setIsSyncing(true);

    try {
      const res = await fetch("/api/pos/sync-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: queue }),
      });

      if (!res.ok) throw new Error("Sync API error");

      const result = await res.json();
      return { success: true, count: result.syncedCount };

    } catch (err) {
      console.error("Sync failed:", err);
      return { success: false, error: err };
    } finally {
      setIsSyncing(false);
    }
  };

  return { syncWithServer, isSyncing };
}`;
