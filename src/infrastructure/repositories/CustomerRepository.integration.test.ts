import { CustomerRepository } from './CustomerRepository';
import { Customer, CustomerId, Email } from '../../domain/aggregates/customer';
import { Address } from '../../domain/shared/value-objects';

describe('CustomerRepository Integration', () => {
  const repository = new CustomerRepository();

  const createCustomer = (email = 'test@example.com', name = '山田太郎') => {
    return Customer.create(name, Email.create(email));
  };

  describe('#save と #findById', () => {
    it('顧客を保存して取得できる', async () => {
      const customer = createCustomer();
      await repository.save(customer);

      const found = await repository.findById(customer.getId());

      expect(found).not.toBeNull();
      expect(found!.getId().getValue()).toBe(customer.getId().getValue());
      expect(found!.getName()).toBe('山田太郎');
      expect(found!.getEmail().getValue()).toBe('test@example.com');
    });

    context('with 配送先住所', () => {
      it('住所も保存される', async () => {
        const customer = createCustomer('addr@example.com');
        customer.setShippingAddress(
          Address.create('100-0001', '東京都', '千代田区', '1-1-1', 'ビル101')
        );
        await repository.save(customer);

        const found = await repository.findById(customer.getId());

        expect(found!.hasShippingAddress()).toBe(true);
        const addr = found!.getShippingAddress()!;
        expect(addr.getPostalCode()).toBe('100-0001');
        expect(addr.getPrefecture()).toBe('東京都');
        expect(addr.getCity()).toBe('千代田区');
        expect(addr.getStreet()).toBe('1-1-1');
        expect(addr.getBuilding()).toBe('ビル101');
      });
    });

    context('when 存在しないID', () => {
      it('nullを返す', async () => {
        const found = await repository.findById(CustomerId.fromString('non-existent'));
        expect(found).toBeNull();
      });
    });
  });

  describe('#findByEmail', () => {
    it('メールアドレスで顧客を取得できる', async () => {
      const customer = createCustomer('find@example.com');
      await repository.save(customer);

      const found = await repository.findByEmail(Email.create('find@example.com'));

      expect(found).not.toBeNull();
      expect(found!.getId().getValue()).toBe(customer.getId().getValue());
    });

    context('when 存在しないメール', () => {
      it('nullを返す', async () => {
        const found = await repository.findByEmail(Email.create('notfound@example.com'));
        expect(found).toBeNull();
      });
    });
  });

  describe('#existsByEmail', () => {
    it('存在する場合 true', async () => {
      const customer = createCustomer('exists@example.com');
      await repository.save(customer);

      const exists = await repository.existsByEmail(Email.create('exists@example.com'));

      expect(exists).toBe(true);
    });

    it('存在しない場合 false', async () => {
      const exists = await repository.existsByEmail(Email.create('notexists@example.com'));
      expect(exists).toBe(false);
    });
  });

  describe('#findAll', () => {
    it('全顧客を取得できる', async () => {
      await repository.save(createCustomer('user1@example.com', 'User 1'));
      await repository.save(createCustomer('user2@example.com', 'User 2'));

      const all = await repository.findAll();

      expect(all).toHaveLength(2);
    });

    context('when 顧客なし', () => {
      it('空配列を返す', async () => {
        const all = await repository.findAll();
        expect(all).toHaveLength(0);
      });
    });
  });

  describe('#delete', () => {
    it('顧客を削除できる', async () => {
      const customer = createCustomer('delete@example.com');
      await repository.save(customer);

      await repository.delete(customer.getId());

      const found = await repository.findById(customer.getId());
      expect(found).toBeNull();
    });
  });

  describe('更新', () => {
    it('既存の顧客を更新できる', async () => {
      const customer = createCustomer('update@example.com', 'Before');
      await repository.save(customer);

      customer.updateProfile('After', customer.getEmail());
      await repository.save(customer);

      const found = await repository.findById(customer.getId());
      expect(found!.getName()).toBe('After');
    });
  });
});
