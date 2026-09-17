import { BusinessRuleViolationError } from '../../../shared/errors';

export class EmptyOrderError extends BusinessRuleViolationError {
  readonly code = 'EMPTY_ORDER';
  constructor() {
    super('注文には少なくとも1つの商品が必要です');
  }
}
