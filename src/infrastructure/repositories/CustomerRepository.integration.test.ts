import { Customer, CustomerId, Email } from '../../domain/aggregates/customer';
import { EmailAlreadyExistsError } from '../../domain/aggregates/customer/errors';
import { Address } from '../../domain/shared/value-objects';
import { newCustomerFactory } from '../../test/factories';
import { CustomerRepository } from './CustomerRepository';

describe('CustomerRepository Integration', () => {
  const repository = new CustomerRepository();

  describe('#save と #findById', () => {
    it('顧客を保存して取得できる', async () => {
      const customer = newCustomerFactory.build();
      await repository.save(customer);

      const found = await repository.findById(customer.getId());

      expect(found).not.toBeNull();
      expect(found!.getId().getValue()).toBe(customer.getId().getValue());
      expect(found!.getName()).toBe(customer.getName());
      expect(found!.getEmail().getValue()).toBe(customer.getEmail().getValue());
    });

    context('with 配送先住所', () => {
      it('住所も保存される', async () => {
        const customer = newCustomerFactory.build();
        customer.setShippingAddress(Address.create('100-0001', '東京都', '千代田区', '1-1-1', 'ビル101'));
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
      const customer = newCustomerFactory.build();
      await repository.save(customer);

      const found = await repository.findByEmail(customer.getEmail());

      expect(found).not.toBeNull();
      expect(found!.getId().getValue()).toBe(customer.getId().getValue());
    });

    context('when 存在しないメール', () => {
      it('nullを返す', async () => {
        const customer = newCustomerFactory.build();
        const found = await repository.findByEmail(customer.getEmail());
        expect(found).toBeNull();
      });
    });
  });

  describe('#existsByEmail', () => {
    it('存在する場合 true', async () => {
      const customer = newCustomerFactory.build();
      await repository.save(customer);

      const exists = await repository.existsByEmail(customer.getEmail());

      expect(exists).toBe(true);
    });

    it('存在しない場合 false', async () => {
      const customer = newCustomerFactory.build();
      const exists = await repository.existsByEmail(customer.getEmail());
      expect(exists).toBe(false);
    });
  });

  describe('#findAll', () => {
    it('全顧客を取得できる', async () => {
      await repository.save(newCustomerFactory.build());
      await repository.save(newCustomerFactory.build());

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
      const customer = newCustomerFactory.build();
      await repository.save(customer);

      await repository.delete(customer.getId());

      const found = await repository.findById(customer.getId());
      expect(found).toBeNull();
    });
  });

  describe('更新', () => {
    it('既存の顧客を更新できる', async () => {
      const customer = newCustomerFactory.build();
      await repository.save(customer);

      customer.updateProfile('更新後の名前', customer.getEmail());
      await repository.save(customer);

      const found = await repository.findById(customer.getId());
      expect(found!.getName()).toBe('更新後の名前');
    });
  });

  describe('#add', () => {
    context('同じIDの顧客が既に存在するとき', () => {
      it('例外を投げ、既存データを上書きしない', async () => {
        const existing = newCustomerFactory.build();
        await repository.add(existing);

        const conflicting = Customer.reconstruct({
          id: existing.getId(),
          name: '上書きしようとする顧客',
          email: Email.create('overwrite@example.com'),
          shippingAddress: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await expect(repository.add(conflicting)).rejects.toThrow();

        const found = await repository.findById(existing.getId());
        expect(found!.getName()).toBe(existing.getName());
      });
    });

    context('メールアドレスが重複するとき', () => {
      it('EmailAlreadyExistsErrorに翻訳される', async () => {
        await repository.add(Customer.create('先行', Email.create('add-dup@example.com')));

        await expect(repository.add(Customer.create('後続', Email.create('add-dup@example.com')))).rejects.toThrow(EmailAlreadyExistsError);
      });
    });
  });

  describe('一意制約違反の翻訳', () => {
    const duplicated = () => Customer.create('別の顧客', Email.create('duplicate@example.com'));

    context('同じメールアドレスの顧客を保存したとき', () => {
      it('EmailAlreadyExistsErrorに翻訳される', async () => {
        await repository.save(duplicated());

        await expect(repository.save(duplicated())).rejects.toThrow(EmailAlreadyExistsError);
      });

      it('TypeORMのQueryFailedErrorが外へ漏れない', async () => {
        await repository.save(duplicated());

        const error = await repository.save(duplicated()).catch((e: unknown) => e);
        expect((error as Error).constructor.name).toBe('EmailAlreadyExistsError');
      });
    });
  });
});
