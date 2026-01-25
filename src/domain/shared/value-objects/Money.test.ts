import { Money } from './Money';
import { InvalidPriceError } from '../errors';

describe('Money', () => {
  const jpy = (amount: number) => Money.create(amount, 'JPY');
  const usd = (amount: number) => Money.create(amount, 'USD');

  describe('#create', () => {
    it('金額と通貨を設定する', () => {
      expect(jpy(1000).getAmount()).toBe(1000);
      expect(jpy(1000).getCurrency()).toBe('JPY');
    });

    it('通貨省略時はJPY', () => {
      expect(Money.create(500).getCurrency()).toBe('JPY');
    });

    context('when 負の金額', () => {
      it('エラーを投げる', () => {
        expect(() => Money.create(-100)).toThrow(InvalidPriceError);
      });
    });
  });

  describe('#zero', () => {
    it('0円を作成する', () => {
      expect(Money.zero().getAmount()).toBe(0);
    });
  });

  describe('#add', () => {
    it('加算する', () => {
      expect(jpy(1000).add(jpy(500)).getAmount()).toBe(1500);
    });

    context('when 異なる通貨', () => {
      it('エラーを投げる', () => {
        expect(() => jpy(1000).add(usd(10))).toThrow('通貨が一致しません');
      });
    });
  });

  describe('#subtract', () => {
    it('減算する', () => {
      expect(jpy(1000).subtract(jpy(300)).getAmount()).toBe(700);
    });

    context('when 結果が負', () => {
      it('エラーを投げる', () => {
        expect(() => jpy(100).subtract(jpy(500))).toThrow(InvalidPriceError);
      });
    });
  });

  describe('#multiply', () => {
    it('乗算する', () => {
      expect(jpy(100).multiply(3).getAmount()).toBe(300);
    });

    context('when 負の数', () => {
      it('エラーを投げる', () => {
        expect(() => jpy(100).multiply(-1)).toThrow(InvalidPriceError);
      });
    });
  });

  describe('#equals', () => {
    it('同額同通貨ならtrue', () => {
      expect(jpy(1000).equals(jpy(1000))).toBe(true);
    });

    it('金額が異なればfalse', () => {
      expect(jpy(1000).equals(jpy(2000))).toBe(false);
    });
  });

  describe('#isGreaterThan', () => {
    it('大きければtrue', () => {
      expect(jpy(2000).isGreaterThan(jpy(1000))).toBe(true);
    });

    it('小さければfalse', () => {
      expect(jpy(1000).isGreaterThan(jpy(2000))).toBe(false);
    });
  });

  describe('#toString', () => {
    it('フォーマットして返す', () => {
      expect(jpy(1000).toString()).toBe('JPY 1,000');
    });
  });
});
