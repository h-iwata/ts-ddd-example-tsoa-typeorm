import { OrderItemId } from './OrderItemId';

describe('OrderItemId', () => {
  describe('.generate', () => {
    it('新しいIDを生成する', () => {
      const id = OrderItemId.generate();
      expect(id.getValue()).toBeDefined();
      expect(id.getValue().length).toBeGreaterThan(0);
    });

    it('ユニークなIDを生成する', () => {
      expect(OrderItemId.generate().getValue()).not.toBe(OrderItemId.generate().getValue());
    });
  });

  describe('.fromString', () => {
    it('文字列からIDを作成する', () => {
      expect(OrderItemId.fromString('item-id-123').getValue()).toBe('item-id-123');
    });

    context('when 空文字列', () => {
      it('エラーを投げる', () => {
        expect(() => OrderItemId.fromString('')).toThrow('注文明細IDは空にできません');
      });
    });

    context('when 空白のみ', () => {
      it('エラーを投げる', () => {
        expect(() => OrderItemId.fromString('   ')).toThrow('注文明細IDは空にできません');
      });
    });
  });

  describe('#equals', () => {
    it('同じ値は等しい', () => {
      expect(OrderItemId.fromString('test-id').equals(OrderItemId.fromString('test-id'))).toBe(true);
    });

    it('異なる値は等しくない', () => {
      expect(OrderItemId.fromString('test-id-1').equals(OrderItemId.fromString('test-id-2'))).toBe(false);
    });
  });

  describe('#toString', () => {
    it('文字列として出力する', () => {
      expect(OrderItemId.fromString('item-id').toString()).toBe('item-id');
    });
  });
});
