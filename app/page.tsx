"use client";

import { AnimatePresence } from "motion/react";
import { Moon }           from "lucide-react";
import { useAppState }    from "../components/hooks/useAppState";
import Header             from "../components/Header";
import NavigationTabs     from "../components/NavigationTabs";
import StallPanels        from "../components/stall-panels";
import POSTab             from "../components/pos";
import OrdersTab          from "../components/orders";
import KDSTab             from "../components/kds";
import DashboardTab       from "../components/dashboard";
import HRTab              from "../components/hr";
import CustomersTab       from "../components/customers";
import ReportsTab         from "../components/reports";
import DiscountsTab       from "../components/discounts";
import ManagementTab      from "../components/management";
import BlueprintTab       from "../components/blueprint";
import AuthModal          from "../components/AuthModal";
import ReceiptModal       from "../components/receipt/ReceiptModal";
import DayCloseModal      from "../components/shift/DayCloseModal";

export default function ParkCentralApp() {
  const s = useAppState();

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
    activeSellerId:   s.activeSellerId,
    wsEvents:         s.wsEvents,
    onAddToCart:      s.handleAddToCart,
    onUpdateCartQty:  s.handleUpdateCartQty,
    onSetPayment:     s.setPaymentMethod,
    onCheckout:       s.handleCheckout,
    onSyncNow:        () => { s.setIsOnline(true); setTimeout(() => s.runOfflineSync(), 100); },
    onOpenSellerAuth: (id: string) => s.openAuthModal(id, "switch_seller"),
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-[#283028] pb-16">

      {/* ── Header (with dark mode + notifications) ── */}
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
        onNavigate={(tab) => s.setActiveTab(tab as any)}
      />

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">

        {/* Navigation tabs + Day-close button */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <NavigationTabs
              activeTab={s.activeTab}
              pendingOrdersCount={s.pendingOrdersCount}
              kitchenCount={s.orders.filter(
                (o) => o.status === "CONFIRMED" || o.status === "PREPARING"
              ).length}
              onTabChange={(tab) => {
                s.setActiveTab(tab);
                if (tab === "dashboard" && !s.aiReport) s.getAiDashboardAdvice();
              }}
            />
          </div>
          {/* Day close button */}
          <button
            onClick={() => s.setDayCloseOpen(true)}
            className="btn btn-sm bg-slate-700 hover:bg-slate-800 text-white border-0 shrink-0 mb-8"
            title="Smenani yopish"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Smena yopish</span>
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* Rastalar panels */}
          {s.activeTab === "stalls" && (
            <StallPanels
              stalls={s.stalls}
              products={s.products}
              transactions={s.transactions}
              orders={s.orders}
              employees={s.employees}
              isOnline={s.isOnline}
              wsEvents={s.wsEvents}
              {...posActions}
              {...orderActions}
            />
          )}

          {/* Global POS */}
          {s.activeTab === "pos" && (
            <POSTab
              stalls={s.stalls.filter((st) => st.status === "ACTIVE")}
              employees={s.employees}
              products={s.products.filter((p) => p.isAvailable)}
              cart={s.cart}
              wsEvents={s.wsEvents}
              syncQueue={s.syncQueue}
              selectedStallId={s.selectedStallId}
              activeSellerId={s.activeSellerId}
              paymentMethod={s.paymentMethod}
              isOnline={s.isOnline}
              onSelectStall={s.setSelectedStallId}
              onOpenSellerAuth={(id) => s.openAuthModal(id, "switch_seller")}
              onAddToCart={s.handleAddToCart}
              onUpdateCartQty={s.handleUpdateCartQty}
              onSetPayment={s.setPaymentMethod}
              onCheckout={s.handleCheckout}
              onSyncNow={() => { s.setIsOnline(true); setTimeout(() => s.runOfflineSync(), 100); }}
            />
          )}

          {/* Global Orders */}
          {s.activeTab === "orders" && (
            <OrdersTab
              stalls={s.stalls}
              tables={s.tables}
              orders={s.orders}
              products={s.products.filter((p) => p.isAvailable)}
              employees={s.employees}
              selectedOrderStallId={s.selectedOrderStallId}
              onSelectOrderStall={s.setSelectedOrderStallId}
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

          {/* Global KDS */}
          {s.activeTab === "kds" && (
            <KDSTab
              orders={s.orders}
              stalls={s.stalls}
              onUpdateItemStatus={s.handleUpdateOrderItemStatus}
              onUpdateOrderStatus={s.handleUpdateOrderStatus}
            />
          )}

          {/* Dashboard */}
          {s.activeTab === "dashboard" && (
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
          {s.activeTab === "reports" && (
            <ReportsTab
              transactions={s.transactions}
              orders={s.orders}
              products={s.products}
              employees={s.employees}
              stalls={s.stalls}
            />
          )}

          {/* HR */}
          {s.activeTab === "hr" && (
            <HRTab
              employees={s.employees}
              attendanceLogs={s.attendanceLogs}
              calculatePayroll={s.calculatePayroll}
              onOpenAuth={s.openAuthModal}
            />
          )}

          {/* Mijozlar */}
          {s.activeTab === "customers" && (
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
          {s.activeTab === "discounts" && (
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
          {s.activeTab === "management" && (
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
          {s.activeTab === "blueprint" && (
            <BlueprintTab
              subTab={s.blueprintSubTab}
              onSubTabChange={s.setBlueprintSubTab}
              copiedText={s.copiedText}
              onCopy={s.copyToClipboard}
            />
          )}

        </AnimatePresence>
      </main>

      {/* ── Auth modal ── */}
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

      {/* ── Receipt modal ── */}
      {(s.receiptTransaction || s.receiptOrder) && (
        <ReceiptModal
          transaction={s.receiptTransaction}
          order={s.receiptOrder}
          onClose={() => { s.setReceiptTransaction(null); s.setReceiptOrder(null); }}
        />
      )}

      {/* ── Day close modal ── */}
      {s.dayCloseOpen && (
        <DayCloseModal
          stalls={s.stalls}
          transactions={s.transactions}
          orders={s.orders}
          employees={s.employees}
          products={s.products}
          onClose={() => s.setDayCloseOpen(false)}
          onConfirm={() => {
            s.pushNotif("Smena yopildi", `Bugungi jami: ${new Intl.NumberFormat().format(s.totalParkRevenue)} so'm`, "success");
            s.setDayCloseOpen(false);
          }}
        />
      )}
    </div>
  );
}
