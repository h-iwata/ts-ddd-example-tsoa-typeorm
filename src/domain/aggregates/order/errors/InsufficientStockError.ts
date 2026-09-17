import { BusinessRuleViolationError } from '../../../shared/errors';

export class InsufficientStockError extends BusinessRuleViolationError {
  readonly code = 'INSUFFICIENT_STOCK';
  constructor(productId: string, requested: number, available: number) {
    super(`商品(${productId})の在庫が不足しています。要求数: ${requested}、在庫数: ${available}`);
  }
}
