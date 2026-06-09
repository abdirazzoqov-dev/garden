"use client";

import { AnimatePresence } from "motion/react";
import { useAppState } from "../components/hooks/useAppState";
import Header from "../components/Header";
import NavigationTabs from "../components/NavigationTabs";
import POSTab from "../components/pos";
import DashboardTab from "../components/dashboard";
import HRTab from "../components/hr";
import BlueprintTab from "../components/blueprint";
import AuthModal from "../components/AuthModal";

export default function ParkCentralApp() {
  const state = useAppState();

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#2D3A2D] font-sans pb-16">

      {/* ── Top navigation bar ─────────────────────────────── */}
      <Header isOnline={state.isOnline} setIsOnline={state.setIsOnline} />

      {/* ── Main content ───────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">

        {/* Tab navigation */}
        <NavigationTabs
          activeTab={state.activeTab}
          onTabChange={(tab) => {
            state.setActiveTab(tab);
            if (tab === "dashboard" && !state.aiReport) {
              state.getAiDashboardAdvice();
            }
          }}
        />

        {/* Tab content with exit animations */}
        <AnimatePresence mode="wait">

          {state.activeTab === "pos" && (
            <POSTab
              stalls={state.stalls}
              employees={state.employees}
              products={state.products}
              cart={state.cart}
              wsEvents={state.wsEvents}
              syncQueue={state.syncQueue}
              selectedStallId={state.selectedStallId}
              activeSellerId={state.activeSellerId}
              paymentMethod={state.paymentMethod}
              isOnline={state.isOnline}
              onSelectStall={(id) => {
                state.setSelectedStallId(id);
                // clear cart when switching stalls (handled in hook's setSelectedStallId side-effect
                // but we also reset cart here for safety)
              }}
              onOpenSellerAuth={(empId) => state.openAuthModal(empId, "switch_seller")}
              onAddToCart={state.handleAddToCart}
              onUpdateCartQty={state.handleUpdateCartQty}
              onSetPayment={state.setPaymentMethod}
              onCheckout={state.handleCheckout}
              onSyncNow={() => {
                state.setIsOnline(true);
                setTimeout(() => state.runOfflineSync(), 100);
              }}
            />
          )}

          {state.activeTab === "dashboard" && (
            <DashboardTab
              stalls={state.stalls}
              products={state.products}
              transactions={state.transactions}
              totalRevenue={state.totalParkRevenue}
              totalProductsSold={state.totalProductsSold}
              criticalStockCount={state.criticalStockCount}
              syncQueueLength={state.syncQueue.length}
              isSyncing={state.isSyncing}
              syncLogs={state.syncLogs}
              aiReport={state.aiReport}
              isGeneratingAi={state.isGeneratingAi}
              onRunSync={state.runOfflineSync}
              onGetAiAdvice={state.getAiDashboardAdvice}
            />
          )}

          {state.activeTab === "hr" && (
            <HRTab
              employees={state.employees}
              attendanceLogs={state.attendanceLogs}
              calculatePayroll={state.calculatePayroll}
              onOpenAuth={state.openAuthModal}
            />
          )}

          {state.activeTab === "blueprint" && (
            <BlueprintTab
              subTab={state.blueprintSubTab}
              onSubTabChange={state.setBlueprintSubTab}
              copiedText={state.copiedText}
              onCopy={state.copyToClipboard}
            />
          )}

        </AnimatePresence>
      </main>

      {/* ── Auth modal (global overlay) ─────────────────────── */}
      <AuthModal
        pendingSellerId={state.pendingSellerId}
        pendingActionType={state.pendingActionType}
        employees={state.employees}
        authUsername={state.authUsername}
        authPassword={state.authPassword}
        authError={state.authError}
        onUsernameChange={state.setAuthUsername}
        onPasswordChange={state.setAuthPassword}
        onSubmit={state.handleAuthSubmit}
        onCancel={state.closeAuthModal}
      />

    </div>
  );
}
