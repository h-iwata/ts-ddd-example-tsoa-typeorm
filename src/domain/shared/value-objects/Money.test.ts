import { Money } from './Money';
import { InvalidPriceError } from '../errors';

describe('Money', () => {
  describe('create', () => {
    it('正常な金額で作成できる', () => {
      const money = Money.create(1000, 'JPY');
      expect(money.getAmount()).toBe(1000);
      expect(money.getCurrency()).toBe('JPY');
    });

    it('通貨を省略するとJPYがデフォルト', () => {
      const money = Money.create(500);
      expect(money.getCurrency()).toBe('JPY');
    });

    it('0円で作成できる', () => {
      const money = Money.create(0);
      expect(money.getAmount()).toBe(0);
    });

    it('負の金額はエラー', () => {
      expect(() => Money.create(-100)).toThrow(InvalidPriceError);
    });
  });

  describe('zero', () => {
    it('0円を作成できる', () => {
      const money = Money.zero();
      expect(money.getAmount()).toBe(0);
      expect(money.getCurrency()).toBe('JPY');
    });

    it('通貨を指定して0を作成できる', () => {
      const money = Money.zero('USD');
      expect(money.getCurrency()).toBe('USD');
    });
  });

  describe('add', () => {
    it('同じ通貨同士を加算できる', () => {
      const a = Money.create(1000, 'JPY');
      const b = Money.create(500, 'JPY');
      const result = a.add(b);
      expect(result.getAmount()).toBe(1500);
    });

    it('異なる通貨の加算はエラー', () => {
      const jpy = Money.create(1000, 'JPY');
      const usd = Money.create(10, 'USD');
      expect(() => jpy.add(usd)).toThrow('通貨が一致しません');
    });
  });

  describe('subtract', () => {
    it('同じ通貨同士を減算できる', () => {
      const a = Money.create(1000, 'JPY');
      const b = Money.create(300, 'JPY');
      const result = a.subtract(b);
      expect(result.getAmount()).toBe(700);
    });

    it('結果が負になる減算はエラー', () => {
      const a = Money.create(100, 'JPY');
      const b = Money.create(500, 'JPY');
      expect(() => a.subtract(b)).toThrow(InvalidPriceError);
    });

    it('異なる通貨の減算はエラー', () => {
      const jpy = Money.create(1000, 'JPY');
      const usd = Money.create(10, 'USD');
      expect(() => jpy.subtract(usd)).toThrow('通貨が一致しません');
    });
  });

  describe('multiply', () => {
    it('正の数で乗算できる', () => {
      const money = Money.create(100, 'JPY');
      const result = money.multiply(3);
      expect(result.getAmount()).toBe(300);
    });

    it('0で乗算すると0になる', () => {
      const money = Money.create(100, 'JPY');
      const result = money.multiply(0);
      expect(result.getAmount()).toBe(0);
    });

    it('負の数での乗算はエラー', () => {
      const money = Money.create(100, 'JPY');
      expect(() => money.multiply(-1)).toThrow(InvalidPriceError);
    });
  });

  describe('equals', () => {
    it('同じ金額・通貨は等しい', () => {
      const a = Money.create(1000, 'JPY');
      const b = Money.create(1000, 'JPY');
      expect(a.equals(b)).toBe(true);
    });

    it('金額が異なると等しくない', () => {
      const a = Money.create(1000, 'JPY');
      const b = Money.create(2000, 'JPY');
      expect(a.equals(b)).toBe(false);
    });

    it('通貨が異なると等しくない', () => {
      const a = Money.create(1000, 'JPY');
      const b = Money.create(1000, 'USD');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('isGreaterThan', () => {
    it('大きい金額を判定できる', () => {
      const a = Money.create(2000, 'JPY');
      const b = Money.create(1000, 'JPY');
      expect(a.isGreaterThan(b)).toBe(true);
    });

    it('小さい金額は false', () => {
      const a = Money.create(1000, 'JPY');
      const b = Money.create(2000, 'JPY');
      expect(a.isGreaterThan(b)).toBe(false);
    });

    it('同じ金額は false', () => {
      const a = Money.create(1000, 'JPY');
      const b = Money.create(1000, 'JPY');
      expect(a.isGreaterThan(b)).toBe(false);
    });

    it('異なる通貨の比較はエラー', () => {
      const jpy = Money.create(1000, 'JPY');
      const usd = Money.create(10, 'USD');
      expect(() => jpy.isGreaterThan(usd)).toThrow('通貨が一致しません');
    });
  });

  describe('toString', () => {
    it('金額を文字列で表示できる', () => {
      const money = Money.create(1000, 'JPY');
      expect(money.toString()).toBe('JPY 1,000');
    });
  });
});
