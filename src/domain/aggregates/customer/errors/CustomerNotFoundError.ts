import { DomainError } from '../../../shared/errors';

export class CustomerNotFoundError extends DomainError {
  readonly code = 'CUSTOMER_NOT_FOUND';
  constructor(customerId: string) {
    super(`顧客が見つかりません: ${customerId}`);
  }
}
