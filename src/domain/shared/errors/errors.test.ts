import { DomainError, ValidationError } from './base';
import { CurrencyMismatchError } from './CurrencyMismatchError';
import { InvalidAddressError } from './InvalidAddressError';
import { InvalidIdError } from './InvalidIdError';
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

  describe('InvalidIdError', () => {
    const error = () => new InvalidIdError('商品ID');

    it('正しいメッセージ、コード、名前を持つ', () => {
      expect(error().message).toBe('商品IDは空にできません');
      expect(error().code).toBe('INVALID_ID');
      expect(error().name).toBe('InvalidIdError');
    });

    it('ValidationErrorを継承している', () => {
      expect(error()).toBeInstanceOf(ValidationError);
      expect(error().kind).toBe('validation');
    });
  });

  describe('CurrencyMismatchError', () => {
    const error = () => new CurrencyMismatchError('JPY', 'USD');

    it('正しいメッセージ、コード、名前を持つ', () => {
      expect(error().message).toBe('通貨が一致しません: JPY と USD');
      expect(error().code).toBe('CURRENCY_MISMATCH');
      expect(error().name).toBe('CurrencyMismatchError');
    });

    it('ValidationErrorを継承している', () => {
      expect(error()).toBeInstanceOf(ValidationError);
      expect(error().kind).toBe('validation');
    });
  });

  describe('InvalidAddressError', () => {
    const error = () => new InvalidAddressError();

    it('正しいメッセージ、コード、名前を持つ', () => {
      expect(error().message).toBe('住所の必須項目は空にできません');
      expect(error().code).toBe('INVALID_ADDRESS');
      expect(error().name).toBe('InvalidAddressError');
    });

    it('ValidationErrorを継承している', () => {
      expect(error()).toBeInstanceOf(ValidationError);
      expect(error().kind).toBe('validation');
    });
  });
});
