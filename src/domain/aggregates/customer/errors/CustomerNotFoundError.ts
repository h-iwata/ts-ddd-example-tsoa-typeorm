import { NotFoundError } from '../../../shared/errors';

export class CustomerNotFoundError extends NotFoundError {
  readonly code = 'CUSTOMER_NOT_FOUND';
  constructor(customerId: string) {
    super(`顧客が見つかりません: ${customerId}`);
  }
}
