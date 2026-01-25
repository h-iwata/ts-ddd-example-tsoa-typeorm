import { DomainError } from '../../../shared/errors';
import { CustomerNotFoundError } from './CustomerNotFoundError';
import { InvalidEmailError } from './InvalidEmailError';

describe('Customer Errors', () => {
  describe('CustomerNotFoundError', () => {
    const error = () => new CustomerNotFoundError('customer-123');

    it('正しいメッセージとコードを持つ', () => {
      expect(error().message).toBe('顧客が見つかりません: customer-123');
      expect(error().code).toBe('CUSTOMER_NOT_FOUND');
    });

    it('DomainErrorを継承している', () => {
      expect(error()).toBeInstanceOf(DomainError);
    });
  });

  describe('InvalidEmailError', () => {
    const error = () => new InvalidEmailError('invalid-email');

    it('正しいメッセージとコードを持つ', () => {
      expect(error().message).toBe('無効なメールアドレス形式です: invalid-email');
      expect(error().code).toBe('INVALID_EMAIL');
    });

    it('DomainErrorを継承している', () => {
      expect(error()).toBeInstanceOf(DomainError);
    });
  });
});
