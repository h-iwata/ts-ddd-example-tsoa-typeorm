import { Customer } from './Customer';
import { CustomerId } from './CustomerId';
import { Email } from './Email';
import { Address } from '../../shared/value-objects';

describe('Customer', () => {
  describe('create', () => {
    it('新しい顧客を作成できる', () => {
      const customer = Customer.create('山田太郎', Email.create('yamada@example.com'));

      expect(customer.getName()).toBe('山田太郎');
      expect(customer.getEmail().getValue()).toBe('yamada@example.com');
      expect(customer.getShippingAddress()).toBeNull();
      expect(customer.getId()).toBeDefined();
      expect(customer.getCreatedAt()).toBeInstanceOf(Date);
      expect(customer.getUpdatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('reconstruct', () => {
    it('既存の顧客を再構築できる', () => {
      const id = CustomerId.fromString('customer-id');
      const email = Email.create('test@example.com');
      const address = Address.create('100-0001', '東京都', '千代田区', '1-1-1');
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const customer = Customer.reconstruct(
        id,
        '山田太郎',
        email,
        address,
        createdAt,
        updatedAt
      );

      expect(customer.getId().getValue()).toBe('customer-id');
      expect(customer.getName()).toBe('山田太郎');
      expect(customer.getShippingAddress()).toBe(address);
      expect(customer.getCreatedAt()).toBe(createdAt);
      expect(customer.getUpdatedAt()).toBe(updatedAt);
    });

    it('配送先なしで再構築できる', () => {
      const id = CustomerId.fromString('customer-id');
      const email = Email.create('test@example.com');
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const customer = Customer.reconstruct(
        id,
        '山田太郎',
        email,
        null,
        createdAt,
        updatedAt
      );

      expect(customer.getShippingAddress()).toBeNull();
    });
  });

  describe('setShippingAddress', () => {
    it('配送先を設定できる', () => {
      const customer = Customer.create('山田太郎', Email.create('yamada@example.com'));
      const address = Address.create('100-0001', '東京都', '千代田区', '1-1-1');

      customer.setShippingAddress(address);

      expect(customer.getShippingAddress()).toBe(address);
    });
  });

  describe('updateProfile', () => {
    it('プロフィールを更新できる', () => {
      const customer = Customer.create('山田太郎', Email.create('yamada@example.com'));
      const newEmail = Email.create('tanaka@example.com');

      customer.updateProfile('田中花子', newEmail);

      expect(customer.getName()).toBe('田中花子');
      expect(customer.getEmail().getValue()).toBe('tanaka@example.com');
    });
  });

  describe('hasShippingAddress', () => {
    it('配送先が未設定の場合 false', () => {
      const customer = Customer.create('山田太郎', Email.create('yamada@example.com'));
      expect(customer.hasShippingAddress()).toBe(false);
    });

    it('配送先が設定済みの場合 true', () => {
      const customer = Customer.create('山田太郎', Email.create('yamada@example.com'));
      const address = Address.create('100-0001', '東京都', '千代田区', '1-1-1');
      customer.setShippingAddress(address);
      expect(customer.hasShippingAddress()).toBe(true);
    });
  });
});
