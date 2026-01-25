import { ProductId } from './ProductId';

describe('ProductId', () => {
  describe('generate', () => {
    it('新しいIDを生成できる', () => {
      const id = ProductId.generate();
      expect(id.getValue()).toBeDefined();
      expect(id.getValue().length).toBeGreaterThan(0);
    });

    it('生成されるIDはユニーク', () => {
      const id1 = ProductId.generate();
      const id2 = ProductId.generate();
      expect(id1.getValue()).not.toBe(id2.getValue());
    });
  });

  describe('fromString', () => {
    it('文字列からIDを作成できる', () => {
      const id = ProductId.fromString('test-id-123');
      expect(id.getValue()).toBe('test-id-123');
    });

    it('空文字列はエラー', () => {
      expect(() => ProductId.fromString('')).toThrow('商品IDは空にできません');
    });

    it('空白のみの文字列はエラー', () => {
      expect(() => ProductId.fromString('   ')).toThrow('商品IDは空にできません');
    });
  });

  describe('equals', () => {
    it('同じ値は等しい', () => {
      const id1 = ProductId.fromString('test-id');
      const id2 = ProductId.fromString('test-id');
      expect(id1.equals(id2)).toBe(true);
    });

    it('異なる値は等しくない', () => {
      const id1 = ProductId.fromString('test-id-1');
      const id2 = ProductId.fromString('test-id-2');
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('文字列として出力できる', () => {
      const id = ProductId.fromString('test-id');
      expect(id.toString()).toBe('test-id');
    });
  });
});
