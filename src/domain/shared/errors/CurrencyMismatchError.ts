import { ValidationError } from './base';

export class CurrencyMismatchError extends ValidationError {
  readonly code = 'CURRENCY_MISMATCH';
  constructor(currency: string, otherCurrency: string) {
    super(`通貨が一致しません: ${currency} と ${otherCurrency}`);
  }
}
