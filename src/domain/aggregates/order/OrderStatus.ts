/**
 * 注文ステータス
 */
export const OrderStatus = {
  PENDING: 'PENDING',           // 注文受付
  CONFIRMED: 'CONFIRMED',       // 確定
  PAID: 'PAID',                 // 支払い完了
  SHIPPED: 'SHIPPED',           // 発送済み
  DELIVERED: 'DELIVERED',       // 配達完了
  CANCELLED: 'CANCELLED',       // キャンセル
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

/**
 * 注文ステータスの遷移ルール
 */
export const OrderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

/**
 * ステータス遷移が可能かチェック
 */
export function canTransitionTo(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  return OrderStatusTransitions[currentStatus].includes(newStatus);
}
