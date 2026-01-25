import { OrderId } from './OrderId';

describe('OrderId', () => {
  describe('generate', () => {
    it('新しいIDを生成できる', () => {
      const id = OrderId.generate();
      expect(id.getValue()).toBeDefined();
      expect(id.getValue().length).toBeGreaterThan(0);
    });

    it('生成されるIDはユニーク', () => {
      const id1 = OrderId.generate();
      const id2 = OrderId.generate();
      expect(id1.getValue()).not.toBe(id2.getValue());
    });
  });

  describe('fromString', () => {
    it('文字列からIDを作成できる', () => {
      const id = OrderId.fromString('order-id-123');
      expect(id.getValue()).toBe('order-id-123');
    });

    it('空文字列はエラー', () => {
      expect(() => OrderId.fromString('')).toThrow('注文IDは空にできません');
    });

    it('空白のみの文字列はエラー', () => {
      expect(() => OrderId.fromString('   ')).toThrow('注文IDは空にできません');
    });
  });

  describe('equals', () => {
    it('同じ値は等しい', () => {
      const id1 = OrderId.fromString('test-id');
      const id2 = OrderId.fromString('test-id');
      expect(id1.equals(id2)).toBe(true);
    });

    it('異なる値は等しくない', () => {
      const id1 = OrderId.fromString('test-id-1');
      const id2 = OrderId.fromString('test-id-2');
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('文字列として出力できる', () => {
      const id = OrderId.fromString('order-id');
      expect(id.toString()).toBe('order-id');
    });
  });
});
