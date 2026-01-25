import { Factory } from 'fishery';
import { Customer } from '../../domain/aggregates/customer';
import { CustomerId } from '../../domain/aggregates/customer/CustomerId';
import { Email } from '../../domain/aggregates/customer/Email';
import { Address } from '../../domain/shared/value-objects';

interface CustomerTransientParams {
  withAddress?: boolean;
}

export const customerFactory = Factory.define<Customer, CustomerTransientParams>(
  ({ sequence, transientParams }) => {
    const address = transientParams.withAddress
      ? Address.create('100-0001', '東京都', '千代田区', '1-1-1')
      : null;

    return Customer.reconstruct(
      CustomerId.fromString(`customer-${sequence}`),
      `テスト太郎${sequence}`,
      Email.create(`test${sequence}@example.com`),
      address,
      new Date(),
      new Date()
    );
  }
);
