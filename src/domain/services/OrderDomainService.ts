import { inject, injectable } from 'inversify';
import { TYPES } from '../../infrastructure/di/types';
import { type Order, type OrderItem } from '../aggregates/order';
import { InsufficientStockError } from '../aggregates/order/errors';
import { type Product } from '../aggregates/product';
import { ProductNotFoundError } from '../aggregates/product/errors';
import { type IProductRepository } from '../repositories';
import { type ProductId, type Quantity } from '../value-objects';

type ProductMap = Map<string, Product>;

function validateStock(items: readonly OrderItem[], productMap: ProductMap): void {
  for (const item of items) {
    const product = productMap.get(item.getProductId().getValue());
    if (!product) throw new ProductNotFoundError(item.getProductId().getValue());
    if (!product.hasStock(item.getQuantity())) {
      throw new InsufficientStockError(item.getProductId().getValue(), item.getQuantity().getValue(), product.getStock().getValue());
    }
  }
}

// Order集約とProduct集約をまたぐため、どちらの集約にも置けないルールを扱う
@injectable()
export class OrderDomainService {
  constructor(
    @inject(TYPES.IProductRepository)
    private readonly productRepository: IProductRepository
  ) {}

  async validateAndReserveStock(order: Order): Promise<void> {
    const items = order.getItems();
    const products = await this.productRepository.findByIds(items.map((item) => item.getProductId()));
    const productMap: ProductMap = new Map(products.map((p) => [p.getId().getValue(), p]));

    validateStock(items, productMap);
    await this.reserveStock(items, productMap);
  }

  private async reserveStock(items: readonly OrderItem[], productMap: ProductMap): Promise<void> {
    for (const item of items) {
      const product = productMap.get(item.getProductId().getValue());
      if (product) {
        product.decreaseStock(item.getQuantity());
        await this.productRepository.save(product);
      }
    }
  }

  async releaseStock(order: Order): Promise<void> {
    const items = order.getItems();

    for (const item of items) {
      const product = await this.productRepository.findById(item.getProductId());
      if (product) {
        product.increaseStock(item.getQuantity());
        await this.productRepository.save(product);
      }
    }
  }

  async checkStockAvailability(productId: ProductId, quantity: Quantity): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return false;
    }
    return product.hasStock(quantity);
  }
}
