import { ProductId } from './ProductId';

describe('ProductId', () => {
  describe('.generate', () => {
    it('新しいIDを生成する', () => {
      const id = ProductId.generate();
      expect(id.getValue()).toBeDefined();
      expect(id.getValue().length).toBeGreaterThan(0);
    });

    it('ユニークなIDを生成する', () => {
      expect(ProductId.generate().getValue()).not.toBe(ProductId.generate().getValue());
    });
  });

  describe('.fromString', () => {
    it('文字列からIDを作成する', () => {
      expect(ProductId.fromString('test-id-123').getValue()).toBe('test-id-123');
    });

    context('when 空文字列', () => {
      it('エラーを投げる', () => {
        expect(() => ProductId.fromString('')).toThrow('商品IDは空にできません');
      });
    });

    context('when 空白のみ', () => {
      it('エラーを投げる', () => {
        expect(() => ProductId.fromString('   ')).toThrow('商品IDは空にできません');
      });
    });
  });

  describe('#equals', () => {
    it('同じ値は等しい', () => {
      expect(ProductId.fromString('test-id').equals(ProductId.fromString('test-id'))).toBe(true);
    });

    it('異なる値は等しくない', () => {
      expect(ProductId.fromString('test-id-1').equals(ProductId.fromString('test-id-2'))).toBe(false);
    });
  });

  describe('#toString', () => {
    it('文字列として出力する', () => {
      expect(ProductId.fromString('test-id').toString()).toBe('test-id');
    });
  });
});
