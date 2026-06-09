"use client";

import { RefreshCw, Activity } from "lucide-react";
import { motion } from "motion/react";
import MetricCards from "./MetricCards";
import RevenueChart from "./RevenueChart";
import InventoryPanel from "./InventoryPanel";
import AiAdvisor from "./AiAdvisor";
import TransactionTable from "./TransactionTable";
import type { Stall, Product, Transaction } from "../types";

interface DashboardTabProps {
  stalls: Stall[];
  products: Product[];
  transactions: Transaction[];
  totalRevenue: number;
  totalProductsSold: number;
  criticalStockCount: number;
  syncQueueLength: number;
  isSyncing: boolean;
  syncLogs: string[];
  aiReport: string;
  isGeneratingAi: boolean;
  onRunSync: () => void;
  onGetAiAdvice: () => void;
}

export default function DashboardTab({
  stalls, products, transactions,
  totalRevenue, totalProductsSold, criticalStockCount,
  syncQueueLength, isSyncing, syncLogs,
  aiReport, isGeneratingAi,
  onRunSync, onGetAiAdvice,
}: DashboardTabProps) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      {/* KPI Cards */}
      <MetricCards
        totalRevenue={totalRevenue}
        totalProductsSold={totalProductsSold}
        criticalStockCount={criticalStockCount}
        syncQueueLength={syncQueueLength}
      />

      {/* Offline sync banner */}
      {syncQueueLength > 0 && (
        <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-amber-200 border-t-amber-700 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Tarmoqsiz rejimda saqlangan o'zgarishlar mavjud
              </p>
              <p className="text-xs text-amber-800">
                Ushbu tranzaksiyalarni asosiy PostgreSQL bazasiga yozish lozim.
              </p>
            </div>
          </div>
          <button
            onClick={onRunSync}
            disabled={isSyncing}
            className="bg-[#2D452E] hover:bg-[#3A5A40] text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow shrink-0 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            Sinxronizatsiyani ishga tushirish
          </button>
        </div>
      )}

      {/* Sync logs */}
      {syncLogs.length > 0 && (
        <div className="bg-[#F2F4EF] p-5 rounded-2xl border border-[#DAD7CD] font-mono text-xs text-[#2D3A2D] max-h-[160px] overflow-y-auto space-y-1">
          <p className="text-[#588157] pb-2 border-b border-[#DAD7CD] mb-2 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
            <Activity className="h-3 w-3" /> Sinxronizatsiya loglari:
          </p>
          {syncLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#A3B18A] font-bold shrink-0">▶</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart stalls={stalls} transactions={transactions} />
        <InventoryPanel products={products} />
      </div>

      {/* AI Advisor */}
      <AiAdvisor
        aiReport={aiReport}
        isGenerating={isGeneratingAi}
        onRefresh={onGetAiAdvice}
      />

      {/* Transaction table */}
      <TransactionTable transactions={transactions} />
    </motion.div>
  );
}
