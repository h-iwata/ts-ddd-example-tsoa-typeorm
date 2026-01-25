import { CustomerId } from './CustomerId';

describe('CustomerId', () => {
  describe('.generate', () => {
    it('新しいIDを生成する', () => {
      const id = CustomerId.generate();
      expect(id.getValue()).toBeDefined();
      expect(id.getValue().length).toBeGreaterThan(0);
    });

    it('ユニークなIDを生成する', () => {
      expect(CustomerId.generate().getValue()).not.toBe(CustomerId.generate().getValue());
    });
  });

  describe('.fromString', () => {
    it('文字列からIDを作成する', () => {
      expect(CustomerId.fromString('customer-id-123').getValue()).toBe('customer-id-123');
    });

    context('when 空文字列', () => {
      it('エラーを投げる', () => {
        expect(() => CustomerId.fromString('')).toThrow('顧客IDは空にできません');
      });
    });

    context('when 空白のみ', () => {
      it('エラーを投げる', () => {
        expect(() => CustomerId.fromString('   ')).toThrow('顧客IDは空にできません');
      });
    });
  });

  describe('#equals', () => {
    it('同じ値は等しい', () => {
      expect(CustomerId.fromString('test-id').equals(CustomerId.fromString('test-id'))).toBe(true);
    });

    it('異なる値は等しくない', () => {
      expect(CustomerId.fromString('test-id-1').equals(CustomerId.fromString('test-id-2'))).toBe(false);
    });
  });

  describe('#toString', () => {
    it('文字列として出力する', () => {
      expect(CustomerId.fromString('customer-id').toString()).toBe('customer-id');
    });
  });
});
