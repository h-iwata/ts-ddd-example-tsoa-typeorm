import { ValidationError } from './base';

export class InvalidAddressError extends ValidationError {
  readonly code = 'INVALID_ADDRESS';
  constructor() {
    super('住所の必須項目は空にできません');
  }
}
