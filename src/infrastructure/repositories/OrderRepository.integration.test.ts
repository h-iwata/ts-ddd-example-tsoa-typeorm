import { type Customer } from '../../domain/aggregates/customer';
import { type Order, OrderId } from '../../domain/aggregates/order';
import { type Product, ProductId } from '../../domain/aggregates/product';
import { Address, Money, Quantity } from '../../domain/shared/value-objects';
import { newCustomerFactory, newOrderFactory, newProductFactory } from '../../test/factories';
import { CustomerRepository } from './CustomerRepository';
import { OrderRepository } from './OrderRepository';
import { ProductRepository } from './ProductRepository';

describe('OrderRepository Integration', () => {
  const orderRepository = new OrderRepository();
  const customerRepository = new CustomerRepository();
  const productRepository = new ProductRepository();

  let savedCustomer: Customer;
  let savedProduct: Product;

  beforeEach(async () => {
    savedCustomer = newCustomerFactory.build();
    await customerRepository.save(savedCustomer);

    savedProduct = newProductFactory.build({}, { transient: { stock: 100 } });
    await productRepository.save(savedProduct);
  });

  const createOrder = () => {
    return newOrderFactory.build({}, { transient: { customerId: savedCustomer.getId().getValue() } });
  };

  const addItemToOrder = (order: Order) => {
    order.addItem(savedProduct.getId(), savedProduct.getName(), savedProduct.getPrice(), Quantity.create(2));
  };

  describe('#save と #findById', () => {
    it('注文を保存して取得できる', async () => {
      const order = createOrder();
      addItemToOrder(order);
      await orderRepository.save(order);

      const found = await orderRepository.findById(order.getId());

      expect(found).not.toBeNull();
      expect(found!.getId().getValue()).toBe(order.getId().getValue());
      expect(found!.getCustomerId().getValue()).toBe(savedCustomer.getId().getValue());
      expect(found!.getItems()).toHaveLength(1);
    });

    context('with 注文明細', () => {
      it('明細も保存される', async () => {
        const order = createOrder();
        addItemToOrder(order);
        await orderRepository.save(order);

        const found = await orderRepository.findById(order.getId());

        const item = found!.getItems()[0];
        expect(item.getProductId().getValue()).toBe(savedProduct.getId().getValue());
        expect(item.getProductName()).toBe(savedProduct.getName());
        expect(item.getUnitPrice().getAmount()).toBe(1000);
        expect(item.getQuantity().getValue()).toBe(2);
      });
    });

    context('when 存在しないID', () => {
      it('nullを返す', async () => {
        const found = await orderRepository.findById(OrderId.fromString('non-existent'));
        expect(found).toBeNull();
      });
    });
  });

  describe('#findByCustomerId', () => {
    it('顧客IDで注文を取得できる', async () => {
      const order1 = createOrder();
      addItemToOrder(order1);
      const order2 = createOrder();
      addItemToOrder(order2);
      await orderRepository.save(order1);
      await orderRepository.save(order2);

      const found = await orderRepository.findByCustomerId(savedCustomer.getId());

      expect(found).toHaveLength(2);
    });

    context('when 注文なし', () => {
      it('空配列を返す', async () => {
        const otherCustomer = newCustomerFactory.build();
        await customerRepository.save(otherCustomer);

        const found = await orderRepository.findByCustomerId(otherCustomer.getId());

        expect(found).toHaveLength(0);
      });
    });
  });

  describe('#findAll', () => {
    it('全注文を取得できる', async () => {
      const order1 = createOrder();
      addItemToOrder(order1);
      const order2 = createOrder();
      addItemToOrder(order2);
      await orderRepository.save(order1);
      await orderRepository.save(order2);

      const all = await orderRepository.findAll();

      expect(all).toHaveLength(2);
    });

    context('when 注文なし', () => {
      it('空配列を返す', async () => {
        const all = await orderRepository.findAll();
        expect(all).toHaveLength(0);
      });
    });
  });

  describe('#delete', () => {
    it('注文を削除できる', async () => {
      const order = createOrder();
      addItemToOrder(order);
      await orderRepository.save(order);

      await orderRepository.delete(order.getId());

      const found = await orderRepository.findById(order.getId());
      expect(found).toBeNull();
    });
  });

  describe('更新', () => {
    it('既存の注文を更新できる（ステータス変更）', async () => {
      const order = createOrder();
      addItemToOrder(order);
      order.setShippingAddress(Address.create('100-0001', '東京都', '千代田区', '1-1-1'));
      await orderRepository.save(order);

      order.confirm();
      await orderRepository.save(order);

      const found = await orderRepository.findById(order.getId());
      expect(found!.getStatus()).toBe('CONFIRMED');
    });

    it('明細を追加して更新できる', async () => {
      const order = createOrder();
      addItemToOrder(order);
      await orderRepository.save(order);

      const anotherProduct = newProductFactory.build({}, { transient: { price: 500, stock: 50 } });
      await productRepository.save(anotherProduct);
      order.addItem(anotherProduct.getId(), anotherProduct.getName(), anotherProduct.getPrice(), Quantity.create(3));
      await orderRepository.save(order);

      const found = await orderRepository.findById(order.getId());
      expect(found!.getItems()).toHaveLength(2);
    });
  });

  describe('#add', () => {
    it('明細を持つ注文を追加しても明細が失われない', async () => {
      const order = createOrder();
      addItemToOrder(order);
      await orderRepository.add(order);

      const found = await orderRepository.findById(order.getId());
      expect(found!.getItems()).toHaveLength(1);
    });

    it('明細の保存に失敗したら注文も残らない', async () => {
      const order = createOrder();
      order.addItem(ProductId.fromString('missing-product'), '存在しない商品', Money.create(100), Quantity.create(1));

      await expect(orderRepository.add(order)).rejects.toThrow();

      expect(await orderRepository.findById(order.getId())).toBeNull();
    });

    context('同じIDの注文が既に存在するとき', () => {
      it('例外を投げる', async () => {
        const order = createOrder();
        await orderRepository.add(order);

        await expect(orderRepository.add(order)).rejects.toThrow();
      });
    });
  });
});
