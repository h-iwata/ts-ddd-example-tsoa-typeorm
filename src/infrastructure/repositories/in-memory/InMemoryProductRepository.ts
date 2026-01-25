import { injectable } from 'inversify';
import { Product, ProductId } from '../../../domain/aggregates/product';
import { Money, Quantity } from '../../../domain/shared/value-objects';
import { IProductRepository } from '../../../domain/repositories';

@injectable()
export class InMemoryProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map();

  async findById(id: ProductId): Promise<Product | null> {
    return this.products.get(id.getValue()) ?? null;
  }

  async findByIds(ids: ProductId[]): Promise<Product[]> {
    const products: Product[] = [];
    for (const id of ids) {
      const product = this.products.get(id.getValue());
      if (product) {
        products.push(product);
      }
    }
    return products;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.getId().getValue(), product);
  }

  async delete(id: ProductId): Promise<void> {
    this.products.delete(id.getValue());
  }

  // テスト用: シードデータを投入
  seedTestData(): void {
    const products = [
      Product.create(
        'MacBook Pro 14"',
        'Apple M3 Pro, 18GB RAM, 512GB SSD',
        Money.create(298000),
        Quantity.create(10)
      ),
      Product.create(
        'iPhone 15 Pro',
        '256GB, Natural Titanium',
        Money.create(159800),
        Quantity.create(25)
      ),
      Product.create(
        'AirPods Pro',
        '第2世代, MagSafe充電ケース付き',
        Money.create(39800),
        Quantity.create(50)
      ),
    ];

    for (const product of products) {
      this.products.set(product.getId().getValue(), product);
    }
  }
}
