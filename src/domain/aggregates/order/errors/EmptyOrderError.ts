import { DomainError } from '../../../shared/errors';

export class EmptyOrderError extends DomainError {
  readonly code = 'EMPTY_ORDER';
  constructor() {
    super('Order must have at least one item');
  }
}
