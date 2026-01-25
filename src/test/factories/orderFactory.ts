import { Factory } from 'fishery';
import { Order, OrderStatus, OrderItem } from '../../domain/aggregates/order';
import { OrderId } from '../../domain/aggregates/order/OrderId';
import { CustomerId } from '../../domain/aggregates/customer/CustomerId';
import { ProductId } from '../../domain/aggregates/product/ProductId';
import { Address, Money, Quantity } from '../../domain/shared/value-objects';

type OrderTransientParams = {
  customerId?: string;
  status?: OrderStatus;
  withItems?: boolean;
  withAddress?: boolean;
};

export const orderFactory = Factory.define<Order, OrderTransientParams>(
  ({ sequence, transientParams }) => {
    const customerId = transientParams.customerId ?? `customer-${sequence}`;
    const status = transientParams.status ?? OrderStatus.PENDING;
    const address = transientParams.withAddress
      ? Address.create('100-0001', '東京都', '千代田区', '1-1-1')
      : null;

    // CONFIRMED/PAID状態では直接アイテムを追加できないため、
    // reconstruct時にアイテムを含める
    const items: OrderItem[] = transientParams.withItems
      ? [
          OrderItem.create(
            ProductId.fromString(`product-${sequence}`),
            `商品${sequence}`,
            Money.create(1000),
            Quantity.create(2)
          ),
        ]
      : [];

    return Order.reconstruct(
      OrderId.fromString(`order-${sequence}`),
      CustomerId.fromString(customerId),
      items,
      status,
      address,
      new Date(),
      new Date()
    );
  }
);

// 確定済み注文用のファクトリ
export const confirmedOrderFactory = orderFactory.transient({
  status: OrderStatus.CONFIRMED,
  withItems: true,
  withAddress: true,
});

// 支払い済み注文用のファクトリ
export const paidOrderFactory = orderFactory.transient({
  status: OrderStatus.PAID,
  withItems: true,
  withAddress: true,
});
