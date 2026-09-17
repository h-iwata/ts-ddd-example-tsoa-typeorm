import { type Money, type Quantity } from '../../shared/value-objects';
import { InsufficientStockError } from '../order/errors';
import { ProductId } from './ProductId';

export interface ProductReconstructParams {
  id: ProductId;
  name: string;
  description: string;
  price: Money;
  stock: Quantity;
  createdAt: Date;
  updatedAt: Date;
}

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

  static create(name: string, description: string, price: Money, initialStock: Quantity): Product {
    const now = new Date();
    return new Product(ProductId.generate(), name, description, price, initialStock, now, now);
  }

  static reconstruct(params: ProductReconstructParams): Product {
    return new Product(params.id, params.name, params.description, params.price, params.stock, params.createdAt, params.updatedAt);
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

  hasStock(quantity: Quantity): boolean {
    return this.stock.isGreaterThanOrEqual(quantity);
  }

  decreaseStock(quantity: Quantity): void {
    if (!this.hasStock(quantity)) {
      throw new InsufficientStockError(this.id.getValue(), quantity.getValue(), this.stock.getValue());
    }
    this.stock = this.stock.subtract(quantity);
    this.updatedAt = new Date();
  }

  increaseStock(quantity: Quantity): void {
    this.stock = this.stock.add(quantity);
    this.updatedAt = new Date();
  }

  updatePrice(newPrice: Money): void {
    this.price = newPrice;
    this.updatedAt = new Date();
  }

  updateInfo(name: string, description: string): void {
    this.name = name;
    this.description = description;
    this.updatedAt = new Date();
  }
}
