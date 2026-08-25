import { type Address, Money, type Quantity } from '../../shared/value-objects';
import { type CustomerId } from '../customer/CustomerId';
import { type ProductId } from '../product/ProductId';
import { EmptyOrderError, InvalidOrderStateError, ShippingAddressRequiredError } from './errors';
import { OrderId } from './OrderId';
import { OrderItem } from './OrderItem';
import { canTransitionTo, OrderStatus } from './OrderStatus';

/**
 * 注文再構築用パラメータ
 */
export interface OrderReconstructParams {
  id: OrderId;
  customerId: CustomerId;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: Address | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 注文集約ルート
 * 注文明細（OrderItem）を内包し、整合性を保証する
 */
export class Order {
  private constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
    private shippingAddress: Address | null,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  /**
   * 新規注文を作成
   */
  static create(customerId: CustomerId): Order {
    const now = new Date();
    return new Order(OrderId.generate(), customerId, [], OrderStatus.PENDING, null, now, now);
  }

  /**
   * 永続化されたデータから復元
   */
  static reconstruct(params: OrderReconstructParams): Order {
    return new Order(params.id, params.customerId, params.items, params.status, params.shippingAddress, params.createdAt, params.updatedAt);
  }

  // ========== Getters ==========

  getId(): OrderId {
    return this.id;
  }

  getCustomerId(): CustomerId {
    return this.customerId;
  }

  getItems(): readonly OrderItem[] {
    return [...this.items];
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getShippingAddress(): Address | null {
    return this.shippingAddress;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // ========== 集計 ==========

  /**
   * 注文合計金額を計算
   */
  getTotalAmount(): Money {
    return this.items.reduce((total, item) => total.add(item.getSubtotal()), Money.zero());
  }

  /**
   * 注文明細数を取得
   */
  getItemCount(): number {
    return this.items.length;
  }

  /**
   * 注文が空かどうか
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // ========== ビジネスロジック ==========

  /**
   * 商品を注文に追加
   * 同じ商品が既にあれば数量を加算
   */
  addItem(productId: ProductId, productName: string, unitPrice: Money, quantity: Quantity): void {
    this.assertCanModify();

    const existingItem = this.items.find((item) => item.getProductId().equals(productId));

    if (existingItem) {
      const newQuantity = existingItem.getQuantity().add(quantity);
      existingItem.changeQuantity(newQuantity);
    } else {
      const newItem = OrderItem.create(productId, productName, unitPrice, quantity);
      this.items.push(newItem);
    }

    this.updatedAt = new Date();
  }

  /**
   * 注文明細を削除
   */
  removeItem(productId: ProductId): void {
    this.assertCanModify();

    this.items = this.items.filter((item) => !item.getProductId().equals(productId));
    this.updatedAt = new Date();
  }

  /**
   * 明細の数量を変更
   */
  updateItemQuantity(productId: ProductId, newQuantity: Quantity): void {
    this.assertCanModify();

    const item = this.items.find((item) => item.getProductId().equals(productId));

    if (!item) {
      throw new Error(`注文内に商品が見つかりません: ${productId.getValue()}`);
    }

    if (newQuantity.isZero()) {
      this.removeItem(productId);
    } else {
      item.changeQuantity(newQuantity);
    }

    this.updatedAt = new Date();
  }

  /**
   * 配送先を設定
   */
  setShippingAddress(address: Address): void {
    this.assertCanModify();
    this.shippingAddress = address;
    this.updatedAt = new Date();
  }

  /**
   * 注文を確定
   */
  confirm(): void {
    this.assertCanTransitionTo(OrderStatus.CONFIRMED);

    if (this.isEmpty()) {
      throw new EmptyOrderError();
    }

    if (!this.shippingAddress) {
      throw new ShippingAddressRequiredError();
    }

    this.status = OrderStatus.CONFIRMED;
    this.updatedAt = new Date();
  }

  /**
   * 支払い完了をマーク
   */
  markAsPaid(): void {
    this.assertCanTransitionTo(OrderStatus.PAID);
    this.status = OrderStatus.PAID;
    this.updatedAt = new Date();
  }

  /**
   * 発送済みをマーク
   */
  markAsShipped(): void {
    this.assertCanTransitionTo(OrderStatus.SHIPPED);
    this.status = OrderStatus.SHIPPED;
    this.updatedAt = new Date();
  }

  /**
   * 配達完了をマーク
   */
  markAsDelivered(): void {
    this.assertCanTransitionTo(OrderStatus.DELIVERED);
    this.status = OrderStatus.DELIVERED;
    this.updatedAt = new Date();
  }

  /**
   * 注文をキャンセル
   */
  cancel(): void {
    this.assertCanTransitionTo(OrderStatus.CANCELLED);
    this.status = OrderStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  /**
   * キャンセル可能かどうか
   */
  canBeCancelled(): boolean {
    return canTransitionTo(this.status, OrderStatus.CANCELLED);
  }

  // ========== 内部ヘルパー ==========

  private assertCanModify(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new InvalidOrderStateError(this.status, '変更');
    }
  }

  private assertCanTransitionTo(newStatus: OrderStatus): void {
    if (!canTransitionTo(this.status, newStatus)) {
      throw new InvalidOrderStateError(this.status, `${newStatus}への遷移`);
    }
  }
}
