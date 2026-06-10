"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon }              from "lucide-react";
import { useAppState }       from "../components/hooks/useAppState";
import { useAuthState, AuthContext } from "../components/hooks/useAuth";
import { ROLE_ACCESS }       from "../components/types";
import type { ActiveTab }    from "../components/types";
import Header                from "../components/Header";
import NavigationTabs        from "../components/NavigationTabs";
import LoginPage             from "../components/auth/LoginPage";
import StallPanels           from "../components/stall-panels";
import POSTab                from "../components/pos";
import OrdersTab             from "../components/orders";
import KDSTab                from "../components/kds";
import DashboardTab          from "../components/dashboard";
import HRTab                 from "../components/hr";
import CustomersTab          from "../components/customers";
import ReportsTab            from "../components/reports";
import DiscountsTab          from "../components/discounts";
import ManagementTab         from "../components/management";
import BlueprintTab          from "../components/blueprint";
import AuthModal             from "../components/AuthModal";
import ReceiptModal          from "../components/receipt/ReceiptModal";
import DayCloseModal         from "../components/shift/DayCloseModal";

// ── Inner app (requires auth) ─────────────────────────────────
function AppInner() {
  const s    = useAppState();
  const auth = useAuthState();

  // ── Set default tab when user logs in ──────────────────────
  useEffect(() => {
    if (auth.user) {
      const def = ROLE_ACCESS[auth.user.role].defaultTab;
      s.setActiveTab(def);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.id]);

  // ── If not logged in → show login page ─────────────────────
  if (!auth.user) {
    return (
      <LoginPage
        onLogin={auth.login}
        loginError={auth.loginError}
        isLoading={auth.isLoading}
      />
    );
  }

  // ── Stall-scoped filter ────────────────────────────────────
  // Role-scoped users only see their own stall's data
  const stallScoped  = ROLE_ACCESS[auth.user.role].stallScoped;
  const scopedStallId = auth.user.stallId;

  const visibleStalls = stallScoped && scopedStallId
    ? s.stalls.filter((st) => st.id === scopedStallId)
    : s.stalls;

  const visibleProducts = stallScoped && scopedStallId
    ? s.products.filter((p) => p.stallId === scopedStallId)
    : s.products;

  const visibleOrders = stallScoped && scopedStallId
    ? s.orders.filter((o) => o.stallId === scopedStallId)
    : s.orders;

  // ── Tab guard: redirect to allowed if current not allowed ──
  const activeTab: ActiveTab = auth.canAccess(s.activeTab)
    ? s.activeTab
    : ROLE_ACCESS[auth.user.role].defaultTab;

  // ── Shared prop bundles ────────────────────────────────────
  const orderActions = {
    tables:                  s.tables,
    onOpenTable:             s.handleOpenTable,
    onAddItemToOrder:        s.handleAddItemToOrder,
    onRemoveItemFromOrder:   s.handleRemoveItemFromOrder,
    onUpdateOrderStatus:     s.handleUpdateOrderStatus,
    onPayOrder:              s.handlePayOrder,
    onSetReservation:        s.handleSetReservation,
    onCancelReservation:     s.handleCancelReservation,
    onUpdateOrderItemStatus: s.handleUpdateOrderItemStatus,
  };

  const posActions = {
    cart:             s.cart,
    paymentMethod:    s.paymentMethod,
    isOnline:         s.isOnline,
    syncQueue:        s.syncQueue,
    activeSellerId:   auth.user.id,   // always set to logged-in user
    wsEvents:         s.wsEvents,
    onAddToCart:      s.handleAddToCart,
    onUpdateCartQty:  s.handleUpdateCartQty,
    onSetPayment:     s.setPaymentMethod,
    onCheckout:       s.handleCheckout,
    onSyncNow:        () => { s.setIsOnline(true); setTimeout(() => s.runOfflineSync(), 100); },
    onOpenSellerAuth: (id: string) => s.openAuthModal(id, "switch_seller"),
  };

  return (
    <AuthContext.Provider value={auth}>
      <div className="min-h-screen bg-[#f7f5f2] text-[#283028] pb-16">

        {/* ── Header ── */}
        <Header
          isOnline={s.isOnline}
          setIsOnline={s.setIsOnline}
          isDark={s.isDark}
          onToggleDark={s.toggleDark}
          notifications={s.notifications}
          unreadCount={s.unreadCount}
          onMarkRead={s.markNotifRead}
          onMarkAllRead={s.markAllNotifsRead}
          onDismiss={s.dismissNotif}
          onClearAll={s.clearAllNotifs}
          onNavigate={(tab) => {
            if (auth.canAccess(tab as ActiveTab)) s.setActiveTab(tab as ActiveTab);
          }}
          user={auth.user}
          onLogout={auth.logout}
        />

        {/* ── Main ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">

          {/* ── Role banner for scoped users ── */}
          {stallScoped && auth.user.stallName && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl
                         bg-[#eef7ef] border border-[#b8d9ba]"
            >
              <div className="w-8 h-8 rounded-full bg-[#1e3d1f] flex items-center justify-center
                              text-sm font-[800] text-[#91c494] shrink-0">
                {auth.user.avatar}
              </div>
              <div>
                <p className="text-sm font-[800] text-[#1e3d1f]">
                  Xush kelibsiz, {auth.user.name.split(" ")[0]}!
                </p>
                <p className="text-[11px] text-[#4d8751] font-[600]">
                  Siz <strong>{auth.user.stallName}</strong> rastasiga biriktirilgansiz
                </p>
              </div>
            </motion.div>
          )}

          {/* Navigation tabs + Day-close */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <NavigationTabs
                activeTab={activeTab}
                allowedTabs={auth.allowedTabs}
                pendingOrdersCount={s.pendingOrdersCount}
                kitchenCount={visibleOrders.filter(
                  (o) => o.status === "CONFIRMED" || o.status === "PREPARING"
                ).length}
                onTabChange={(tab) => {
                  if (auth.canAccess(tab)) {
                    s.setActiveTab(tab);
                    if (tab === "dashboard" && !s.aiReport) s.getAiDashboardAdvice();
                  }
                }}
              />
            </div>

            {/* Day-close — only managers/admin */}
            {(auth.user.role === "ADMIN" || auth.user.role === "MANAGER") && (
              <button
                onClick={() => s.setDayCloseOpen(true)}
                className="btn btn-sm bg-slate-700 hover:bg-slate-800 text-white border-0 shrink-0 mb-8"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Smena yopish</span>
              </button>
            )}
          </div>

          {/* ── Tab content ── */}
          <AnimatePresence mode="wait">

            {/* Rastalar — har biri o'z panelida + admin monitoring */}
            {activeTab === "stalls" && (
              <StallPanels
                stalls={visibleStalls}
                products={visibleProducts}
                transactions={s.transactions}
                orders={visibleOrders}
                employees={s.employees}
                isOnline={s.isOnline}
                wsEvents={s.wsEvents}
                {...posActions}
                {...orderActions}
              />
            )}

            {/* POS */}
            {activeTab === "pos" && (
              <POSTab
                stalls={visibleStalls.filter((st) => st.status === "ACTIVE")}
                employees={s.employees}
                products={visibleProducts.filter((p) => p.isAvailable)}
                cart={s.cart}
                wsEvents={s.wsEvents}
                syncQueue={s.syncQueue}
                selectedStallId={stallScoped && scopedStallId ? scopedStallId : s.selectedStallId}
                activeSellerId={auth.user.id}
                paymentMethod={s.paymentMethod}
                isOnline={s.isOnline}
                onSelectStall={stallScoped ? () => {} : s.setSelectedStallId}
                onOpenSellerAuth={(id) => s.openAuthModal(id, "switch_seller")}
                onAddToCart={s.handleAddToCart}
                onUpdateCartQty={s.handleUpdateCartQty}
                onSetPayment={s.setPaymentMethod}
                onCheckout={s.handleCheckout}
                onSyncNow={() => { s.setIsOnline(true); setTimeout(() => s.runOfflineSync(), 100); }}
              />
            )}

            {/* Buyurtmalar */}
            {activeTab === "orders" && (
              <OrdersTab
                stalls={visibleStalls}
                tables={s.tables}
                orders={visibleOrders}
                products={visibleProducts.filter((p) => p.isAvailable)}
                employees={s.employees}
                selectedOrderStallId={
                  stallScoped && scopedStallId ? scopedStallId : s.selectedOrderStallId
                }
                onSelectOrderStall={stallScoped ? () => {} : s.setSelectedOrderStallId}
                activeOrderId={s.activeOrderId}
                onSetActiveOrder={s.setActiveOrderId}
                onOpenTable={s.handleOpenTable}
                onAddItemToOrder={s.handleAddItemToOrder}
                onRemoveItemFromOrder={s.handleRemoveItemFromOrder}
                onUpdateOrderStatus={s.handleUpdateOrderStatus}
                onPayOrder={s.handlePayOrder}
                onSetReservation={s.handleSetReservation}
                onCancelReservation={s.handleCancelReservation}
              />
            )}

            {/* KDS */}
            {activeTab === "kds" && (
              <KDSTab
                orders={visibleOrders}
                stalls={visibleStalls}
                onUpdateItemStatus={s.handleUpdateOrderItemStatus}
                onUpdateOrderStatus={s.handleUpdateOrderStatus}
              />
            )}

            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <DashboardTab
                stalls={s.stalls}
                products={s.products}
                transactions={s.transactions}
                totalRevenue={s.totalParkRevenue}
                totalProductsSold={s.totalProductsSold}
                criticalStockCount={s.criticalStockCount}
                syncQueueLength={s.syncQueue.length}
                isSyncing={s.isSyncing}
                syncLogs={s.syncLogs}
                aiReport={s.aiReport}
                isGeneratingAi={s.isGeneratingAi}
                onRunSync={s.runOfflineSync}
                onGetAiAdvice={s.getAiDashboardAdvice}
              />
            )}

            {/* Hisobot */}
            {activeTab === "reports" && (
              <ReportsTab
                transactions={s.transactions}
                orders={s.orders}
                products={s.products}
                employees={s.employees}
                stalls={s.stalls}
              />
            )}

            {/* HR */}
            {activeTab === "hr" && (
              <HRTab
                employees={s.employees}
                attendanceLogs={s.attendanceLogs}
                calculatePayroll={s.calculatePayroll}
                onOpenAuth={s.openAuthModal}
              />
            )}

            {/* Mijozlar */}
            {activeTab === "customers" && (
              <CustomersTab
                customers={s.customers}
                loyaltyHistory={s.loyaltyHistory}
                onAdd={s.handleAddCustomer}
                onUpdate={s.handleUpdateCustomer}
                onDelete={s.handleDeleteCustomer}
                onToggleActive={s.handleToggleCustomerActive}
                onAddPoints={s.handleAddLoyaltyPoints}
                onRedeemPoints={s.handleRedeemLoyaltyPoints}
              />
            )}

            {/* Chegirmalar */}
            {activeTab === "discounts" && (
              <DiscountsTab
                discounts={s.discounts}
                stalls={s.stalls}
                onAdd={s.handleAddDiscount}
                onUpdate={s.handleUpdateDiscount}
                onDelete={s.handleDeleteDiscount}
                onToggle={s.handleToggleDiscount}
              />
            )}

            {/* Boshqaruv */}
            {activeTab === "management" && (
              <ManagementTab
                subTab={s.managementSubTab}
                onSubTabChange={s.setManagementSubTab}
                stalls={s.stalls}
                products={s.products}
                onAddStall={s.handleAddStall}
                onUpdateStall={s.handleUpdateStall}
                onDeleteStall={s.handleDeleteStall}
                onAddProduct={s.handleAddProduct}
                onUpdateProduct={s.handleUpdateProduct}
                onDeleteProduct={s.handleDeleteProduct}
                onToggleProductAvailable={s.handleToggleProductAvailable}
              />
            )}

            {/* Blueprint */}
            {activeTab === "blueprint" && (
              <BlueprintTab
                subTab={s.blueprintSubTab}
                onSubTabChange={s.setBlueprintSubTab}
                copiedText={s.copiedText}
                onCopy={s.copyToClipboard}
              />
            )}

          </AnimatePresence>
        </main>

        {/* ── Modals ── */}
        <AuthModal
          pendingSellerId={s.pendingSellerId}
          pendingActionType={s.pendingActionType}
          employees={s.employees}
          authUsername={s.authUsername}
          authPassword={s.authPassword}
          authError={s.authError}
          onUsernameChange={s.setAuthUsername}
          onPasswordChange={s.setAuthPassword}
          onSubmit={s.handleAuthSubmit}
          onCancel={s.closeAuthModal}
        />

        {(s.receiptTransaction || s.receiptOrder) && (
          <ReceiptModal
            transaction={s.receiptTransaction}
            order={s.receiptOrder}
            onClose={() => { s.setReceiptTransaction(null); s.setReceiptOrder(null); }}
          />
        )}

        {s.dayCloseOpen && (
          <DayCloseModal
            stalls={s.stalls}
            transactions={s.transactions}
            orders={s.orders}
            employees={s.employees}
            products={s.products}
            onClose={() => s.setDayCloseOpen(false)}
            onConfirm={() => {
              s.pushNotif(
                "Smena yopildi",
                `Bugungi jami: ${s.totalParkRevenue.toLocaleString()} so'm`,
                "success"
              );
              s.setDayCloseOpen(false);
            }}
          />
        )}
      </div>
    </AuthContext.Provider>
  );
}

// ── Root export ───────────────────────────────────────────────
export default function ParkCentralApp() {
  return <AppInner />;
}
