import { BusinessRuleViolationError } from '../../../shared/errors';

export class ShippingAddressRequiredError extends BusinessRuleViolationError {
  readonly code = 'SHIPPING_ADDRESS_REQUIRED';
  constructor() {
    super('注文を確定するには配送先の設定が必要です');
  }
}
