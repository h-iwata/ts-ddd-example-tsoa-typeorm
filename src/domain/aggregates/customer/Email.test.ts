import { Email } from './Email';
import { InvalidEmailError } from './errors';

describe('Email', () => {
  describe('.create', () => {
    it('有効なメールアドレスで作成する', () => {
      expect(Email.create('test@example.com').getValue()).toBe('test@example.com');
    });

    it('大文字を小文字に変換する', () => {
      expect(Email.create('TEST@EXAMPLE.COM').getValue()).toBe('test@example.com');
    });

    it('前後の空白をトリムする', () => {
      expect(Email.create('  test@example.com  ').getValue()).toBe('test@example.com');
    });

    context('when @がない', () => {
      it('エラーを投げる', () => {
        expect(() => Email.create('invalid-email')).toThrow(InvalidEmailError);
      });
    });

    context('when ドメインがない', () => {
      it('エラーを投げる', () => {
        expect(() => Email.create('test@')).toThrow(InvalidEmailError);
      });
    });

    context('when ローカルパートがない', () => {
      it('エラーを投げる', () => {
        expect(() => Email.create('@example.com')).toThrow(InvalidEmailError);
      });
    });

    context('when TLDがない', () => {
      it('エラーを投げる', () => {
        expect(() => Email.create('test@example')).toThrow(InvalidEmailError);
      });
    });

    context('when 空文字列', () => {
      it('エラーを投げる', () => {
        expect(() => Email.create('')).toThrow(InvalidEmailError);
      });
    });
  });

  describe('#equals', () => {
    it('同じメールアドレスは等しい', () => {
      expect(Email.create('test@example.com').equals(Email.create('test@example.com'))).toBe(true);
    });

    it('大文字小文字が違っても正規化されて等しい', () => {
      expect(Email.create('TEST@example.com').equals(Email.create('test@EXAMPLE.com'))).toBe(true);
    });

    it('異なるメールアドレスは等しくない', () => {
      expect(Email.create('test1@example.com').equals(Email.create('test2@example.com'))).toBe(false);
    });
  });
});
