import { Quantity } from './Quantity';
import { InvalidQuantityError } from '../errors';

describe('Quantity', () => {
  describe('.create', () => {
    it('正の整数で作成する', () => {
      expect(Quantity.create(5).getValue()).toBe(5);
    });

    it('0で作成する', () => {
      expect(Quantity.create(0).getValue()).toBe(0);
    });

    context('when 負の数', () => {
      it('エラーを投げる', () => {
        expect(() => Quantity.create(-1)).toThrow(InvalidQuantityError);
      });
    });

    context('when 小数', () => {
      it('エラーを投げる', () => {
        expect(() => Quantity.create(1.5)).toThrow(InvalidQuantityError);
      });
    });
  });

  describe('.zero', () => {
    it('0を作成する', () => {
      expect(Quantity.zero().getValue()).toBe(0);
    });
  });

  describe('#add', () => {
    it('加算する', () => {
      expect(Quantity.create(5).add(Quantity.create(3)).getValue()).toBe(8);
    });
  });

  describe('#subtract', () => {
    it('減算する', () => {
      expect(Quantity.create(5).subtract(Quantity.create(3)).getValue()).toBe(2);
    });

    context('when 結果が負になる', () => {
      it('エラーを投げる', () => {
        expect(() => Quantity.create(3).subtract(Quantity.create(5))).toThrow(InvalidQuantityError);
      });
    });
  });

  describe('#isZero', () => {
    it('0の場合 true', () => {
      expect(Quantity.zero().isZero()).toBe(true);
    });

    it('0以外の場合 false', () => {
      expect(Quantity.create(1).isZero()).toBe(false);
    });
  });

  describe('#isGreaterThanOrEqual', () => {
    it('大きい場合 true', () => {
      expect(Quantity.create(5).isGreaterThanOrEqual(Quantity.create(3))).toBe(true);
    });

    it('等しい場合 true', () => {
      expect(Quantity.create(5).isGreaterThanOrEqual(Quantity.create(5))).toBe(true);
    });

    it('小さい場合 false', () => {
      expect(Quantity.create(3).isGreaterThanOrEqual(Quantity.create(5))).toBe(false);
    });
  });

  describe('#equals', () => {
    it('同じ値は等しい', () => {
      expect(Quantity.create(5).equals(Quantity.create(5))).toBe(true);
    });

    it('異なる値は等しくない', () => {
      expect(Quantity.create(5).equals(Quantity.create(3))).toBe(false);
    });
  });
});
