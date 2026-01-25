import { Money, Quantity } from '../../shared/value-objects';
import { ProductId } from './ProductId';
import { InsufficientStockError } from '../order/errors';

/**
 * 商品集約ルート
 * 商品の在庫管理を含む
 */
export class Product {
  private constructor(
    private readonly id: ProductId,
    private name: string,
    private description: string,
    private price: Money,
    private stock: Quantity,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(
    name: string,
    description: string,
    price: Money,
    initialStock: Quantity
  ): Product {
    const now = new Date();
    return new Product(
      ProductId.generate(),
      name,
      description,
      price,
      initialStock,
      now,
      now
    );
  }

  static reconstruct(
    id: ProductId,
    name: string,
    description: string,
    price: Money,
    stock: Quantity,
    createdAt: Date,
    updatedAt: Date
  ): Product {
    return new Product(id, name, description, price, stock, createdAt, updatedAt);
  }

  getId(): ProductId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getPrice(): Money {
    return this.price;
  }

  getStock(): Quantity {
    return this.stock;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * 在庫があるかチェック
   */
  hasStock(quantity: Quantity): boolean {
    return this.stock.isGreaterThanOrEqual(quantity);
  }

  /**
   * 在庫を減らす（注文時）
   */
  decreaseStock(quantity: Quantity): void {
    if (!this.hasStock(quantity)) {
      throw new InsufficientStockError(
        this.id.getValue(),
        quantity.getValue(),
        this.stock.getValue()
      );
    }
    this.stock = this.stock.subtract(quantity);
    this.updatedAt = new Date();
  }

  /**
   * 在庫を増やす（入荷時、キャンセル時）
   */
  increaseStock(quantity: Quantity): void {
    this.stock = this.stock.add(quantity);
    this.updatedAt = new Date();
  }

  /**
   * 価格を更新
   */
  updatePrice(newPrice: Money): void {
    this.price = newPrice;
    this.updatedAt = new Date();
  }

  /**
   * 商品情報を更新
   */
  updateInfo(name: string, description: string): void {
    this.name = name;
    this.description = description;
    this.updatedAt = new Date();
  }
}
