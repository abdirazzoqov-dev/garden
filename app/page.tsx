"use client";

import { AnimatePresence } from "motion/react";
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

export default function ParkCentralApp() {
  const s = useAppState();

  // Shared order-action bundle (passed to StallPanels)
  const orderActions = {
    tables:                   s.tables,
    onOpenTable:              s.handleOpenTable,
    onAddItemToOrder:         s.handleAddItemToOrder,
    onRemoveItemFromOrder:    s.handleRemoveItemFromOrder,
    onUpdateOrderStatus:      s.handleUpdateOrderStatus,
    onPayOrder:               s.handlePayOrder,
    onSetReservation:         s.handleSetReservation,
    onCancelReservation:      s.handleCancelReservation,
    onUpdateOrderItemStatus:  s.handleUpdateOrderItemStatus,
  };

  // Shared POS-action bundle
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

      {/* ── Header ── */}
      <Header isOnline={s.isOnline} setIsOnline={s.setIsOnline} />

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">

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

        <AnimatePresence mode="wait">

          {/* ── Stall Panels (individual + admin monitor) ── */}
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

          {/* ── Global POS ── */}
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

          {/* ── Global Orders ── */}
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

          {/* ── Global KDS ── */}
          {s.activeTab === "kds" && (
            <KDSTab
              orders={s.orders}
              stalls={s.stalls}
              onUpdateItemStatus={s.handleUpdateOrderItemStatus}
              onUpdateOrderStatus={s.handleUpdateOrderStatus}
            />
          )}

          {/* ── Dashboard ── */}
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

          {/* ── Reports ── */}
          {s.activeTab === "reports" && (
            <ReportsTab
              transactions={s.transactions}
              orders={s.orders}
              products={s.products}
              employees={s.employees}
              stalls={s.stalls}
            />
          )}

          {/* ── HR ── */}
          {s.activeTab === "hr" && (
            <HRTab
              employees={s.employees}
              attendanceLogs={s.attendanceLogs}
              calculatePayroll={s.calculatePayroll}
              onOpenAuth={s.openAuthModal}
            />
          )}

          {/* ── Customers ── */}
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

          {/* ── Discounts ── */}
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

          {/* ── Management ── */}
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

          {/* ── Blueprint ── */}
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
    </div>
  );
}


export default function ParkCentralApp() {
  const s = useAppState();

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-[#283028] pb-16">

      {/* ── Header ── */}
      <Header isOnline={s.isOnline} setIsOnline={s.setIsOnline} />

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">

        <NavigationTabs
          activeTab={s.activeTab}
          pendingOrdersCount={s.pendingOrdersCount}
          kitchenCount={s.orders.filter((o) => o.status === "CONFIRMED" || o.status === "PREPARING").length}
          onTabChange={(tab) => {
            s.setActiveTab(tab);
            if (tab === "dashboard" && !s.aiReport) s.getAiDashboardAdvice();
          }}
        />

        <AnimatePresence mode="wait">

          {/* POS */}
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

          {/* Orders */}
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

          {/* KDS */}
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

          {/* HR */}
          {s.activeTab === "hr" && (
            <HRTab
              employees={s.employees}
              attendanceLogs={s.attendanceLogs}
              calculatePayroll={s.calculatePayroll}
              onOpenAuth={s.openAuthModal}
            />
          )}

          {/* Reports */}
          {s.activeTab === "reports" && (
            <ReportsTab
              transactions={s.transactions}
              orders={s.orders}
              products={s.products}
              employees={s.employees}
              stalls={s.stalls}
            />
          )}

          {/* Customers */}
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

          {/* Discounts */}
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

          {/* Management */}
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
    </div>
  );
}
