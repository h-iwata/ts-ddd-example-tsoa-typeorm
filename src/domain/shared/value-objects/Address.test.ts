import { Address } from './Address';

describe('Address', () => {
  const create = (postalCode = '100-0001', prefecture = '東京都', city = '千代田区', street = '1-1-1', building?: string) =>
    Address.create(postalCode, prefecture, city, street, building);

  describe('.create', () => {
    it('必須項目のみで作成する', () => {
      const address = create();
      expect(address.getPostalCode()).toBe('100-0001');
      expect(address.getPrefecture()).toBe('東京都');
      expect(address.getCity()).toBe('千代田区');
      expect(address.getStreet()).toBe('1-1-1');
      expect(address.getBuilding()).toBeUndefined();
    });

    context('with 建物名', () => {
      it('建物名も設定する', () => {
        expect(create('100-0001', '東京都', '千代田区', '1-1-1', 'テストビル101').getBuilding()).toBe('テストビル101');
      });
    });

    context('when 郵便番号が空', () => {
      it('エラーを投げる', () => {
        expect(() => create('')).toThrow('住所の必須項目は空にできません');
      });
    });

    context('when 都道府県が空', () => {
      it('エラーを投げる', () => {
        expect(() => create('100-0001', '')).toThrow('住所の必須項目は空にできません');
      });
    });

    context('when 市区町村が空', () => {
      it('エラーを投げる', () => {
        expect(() => create('100-0001', '東京都', '')).toThrow('住所の必須項目は空にできません');
      });
    });

    context('when 番地が空', () => {
      it('エラーを投げる', () => {
        expect(() => create('100-0001', '東京都', '千代田区', '')).toThrow('住所の必須項目は空にできません');
      });
    });
  });

  describe('#getFullAddress', () => {
    it('建物名なしの完全な住所を返す', () => {
      expect(create().getFullAddress()).toBe('100-0001 東京都 千代田区 1-1-1');
    });

    context('with 建物名', () => {
      it('建物名を含めて返す', () => {
        expect(create('100-0001', '東京都', '千代田区', '1-1-1', 'テストビル101').getFullAddress())
          .toBe('100-0001 東京都 千代田区 1-1-1 テストビル101');
      });
    });
  });

  describe('#equals', () => {
    it('同じ住所は等しい', () => {
      expect(create().equals(create())).toBe(true);
    });

    context('with 建物名', () => {
      it('建物名も含めて比較する', () => {
        const a = create('100-0001', '東京都', '千代田区', '1-1-1', 'ビル101');
        const b = create('100-0001', '東京都', '千代田区', '1-1-1', 'ビル101');
        expect(a.equals(b)).toBe(true);
      });
    });

    context('when 郵便番号が異なる', () => {
      it('等しくない', () => {
        expect(create().equals(create('100-0002'))).toBe(false);
      });
    });

    context('when 都道府県が異なる', () => {
      it('等しくない', () => {
        expect(create().equals(create('100-0001', '大阪府'))).toBe(false);
      });
    });

    context('when 市区町村が異なる', () => {
      it('等しくない', () => {
        expect(create().equals(create('100-0001', '東京都', '港区'))).toBe(false);
      });
    });

    context('when 番地が異なる', () => {
      it('等しくない', () => {
        expect(create().equals(create('100-0001', '東京都', '千代田区', '2-2-2'))).toBe(false);
      });
    });

    context('when 建物名が異なる', () => {
      it('等しくない', () => {
        const a = create('100-0001', '東京都', '千代田区', '1-1-1', 'ビルA');
        const b = create('100-0001', '東京都', '千代田区', '1-1-1', 'ビルB');
        expect(a.equals(b)).toBe(false);
      });
    });
  });
});
