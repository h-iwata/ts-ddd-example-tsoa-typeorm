import { type Money, type Quantity } from '../../shared/value-objects';
import { type ProductId } from '../product/ProductId';
import { OrderItemId } from './OrderItemId';

/**
 * 注文明細（エンティティ）
 * Order集約の一部として管理される
 */
export class OrderItem {
  private constructor(
    private readonly id: OrderItemId,
    private readonly productId: ProductId,
    private readonly productName: string,
    private readonly unitPrice: Money,
    private quantity: Quantity
  ) {}

  static create(
    productId: ProductId,
    productName: string,
    unitPrice: Money,
    quantity: Quantity
  ): OrderItem {
    return new OrderItem(
      OrderItemId.generate(),
      productId,
      productName,
      unitPrice,
      quantity
    );
  }

  static reconstruct(
    id: OrderItemId,
    productId: ProductId,
    productName: string,
    unitPrice: Money,
    quantity: Quantity
  ): OrderItem {
    return new OrderItem(id, productId, productName, unitPrice, quantity);
  }

  getId(): OrderItemId {
    return this.id;
  }

  getProductId(): ProductId {
    return this.productId;
  }

  getProductName(): string {
    return this.productName;
  }

  getUnitPrice(): Money {
    return this.unitPrice;
  }

  getQuantity(): Quantity {
    return this.quantity;
  }

  /**
   * 明細の小計を計算
   */
  getSubtotal(): Money {
    return this.unitPrice.multiply(this.quantity.getValue());
  }

  /**
   * 数量を変更
   */
  changeQuantity(newQuantity: Quantity): void {
    this.quantity = newQuantity;
  }
}
