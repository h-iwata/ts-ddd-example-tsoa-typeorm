import { Address } from './Address';

describe('Address', () => {
  describe('create', () => {
    it('必須項目のみで作成できる', () => {
      const address = Address.create('100-0001', '東京都', '千代田区', '1-1-1');
      expect(address.getPostalCode()).toBe('100-0001');
      expect(address.getPrefecture()).toBe('東京都');
      expect(address.getCity()).toBe('千代田区');
      expect(address.getStreet()).toBe('1-1-1');
      expect(address.getBuilding()).toBeUndefined();
    });

    it('建物名を含めて作成できる', () => {
      const address = Address.create(
        '100-0001',
        '東京都',
        '千代田区',
        '1-1-1',
        'テストビル101'
      );
      expect(address.getBuilding()).toBe('テストビル101');
    });

    it('郵便番号が空だとエラー', () => {
      expect(() =>
        Address.create('', '東京都', '千代田区', '1-1-1')
      ).toThrow('住所の必須項目は空にできません');
    });

    it('都道府県が空だとエラー', () => {
      expect(() =>
        Address.create('100-0001', '', '千代田区', '1-1-1')
      ).toThrow('住所の必須項目は空にできません');
    });

    it('市区町村が空だとエラー', () => {
      expect(() =>
        Address.create('100-0001', '東京都', '', '1-1-1')
      ).toThrow('住所の必須項目は空にできません');
    });

    it('番地が空だとエラー', () => {
      expect(() =>
        Address.create('100-0001', '東京都', '千代田区', '')
      ).toThrow('住所の必須項目は空にできません');
    });
  });

  describe('getFullAddress', () => {
    it('建物名なしの完全な住所を取得できる', () => {
      const address = Address.create('100-0001', '東京都', '千代田区', '1-1-1');
      expect(address.getFullAddress()).toBe('100-0001 東京都 千代田区 1-1-1');
    });

    it('建物名ありの完全な住所を取得できる', () => {
      const address = Address.create(
        '100-0001',
        '東京都',
        '千代田区',
        '1-1-1',
        'テストビル101'
      );
      expect(address.getFullAddress()).toBe(
        '100-0001 東京都 千代田区 1-1-1 テストビル101'
      );
    });
  });

  describe('equals', () => {
    it('同じ住所は等しい', () => {
      const a = Address.create('100-0001', '東京都', '千代田区', '1-1-1');
      const b = Address.create('100-0001', '東京都', '千代田区', '1-1-1');
      expect(a.equals(b)).toBe(true);
    });

    it('建物名も含めて同じ住所は等しい', () => {
      const a = Address.create(
        '100-0001',
        '東京都',
        '千代田区',
        '1-1-1',
        'ビル101'
      );
      const b = Address.create(
        '100-0001',
        '東京都',
        '千代田区',
        '1-1-1',
        'ビル101'
      );
      expect(a.equals(b)).toBe(true);
    });

    it('郵便番号が異なると等しくない', () => {
      const a = Address.create('100-0001', '東京都', '千代田区', '1-1-1');
      const b = Address.create('100-0002', '東京都', '千代田区', '1-1-1');
      expect(a.equals(b)).toBe(false);
    });

    it('都道府県が異なると等しくない', () => {
      const a = Address.create('100-0001', '東京都', '千代田区', '1-1-1');
      const b = Address.create('100-0001', '大阪府', '千代田区', '1-1-1');
      expect(a.equals(b)).toBe(false);
    });

    it('市区町村が異なると等しくない', () => {
      const a = Address.create('100-0001', '東京都', '千代田区', '1-1-1');
      const b = Address.create('100-0001', '東京都', '港区', '1-1-1');
      expect(a.equals(b)).toBe(false);
    });

    it('番地が異なると等しくない', () => {
      const a = Address.create('100-0001', '東京都', '千代田区', '1-1-1');
      const b = Address.create('100-0001', '東京都', '千代田区', '2-2-2');
      expect(a.equals(b)).toBe(false);
    });

    it('建物名が異なると等しくない', () => {
      const a = Address.create(
        '100-0001',
        '東京都',
        '千代田区',
        '1-1-1',
        'ビルA'
      );
      const b = Address.create(
        '100-0001',
        '東京都',
        '千代田区',
        '1-1-1',
        'ビルB'
      );
      expect(a.equals(b)).toBe(false);
    });
  });
});
