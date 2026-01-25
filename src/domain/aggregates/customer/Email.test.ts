import { Email } from './Email';
import { InvalidEmailError } from './errors';

describe('Email', () => {
  describe('create', () => {
    it('有効なメールアドレスで作成できる', () => {
      const email = Email.create('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('大文字を小文字に変換する', () => {
      const email = Email.create('TEST@EXAMPLE.COM');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('前後の空白をトリムする', () => {
      const email = Email.create('  test@example.com  ');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('@がないメールアドレスはエラー', () => {
      expect(() => Email.create('invalid-email')).toThrow(InvalidEmailError);
    });

    it('ドメインがないメールアドレスはエラー', () => {
      expect(() => Email.create('test@')).toThrow(InvalidEmailError);
    });

    it('ローカルパートがないメールアドレスはエラー', () => {
      expect(() => Email.create('@example.com')).toThrow(InvalidEmailError);
    });

    it('TLDがないメールアドレスはエラー', () => {
      expect(() => Email.create('test@example')).toThrow(InvalidEmailError);
    });

    it('空文字列はエラー', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailError);
    });
  });

  describe('equals', () => {
    it('同じメールアドレスは等しい', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('大文字小文字が違っても正規化されて等しい', () => {
      const email1 = Email.create('TEST@example.com');
      const email2 = Email.create('test@EXAMPLE.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('異なるメールアドレスは等しくない', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
