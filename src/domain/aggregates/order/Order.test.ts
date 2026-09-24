import { Address, Money, Quantity } from '../../shared/value-objects';
import { CustomerId } from '../customer/CustomerId';
import { ProductId } from '../product/ProductId';
import { EmptyOrderError, InvalidOrderStateError } from './errors';
import { Order } from './Order';
import { type OrderItem } from './OrderItem';
import { OrderStatus } from './OrderStatus';

describe('Order', () => {
  const customerId = () => CustomerId.fromString('customer-1');
  const productId = (n = 1) => ProductId.fromString(`product-${n}`);
  const address = () => Address.create('100-0001', '東京都', '千代田区', '1-1-1');
  const createOrder = () => Order.create(customerId());

  const addItem = (order: Order, n = 1) => {
    order.addItem(productId(n), `商品${n}`, Money.create(1000), Quantity.create(1));
  };

  const prepareForConfirm = (order: Order) => {
    addItem(order);
    order.setShippingAddress(address());
  };

  describe('.create', () => {
    it('PENDING状態で作成する', () => {
      const order = createOrder();
      expect(order.getStatus()).toBe(OrderStatus.PENDING);
      expect(order.getCustomerId().equals(customerId())).toBe(true);
      expect(order.getItems()).toHaveLength(0);
    });
  });

  describe('#addItem', () => {
    it('商品を追加する', () => {
      const order = createOrder();
      addItem(order);
      expect(order.getItems()).toHaveLength(1);
    });

    it('同じ商品は数量を加算する', () => {
      const order = createOrder();
      addItem(order, 1);
      order.addItem(productId(1), '商品1', Money.create(1000), Quantity.create(3));
      expect(order.getItems()[0].getQuantity().getValue()).toBe(4);
    });

    context('when PENDING以外', () => {
      it('エラーを投げる', () => {
        const order = createOrder();
        prepareForConfirm(order);
        order.confirm();
        expect(() => {
          addItem(order, 2);
        }).toThrow(InvalidOrderStateError);
      });
    });
  });

  describe('#removeItem', () => {
    it('商品を削除する', () => {
      const order = createOrder();
      addItem(order);
      order.removeItem(productId());
      expect(order.getItems()).toHaveLength(0);
    });
  });

  describe('#updateItemQuantity', () => {
    it('数量を更新する', () => {
      const order = createOrder();
      addItem(order);
      order.updateItemQuantity(productId(), Quantity.create(5));
      expect(order.getItems()[0].getQuantity().getValue()).toBe(5);
    });

    it('0にすると削除される', () => {
      const order = createOrder();
      addItem(order);
      order.updateItemQuantity(productId(), Quantity.zero());
      expect(order.getItems()).toHaveLength(0);
    });

    context('when 商品が見つからない', () => {
      it('エラーを投げる', () => {
        const order = createOrder();
        expect(() => {
          order.updateItemQuantity(productId(99), Quantity.create(1));
        }).toThrow('注文内に商品が見つかりません');
      });
    });
  });

  describe('#getItemCount', () => {
    it('明細数を返す', () => {
      const order = createOrder();
      addItem(order, 1);
      addItem(order, 2);
      expect(order.getItemCount()).toBe(2);
    });
  });

  describe('#getTotalAmount', () => {
    it('合計金額を計算する', () => {
      const order = createOrder();
      order.addItem(productId(1), '商品1', Money.create(1000), Quantity.create(2));
      order.addItem(productId(2), '商品2', Money.create(500), Quantity.create(3));
      expect(order.getTotalAmount().getAmount()).toBe(3500);
    });
  });

  describe('#isEmpty', () => {
    context('when 空', () => {
      it('trueを返す', () => {
        expect(createOrder().isEmpty()).toBe(true);
      });
    });

    context('when 商品あり', () => {
      it('falseを返す', () => {
        const order = createOrder();
        addItem(order);
        expect(order.isEmpty()).toBe(false);
      });
    });
  });

  describe('#confirm', () => {
    it('CONFIRMEDに遷移する', () => {
      const order = createOrder();
      prepareForConfirm(order);
      order.confirm();
      expect(order.getStatus()).toBe(OrderStatus.CONFIRMED);
    });

    context('when 空の注文', () => {
      it('エラーを投げる', () => {
        const order = createOrder();
        order.setShippingAddress(address());
        expect(() => {
          order.confirm();
        }).toThrow(EmptyOrderError);
      });
    });

    context('without 配送先', () => {
      it('エラーを投げる', () => {
        const order = createOrder();
        addItem(order);
        expect(() => {
          order.confirm();
        }).toThrow('配送先の設定が必要です');
      });
    });
  });

  describe('#markAsPaid', () => {
    it('PAIDに遷移する', () => {
      const order = createOrder();
      prepareForConfirm(order);
      order.confirm();
      order.markAsPaid();
      expect(order.getStatus()).toBe(OrderStatus.PAID);
    });
  });

  describe('#markAsShipped', () => {
    it('SHIPPEDに遷移する', () => {
      const order = createOrder();
      prepareForConfirm(order);
      order.confirm();
      order.markAsPaid();
      order.markAsShipped();
      expect(order.getStatus()).toBe(OrderStatus.SHIPPED);
    });
  });

  describe('#markAsDelivered', () => {
    it('DELIVEREDに遷移する', () => {
      const order = createOrder();
      prepareForConfirm(order);
      order.confirm();
      order.markAsPaid();
      order.markAsShipped();
      order.markAsDelivered();
      expect(order.getStatus()).toBe(OrderStatus.DELIVERED);
    });
  });

  describe('#cancel', () => {
    it('CANCELLEDに遷移する', () => {
      const order = createOrder();
      order.cancel();
      expect(order.getStatus()).toBe(OrderStatus.CANCELLED);
    });

    context('when SHIPPED以降', () => {
      it('エラーを投げる', () => {
        const order = createOrder();
        prepareForConfirm(order);
        order.confirm();
        order.markAsPaid();
        order.markAsShipped();
        expect(() => {
          order.cancel();
        }).toThrow(InvalidOrderStateError);
      });
    });
  });

  describe('#canBeCancelled', () => {
    it('PENDINGはtrue', () => {
      expect(createOrder().canBeCancelled()).toBe(true);
    });

    it('SHIPPEDはfalse', () => {
      const order = createOrder();
      prepareForConfirm(order);
      order.confirm();
      order.markAsPaid();
      order.markAsShipped();
      expect(order.canBeCancelled()).toBe(false);
    });
  });

  describe('集約の境界', () => {
    context('確定済みの注文で取得した明細から数量を変えようとしたとき', () => {
      it('注文の合計金額は変わらない', () => {
        const order = createOrder();
        prepareForConfirm(order);
        order.confirm();
        const before = order.getTotalAmount().getAmount();

        order.getItems()[0].withQuantity(Quantity.create(999));

        expect(order.getTotalAmount().getAmount()).toBe(before);
      });

      it('Order経由なら確定済みを理由に拒否される', () => {
        const order = createOrder();
        prepareForConfirm(order);
        order.confirm();

        expect(() => order.updateItemQuantity(productId(), Quantity.create(999))).toThrow(InvalidOrderStateError);
      });
    });

    it('getItems()で得た配列に要素を足しても明細は増えない', () => {
      const order = createOrder();
      addItem(order);

      (order.getItems() as OrderItem[]).push(order.getItems()[0]);

      expect(order.getItems()).toHaveLength(1);
    });
  });
});
