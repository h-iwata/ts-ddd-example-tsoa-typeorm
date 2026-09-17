import { DomainError } from './base';
import { InvalidPriceError } from './InvalidPriceError';
import { InvalidQuantityError } from './InvalidQuantityError';

describe('DomainError', () => {
  describe('InvalidPriceError', () => {
    const error = () => new InvalidPriceError(-100);

    it('正しいメッセージ、コード、名前を持つ', () => {
      expect(error().message).toBe('無効な価格です: -100。価格は0以上である必要があります。');
      expect(error().code).toBe('INVALID_PRICE');
      expect(error().name).toBe('InvalidPriceError');
    });

    it('DomainErrorを継承している', () => {
      expect(error()).toBeInstanceOf(DomainError);
      expect(error()).toBeInstanceOf(Error);
    });
  });

  describe('InvalidQuantityError', () => {
    const error = () => new InvalidQuantityError(-5);

    it('正しいメッセージ、コード、名前を持つ', () => {
      expect(error().message).toBe('無効な数量です: -5。数量は1以上である必要があります。');
      expect(error().code).toBe('INVALID_QUANTITY');
      expect(error().name).toBe('InvalidQuantityError');
    });

    it('DomainErrorを継承している', () => {
      expect(error()).toBeInstanceOf(DomainError);
      expect(error()).toBeInstanceOf(Error);
    });
  });
});
