import { Quantity } from './Quantity';
import { InvalidQuantityError } from '../errors';

describe('Quantity', () => {
  describe('create', () => {
    it('正の整数で作成できる', () => {
      const quantity = Quantity.create(5);
      expect(quantity.getValue()).toBe(5);
    });

    it('0で作成できる', () => {
      const quantity = Quantity.create(0);
      expect(quantity.getValue()).toBe(0);
    });

    it('負の数はエラー', () => {
      expect(() => Quantity.create(-1)).toThrow(InvalidQuantityError);
    });

    it('小数はエラー', () => {
      expect(() => Quantity.create(1.5)).toThrow(InvalidQuantityError);
    });
  });

  describe('zero', () => {
    it('0を作成できる', () => {
      const quantity = Quantity.zero();
      expect(quantity.getValue()).toBe(0);
    });
  });

  describe('add', () => {
    it('数量を加算できる', () => {
      const a = Quantity.create(5);
      const b = Quantity.create(3);
      const result = a.add(b);
      expect(result.getValue()).toBe(8);
    });
  });

  describe('subtract', () => {
    it('数量を減算できる', () => {
      const a = Quantity.create(5);
      const b = Quantity.create(3);
      const result = a.subtract(b);
      expect(result.getValue()).toBe(2);
    });

    it('結果が負になる減算はエラー', () => {
      const a = Quantity.create(3);
      const b = Quantity.create(5);
      expect(() => a.subtract(b)).toThrow(InvalidQuantityError);
    });
  });

  describe('isZero', () => {
    it('0の場合 true', () => {
      const quantity = Quantity.zero();
      expect(quantity.isZero()).toBe(true);
    });

    it('0でない場合 false', () => {
      const quantity = Quantity.create(1);
      expect(quantity.isZero()).toBe(false);
    });
  });

  describe('isGreaterThanOrEqual', () => {
    it('大きい場合 true', () => {
      const a = Quantity.create(5);
      const b = Quantity.create(3);
      expect(a.isGreaterThanOrEqual(b)).toBe(true);
    });

    it('等しい場合 true', () => {
      const a = Quantity.create(5);
      const b = Quantity.create(5);
      expect(a.isGreaterThanOrEqual(b)).toBe(true);
    });

    it('小さい場合 false', () => {
      const a = Quantity.create(3);
      const b = Quantity.create(5);
      expect(a.isGreaterThanOrEqual(b)).toBe(false);
    });
  });

  describe('equals', () => {
    it('同じ値は等しい', () => {
      const a = Quantity.create(5);
      const b = Quantity.create(5);
      expect(a.equals(b)).toBe(true);
    });

    it('異なる値は等しくない', () => {
      const a = Quantity.create(5);
      const b = Quantity.create(3);
      expect(a.equals(b)).toBe(false);
    });
  });
});
