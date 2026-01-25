import { DomainError } from '../../../shared/errors';

export class OrderNotFoundError extends DomainError {
  readonly code = 'ORDER_NOT_FOUND';
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
  }
}
