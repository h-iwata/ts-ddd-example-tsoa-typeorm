import { OrderId } from './OrderId';

describe('OrderId', () => {
  describe('.generate', () => {
    it('新しいIDを生成する', () => {
      const id = OrderId.generate();
      expect(id.getValue()).toBeDefined();
      expect(id.getValue().length).toBeGreaterThan(0);
    });

    it('ユニークなIDを生成する', () => {
      expect(OrderId.generate().getValue()).not.toBe(OrderId.generate().getValue());
    });
  });

  describe('.fromString', () => {
    it('文字列からIDを作成する', () => {
      expect(OrderId.fromString('order-id-123').getValue()).toBe('order-id-123');
    });

    context('when 空文字列', () => {
      it('エラーを投げる', () => {
        expect(() => OrderId.fromString('')).toThrow('注文IDは空にできません');
      });
    });

    context('when 空白のみ', () => {
      it('エラーを投げる', () => {
        expect(() => OrderId.fromString('   ')).toThrow('注文IDは空にできません');
      });
    });
  });

  describe('#equals', () => {
    it('同じ値は等しい', () => {
      expect(OrderId.fromString('test-id').equals(OrderId.fromString('test-id'))).toBe(true);
    });

    it('異なる値は等しくない', () => {
      expect(OrderId.fromString('test-id-1').equals(OrderId.fromString('test-id-2'))).toBe(false);
    });
  });

  describe('#toString', () => {
    it('文字列として出力する', () => {
      expect(OrderId.fromString('order-id').toString()).toBe('order-id');
    });
  });
});
