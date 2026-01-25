import { DomainError } from '../../../shared/errors';
import { CustomerNotFoundError } from './CustomerNotFoundError';
import { InvalidEmailError } from './InvalidEmailError';

describe('Customer Errors', () => {
  describe('CustomerNotFoundError', () => {
    it('正しいエラーメッセージを持つ', () => {
      const error = new CustomerNotFoundError('customer-123');
      expect(error.message).toBe('顧客が見つかりません: customer-123');
    });

    it('正しいエラーコードを持つ', () => {
      const error = new CustomerNotFoundError('customer-123');
      expect(error.code).toBe('CUSTOMER_NOT_FOUND');
    });

    it('DomainErrorを継承している', () => {
      const error = new CustomerNotFoundError('customer-123');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('InvalidEmailError', () => {
    it('正しいエラーメッセージを持つ', () => {
      const error = new InvalidEmailError('invalid-email');
      expect(error.message).toBe('無効なメールアドレス形式です: invalid-email');
    });

    it('正しいエラーコードを持つ', () => {
      const error = new InvalidEmailError('invalid-email');
      expect(error.code).toBe('INVALID_EMAIL');
    });

    it('DomainErrorを継承している', () => {
      const error = new InvalidEmailError('invalid-email');
      expect(error).toBeInstanceOf(DomainError);
    });
  });
});
