import { Customer } from './Customer';
import { CustomerId } from './CustomerId';
import { Email } from './Email';
import { Address } from '../../shared/value-objects';

describe('Customer', () => {
  const email = () => Email.create('test@example.com');
  const address = () => Address.create('100-0001', '東京都', '千代田区', '1-1-1');
  const createCustomer = () => Customer.create('山田太郎', email());

  describe('#create', () => {
    it('顧客を作成する', () => {
      const customer = createCustomer();
      expect(customer.getName()).toBe('山田太郎');
      expect(customer.getEmail().getValue()).toBe('test@example.com');
      expect(customer.getShippingAddress()).toBeNull();
    });
  });

  describe('#reconstruct', () => {
    context('with 配送先あり', () => {
      it('全属性を復元する', () => {
        const customer = Customer.reconstruct(
          CustomerId.fromString('id-1'), '山田太郎', email(), address(), new Date(), new Date()
        );
        expect(customer.getId().getValue()).toBe('id-1');
        expect(customer.getShippingAddress()).toEqual(address());
      });
    });

    context('without 配送先', () => {
      it('nullで復元する', () => {
        const customer = Customer.reconstruct(
          CustomerId.fromString('id-1'), '山田太郎', email(), null, new Date(), new Date()
        );
        expect(customer.getShippingAddress()).toBeNull();
      });
    });
  });

  describe('#setShippingAddress', () => {
    it('配送先を設定する', () => {
      const customer = createCustomer();
      customer.setShippingAddress(address());
      expect(customer.getShippingAddress()).toEqual(address());
    });
  });

  describe('#updateProfile', () => {
    it('名前とメールを更新する', () => {
      const customer = createCustomer();
      customer.updateProfile('田中花子', Email.create('tanaka@example.com'));
      expect(customer.getName()).toBe('田中花子');
      expect(customer.getEmail().getValue()).toBe('tanaka@example.com');
    });
  });

  describe('#hasShippingAddress', () => {
    context('when 未設定', () => {
      it('falseを返す', () => {
        expect(createCustomer().hasShippingAddress()).toBe(false);
      });
    });

    context('when 設定済み', () => {
      it('trueを返す', () => {
        const customer = createCustomer();
        customer.setShippingAddress(address());
        expect(customer.hasShippingAddress()).toBe(true);
      });
    });
  });
});
