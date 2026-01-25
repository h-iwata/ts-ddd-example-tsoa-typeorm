import { Order } from './Order';
import { OrderId } from './OrderId';
import { OrderItem } from './OrderItem';
import { OrderItemId } from './OrderItemId';
import { OrderStatus } from './OrderStatus';
import { CustomerId } from '../customer/CustomerId';
import { ProductId } from '../product/ProductId';
import { Money, Quantity, Address } from '../../shared/value-objects';
import { InvalidOrderStateError, EmptyOrderError } from './errors';

describe('Order', () => {
  const createTestOrder = () => {
    return Order.create(CustomerId.fromString('customer-1'));
  };

  const createTestAddress = () => {
    return Address.create('100-0001', '東京都', '千代田区', '1-1-1');
  };

  describe('create', () => {
    it('新しい注文を作成できる', () => {
      const order = createTestOrder();

      expect(order.getId()).toBeDefined();
      expect(order.getCustomerId().getValue()).toBe('customer-1');
      expect(order.getStatus()).toBe(OrderStatus.PENDING);
      expect(order.getItems()).toHaveLength(0);
      expect(order.getShippingAddress()).toBeNull();
      expect(order.getCreatedAt()).toBeInstanceOf(Date);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('reconstruct', () => {
    it('既存の注文を再構築できる', () => {
      const orderId = OrderId.fromString('order-1');
      const customerId = CustomerId.fromString('customer-1');
      const address = createTestAddress();
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');
      const items = [
        OrderItem.reconstruct(
          OrderItemId.fromString('item-1'),
          ProductId.fromString('product-1'),
          '商品1',
          Money.create(1000),
          Quantity.create(2)
        ),
      ];

      const order = Order.reconstruct(
        orderId,
        customerId,
        items,
        OrderStatus.CONFIRMED,
        address,
        createdAt,
        updatedAt
      );

      expect(order.getId().getValue()).toBe('order-1');
      expect(order.getStatus()).toBe(OrderStatus.CONFIRMED);
      expect(order.getItems()).toHaveLength(1);
      expect(order.getShippingAddress()).toBe(address);
    });
  });

  describe('addItem', () => {
    it('商品を追加できる', () => {
      const order = createTestOrder();
      const productId = ProductId.fromString('product-1');

      order.addItem(productId, '商品1', Money.create(1000), Quantity.create(2));

      expect(order.getItems()).toHaveLength(1);
      expect(order.getItems()[0].getProductId().getValue()).toBe('product-1');
    });

    it('同じ商品を追加すると数量が加算される', () => {
      const order = createTestOrder();
      const productId = ProductId.fromString('product-1');

      order.addItem(productId, '商品1', Money.create(1000), Quantity.create(2));
      order.addItem(productId, '商品1', Money.create(1000), Quantity.create(3));

      expect(order.getItems()).toHaveLength(1);
      expect(order.getItems()[0].getQuantity().getValue()).toBe(5);
    });

    it('PENDING以外の状態では追加できない', () => {
      const order = createTestOrder();
      const productId = ProductId.fromString('product-1');
      order.addItem(productId, '商品1', Money.create(1000), Quantity.create(1));
      order.setShippingAddress(createTestAddress());
      order.confirm();

      expect(() =>
        order.addItem(
          ProductId.fromString('product-2'),
          '商品2',
          Money.create(500),
          Quantity.create(1)
        )
      ).toThrow(InvalidOrderStateError);
    });
  });

  describe('removeItem', () => {
    it('商品を削除できる', () => {
      const order = createTestOrder();
      const productId = ProductId.fromString('product-1');
      order.addItem(productId, '商品1', Money.create(1000), Quantity.create(2));

      order.removeItem(productId);

      expect(order.getItems()).toHaveLength(0);
    });

    it('存在しない商品を削除しても問題ない', () => {
      const order = createTestOrder();
      order.removeItem(ProductId.fromString('non-existent'));
      expect(order.getItems()).toHaveLength(0);
    });
  });

  describe('updateItemQuantity', () => {
    it('数量を更新できる', () => {
      const order = createTestOrder();
      const productId = ProductId.fromString('product-1');
      order.addItem(productId, '商品1', Money.create(1000), Quantity.create(2));

      order.updateItemQuantity(productId, Quantity.create(5));

      expect(order.getItems()[0].getQuantity().getValue()).toBe(5);
    });

    it('数量を0にすると削除される', () => {
      const order = createTestOrder();
      const productId = ProductId.fromString('product-1');
      order.addItem(productId, '商品1', Money.create(1000), Quantity.create(2));

      order.updateItemQuantity(productId, Quantity.zero());

      expect(order.getItems()).toHaveLength(0);
    });

    it('存在しない商品の更新はエラー', () => {
      const order = createTestOrder();

      expect(() =>
        order.updateItemQuantity(
          ProductId.fromString('non-existent'),
          Quantity.create(1)
        )
      ).toThrow('注文内に商品が見つかりません');
    });
  });

  describe('setShippingAddress', () => {
    it('配送先を設定できる', () => {
      const order = createTestOrder();
      const address = createTestAddress();

      order.setShippingAddress(address);

      expect(order.getShippingAddress()).toBe(address);
    });
  });

  describe('getTotalAmount', () => {
    it('合計金額を計算できる', () => {
      const order = createTestOrder();
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(2)
      );
      order.addItem(
        ProductId.fromString('product-2'),
        '商品2',
        Money.create(500),
        Quantity.create(3)
      );

      expect(order.getTotalAmount().getAmount()).toBe(3500);
    });

    it('空の注文は0円', () => {
      const order = createTestOrder();
      expect(order.getTotalAmount().getAmount()).toBe(0);
    });
  });

  describe('getItemCount', () => {
    it('明細数を取得できる', () => {
      const order = createTestOrder();
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(1)
      );
      order.addItem(
        ProductId.fromString('product-2'),
        '商品2',
        Money.create(500),
        Quantity.create(1)
      );

      expect(order.getItemCount()).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('空の注文は true', () => {
      const order = createTestOrder();
      expect(order.isEmpty()).toBe(true);
    });

    it('商品がある注文は false', () => {
      const order = createTestOrder();
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(1)
      );
      expect(order.isEmpty()).toBe(false);
    });
  });

  describe('confirm', () => {
    it('注文を確定できる', () => {
      const order = createTestOrder();
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(1)
      );
      order.setShippingAddress(createTestAddress());

      order.confirm();

      expect(order.getStatus()).toBe(OrderStatus.CONFIRMED);
    });

    it('空の注文は確定できない', () => {
      const order = createTestOrder();
      order.setShippingAddress(createTestAddress());

      expect(() => order.confirm()).toThrow(EmptyOrderError);
    });

    it('配送先未設定では確定できない', () => {
      const order = createTestOrder();
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(1)
      );

      expect(() => order.confirm()).toThrow('配送先の設定が必要です');
    });

    it('PENDING以外からは確定できない', () => {
      const order = createTestOrder();
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(1)
      );
      order.setShippingAddress(createTestAddress());
      order.confirm();

      expect(() => order.confirm()).toThrow(InvalidOrderStateError);
    });
  });

  describe('markAsPaid', () => {
    it('支払い完了にできる', () => {
      const order = createTestOrder();
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(1)
      );
      order.setShippingAddress(createTestAddress());
      order.confirm();

      order.markAsPaid();

      expect(order.getStatus()).toBe(OrderStatus.PAID);
    });

    it('CONFIRMED以外からは遷移できない', () => {
      const order = createTestOrder();
      expect(() => order.markAsPaid()).toThrow(InvalidOrderStateError);
    });
  });

  describe('markAsShipped', () => {
    it('発送済みにできる', () => {
      const order = createTestOrder();
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(1)
      );
      order.setShippingAddress(createTestAddress());
      order.confirm();
      order.markAsPaid();

      order.markAsShipped();

      expect(order.getStatus()).toBe(OrderStatus.SHIPPED);
    });
  });

  describe('markAsDelivered', () => {
    it('配達完了にできる', () => {
      const order = createTestOrder();
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(1)
      );
      order.setShippingAddress(createTestAddress());
      order.confirm();
      order.markAsPaid();
      order.markAsShipped();

      order.markAsDelivered();

      expect(order.getStatus()).toBe(OrderStatus.DELIVERED);
    });
  });

  describe('cancel', () => {
    it('注文をキャンセルできる', () => {
      const order = createTestOrder();
      order.cancel();
      expect(order.getStatus()).toBe(OrderStatus.CANCELLED);
    });

    it('SHIPPED以降はキャンセルできない', () => {
      const order = createTestOrder();
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(1)
      );
      order.setShippingAddress(createTestAddress());
      order.confirm();
      order.markAsPaid();
      order.markAsShipped();

      expect(() => order.cancel()).toThrow(InvalidOrderStateError);
    });
  });

  describe('canBeCancelled', () => {
    it('PENDING はキャンセル可能', () => {
      const order = createTestOrder();
      expect(order.canBeCancelled()).toBe(true);
    });

    it('SHIPPED はキャンセル不可', () => {
      const order = createTestOrder();
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(1)
      );
      order.setShippingAddress(createTestAddress());
      order.confirm();
      order.markAsPaid();
      order.markAsShipped();

      expect(order.canBeCancelled()).toBe(false);
    });
  });
});
