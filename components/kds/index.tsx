"use client";

import { motion } from "motion/react";
import KitchenDisplay from "./KitchenDisplay";
import type { Order, OrderItem, OrderStatus, Stall } from "../types";

interface KDSTabProps {
  orders: Order[];
  stalls: Stall[];
  onUpdateItemStatus:  (orderId: string, itemId: string, status: OrderItem["status"]) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function KDSTab({
  orders, stalls, onUpdateItemStatus, onUpdateOrderStatus,
}: KDSTabProps) {
  return (
    <motion.div
      key="kds"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      <KitchenDisplay
        orders={orders}
        stalls={stalls}
        onUpdateItemStatus={onUpdateItemStatus}
        onUpdateOrderStatus={onUpdateOrderStatus}
      />
    </motion.div>
  );
}
