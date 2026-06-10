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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* KPI cards */}
      <MetricCards
        totalRevenue={totalRevenue}
        totalProductsSold={totalProductsSold}
        criticalStockCount={criticalStockCount}
        syncQueueLength={syncQueueLength}
      />

      {/* Offline sync banner */}
      {syncQueueLength > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5
                        rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin shrink-0" />
            <div>
              <p className="text-sm font-[700] text-amber-900">
                Sinxronlanmagan o'zgarishlar mavjud
              </p>
              <p className="text-xs text-amber-700">
                {syncQueueLength} ta tranzaksiya PostgreSQL bazasiga yuborilishi kerak
              </p>
            </div>
          </div>
          <button
            onClick={onRunSync}
            disabled={isSyncing}
            className="btn btn-sm shrink-0"
            style={{ background: "#1e3d1f", color: "white", border: "none" }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            Sinxronlash (Push)
          </button>
        </div>
      )}

      {/* Sync logs */}
      {syncLogs.length > 0 && (
        <div className="card p-5 font-mono text-xs max-h-[160px] overflow-y-auto space-y-1.5">
          <p className="section-label flex items-center gap-1.5 pb-2 border-b border-[#f0ede8]">
            <Activity className="w-3 h-3" /> Sinxronizatsiya loglari
          </p>
          {syncLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-2 fade-in-up text-[11px]">
              <span className="text-[#4d8751] font-[700] shrink-0">▶</span>
              <span className="text-[#283028]">{log}</span>
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

      {/* Transaction log */}
      <TransactionTable transactions={transactions} />
    </motion.div>
  );
}
