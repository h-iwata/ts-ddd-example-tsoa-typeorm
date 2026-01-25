import { CustomerId } from './CustomerId';

describe('CustomerId', () => {
  describe('generate', () => {
    it('新しいIDを生成できる', () => {
      const id = CustomerId.generate();
      expect(id.getValue()).toBeDefined();
      expect(id.getValue().length).toBeGreaterThan(0);
    });

    it('生成されるIDはユニーク', () => {
      const id1 = CustomerId.generate();
      const id2 = CustomerId.generate();
      expect(id1.getValue()).not.toBe(id2.getValue());
    });
  });

  describe('fromString', () => {
    it('文字列からIDを作成できる', () => {
      const id = CustomerId.fromString('customer-id-123');
      expect(id.getValue()).toBe('customer-id-123');
    });

    it('空文字列はエラー', () => {
      expect(() => CustomerId.fromString('')).toThrow('顧客IDは空にできません');
    });

    it('空白のみの文字列はエラー', () => {
      expect(() => CustomerId.fromString('   ')).toThrow('顧客IDは空にできません');
    });
  });

  describe('equals', () => {
    it('同じ値は等しい', () => {
      const id1 = CustomerId.fromString('test-id');
      const id2 = CustomerId.fromString('test-id');
      expect(id1.equals(id2)).toBe(true);
    });

    it('異なる値は等しくない', () => {
      const id1 = CustomerId.fromString('test-id-1');
      const id2 = CustomerId.fromString('test-id-2');
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('文字列として出力できる', () => {
      const id = CustomerId.fromString('customer-id');
      expect(id.toString()).toBe('customer-id');
    });
  });
});
