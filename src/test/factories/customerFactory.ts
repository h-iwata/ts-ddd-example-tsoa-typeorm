import { Factory } from 'fishery';
import { Customer } from '../../domain/aggregates/customer';
import { CustomerId } from '../../domain/aggregates/customer/CustomerId';
import { Email } from '../../domain/aggregates/customer/Email';
import { Address } from '../../domain/shared/value-objects';

interface CustomerTransientParams {
  withAddress?: boolean;
}

export const customerFactory = Factory.define<Customer, CustomerTransientParams>(({ sequence, transientParams }) => {
  const address = transientParams.withAddress ? Address.create('100-0001', '東京都', '千代田区', '1-1-1') : null;

  return Customer.reconstruct({
    id: CustomerId.fromString(`customer-${sequence}`),
    name: `テスト太郎${sequence}`,
    email: Email.create(`test${sequence}@example.com`),
    shippingAddress: address,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

/**
 * 新規顧客作成用ファクトリ（統合テスト用）
 * Customer.create() を使用してIDを自動生成
 */
export const newCustomerFactory = Factory.define<Customer, CustomerTransientParams>(({ sequence, transientParams }) => {
  const customer = Customer.create(`テスト太郎${sequence}`, Email.create(`test${sequence}@example.com`));

  if (transientParams.withAddress) {
    customer.setShippingAddress(Address.create('100-0001', '東京都', '千代田区', '1-1-1'));
  }

  return customer;
});
