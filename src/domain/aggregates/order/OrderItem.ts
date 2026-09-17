import { type Money, type Quantity } from '../../shared/value-objects';
import { type ProductId } from '../product/ProductId';
import { OrderItemId } from './OrderItemId';

// 集約ルートではなくOrder集約の一部。OrderItemRepositoryは作らない
export class OrderItem {
  private constructor(
    private readonly id: OrderItemId,
    private readonly productId: ProductId,
    private readonly productName: string,
    private readonly unitPrice: Money,
    private quantity: Quantity
  ) {}

  static create(productId: ProductId, productName: string, unitPrice: Money, quantity: Quantity): OrderItem {
    return new OrderItem(OrderItemId.generate(), productId, productName, unitPrice, quantity);
  }

  static reconstruct(id: OrderItemId, productId: ProductId, productName: string, unitPrice: Money, quantity: Quantity): OrderItem {
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

  getSubtotal(): Money {
    return this.unitPrice.multiply(this.quantity.getValue());
  }

  changeQuantity(newQuantity: Quantity): void {
    this.quantity = newQuantity;
  }
}
