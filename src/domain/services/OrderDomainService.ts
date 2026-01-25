import { injectable, inject } from 'inversify';
import { TYPES } from '../../infrastructure/di/types';
import { Order } from '../aggregates/order';
import { Product } from '../aggregates/product';
import { ProductId, Quantity } from '../value-objects';
import { IProductRepository } from '../repositories';
import { InsufficientStockError, ProductNotFoundError } from '../../shared/errors';

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

  /**
   * 注文の在庫チェックと在庫引き当て
   * 複数の商品（Product集約）に対して整合性を保証
   */
  async validateAndReserveStock(order: Order): Promise<void> {
    const items = order.getItems();
    const productIds = items.map((item) => item.getProductId());

    // 関連する商品を一括取得
    const products = await this.productRepository.findByIds(productIds);
    const productMap = new Map(
      products.map((p) => [p.getId().getValue(), p])
    );

    // 在庫チェック
    for (const item of items) {
      const product = productMap.get(item.getProductId().getValue());
      if (!product) {
        throw new ProductNotFoundError(item.getProductId().getValue());
      }

      if (!product.hasStock(item.getQuantity())) {
        throw new InsufficientStockError(
          item.getProductId().getValue(),
          item.getQuantity().getValue(),
          product.getStock().getValue()
        );
      }
    }

    // 在庫引き当て（全ての在庫チェックが通った後に実行）
    for (const item of items) {
      const product = productMap.get(item.getProductId().getValue())!;
      product.decreaseStock(item.getQuantity());
      await this.productRepository.save(product);
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
  async checkStockAvailability(
    productId: ProductId,
    quantity: Quantity
  ): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return false;
    }
    return product.hasStock(quantity);
  }
}
