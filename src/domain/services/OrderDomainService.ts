import { injectable, inject } from 'inversify';
import { TYPES } from '../../infrastructure/di/types';
import { InsufficientStockError, ProductNotFoundError } from '../../shared/errors';
import { Order, type OrderItem } from '../aggregates/order';
import { type Product } from '../aggregates/product';
import { type IProductRepository } from '../repositories';
import { ProductId, Quantity } from '../value-objects';

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

/**
 * 注文ドメインサービス
 * 複数の集約をまたぐビジネスルールを実装
 */
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

  /**
   * 注文キャンセル時の在庫戻し
   */
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

  /**
   * 商品の在庫が十分かチェック
   */
  async checkStockAvailability(productId: ProductId, quantity: Quantity): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return false;
    }
    return product.hasStock(quantity);
  }
}
