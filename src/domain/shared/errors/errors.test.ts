import { DomainError } from './DomainError';
import { InvalidPriceError } from './InvalidPriceError';
import { InvalidQuantityError } from './InvalidQuantityError';

describe('DomainError', () => {
  // DomainErrorは抽象クラスなので、継承したクラスでテストする
  describe('InvalidPriceError', () => {
    it('正しいエラーメッセージを持つ', () => {
      const error = new InvalidPriceError(-100);
      expect(error.message).toBe(
        '無効な価格です: -100。価格は0以上である必要があります。'
      );
    });

    it('正しいエラーコードを持つ', () => {
      const error = new InvalidPriceError(-100);
      expect(error.code).toBe('INVALID_PRICE');
    });

    it('正しいエラー名を持つ', () => {
      const error = new InvalidPriceError(-100);
      expect(error.name).toBe('InvalidPriceError');
    });

    it('DomainErrorを継承している', () => {
      const error = new InvalidPriceError(-100);
      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('InvalidQuantityError', () => {
    it('正しいエラーメッセージを持つ', () => {
      const error = new InvalidQuantityError(-5);
      expect(error.message).toBe(
        '無効な数量です: -5。数量は1以上である必要があります。'
      );
    });

    it('正しいエラーコードを持つ', () => {
      const error = new InvalidQuantityError(-5);
      expect(error.code).toBe('INVALID_QUANTITY');
    });

    it('正しいエラー名を持つ', () => {
      const error = new InvalidQuantityError(-5);
      expect(error.name).toBe('InvalidQuantityError');
    });

    it('DomainErrorを継承している', () => {
      const error = new InvalidQuantityError(-5);
      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(Error);
    });
  });
});
