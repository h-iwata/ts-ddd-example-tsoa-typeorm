import { type Express } from 'express';
import request from 'supertest';
import { createApp } from '../../app';

/**
 * APIのE2Eテスト
 *
 * 本番と同じ経路（tsoa生成ルート → DIコンテナ → ユースケース → TypeORMリポジトリ → MySQL）を通す。
 * ユニットテストも統合テストもDIコンテナを経由しないため、
 * `@inject()` の解決やtsoaのルーティングが壊れた場合はこのテストだけが検知できる。
 *
 * `createApp()` は `setupContainer()` を呼ぶが、同じ識別子への再バインドは
 * inversifyで多重登録になるため、アプリの生成は beforeAll で1度だけ行う。
 */
describe('API E2E', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  const createProduct = async (overrides: Record<string, unknown> = {}) => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: 'テスト商品', description: '説明', price: 1000, initialStock: 10, ...overrides });
    return response;
  };

  const createCustomer = async (overrides: Record<string, unknown> = {}) => {
    const response = await request(app)
      .post('/api/customers')
      .send({ name: 'テスト太郎', email: 'e2e@example.com', ...overrides });
    return response;
  };

  // 注文の確定には配送先が必要。注文は作成時に顧客の配送先を引き継ぐため、
  // 注文を作る前に顧客側へ設定しておく
  const createCustomerWithAddress = async (overrides: Record<string, unknown> = {}) => {
    const customer = await createCustomer(overrides);
    await request(app)
      .put(`/api/customers/${customer.body.id}/address`)
      .send({ postalCode: '150-0001', prefecture: '東京都', city: '渋谷区', street: '神宮前1-1-1' });
    return customer;
  };

  context('注文の基本フロー', () => {
    it('商品登録から注文確定まで一連の操作が成功し、在庫が引き当てられる', async () => {
      // ① 商品登録
      const product = await createProduct({ price: 1200, initialStock: 10 });
      expect(product.status).toBe(201);
      expect(product.body.stock).toBe(10);

      // ② 顧客登録
      const customer = await createCustomer();
      expect(customer.status).toBe(201);
      expect(customer.body.shippingAddress).toBeNull();

      // ③ 配送先設定
      const address = await request(app)
        .put(`/api/customers/${customer.body.id}/address`)
        .send({ postalCode: '150-0001', prefecture: '東京都', city: '渋谷区', street: '神宮前1-1-1' });
      expect(address.status).toBe(200);
      expect(address.body.shippingAddress.fullAddress).toContain('渋谷区');

      // ④ 注文作成
      const order = await request(app).post('/api/orders').send({ customerId: customer.body.id });
      expect(order.status).toBe(201);
      expect(order.body.status).toBe('PENDING');
      expect(order.body.items).toHaveLength(0);

      // ⑤ 商品追加
      const withItem = await request(app).post(`/api/orders/${order.body.id}/items`).send({ productId: product.body.id, quantity: 2 });
      expect(withItem.status).toBe(200);
      expect(withItem.body.items).toHaveLength(1);
      expect(withItem.body.totalAmount).toBe(2400);

      // ⑥ 注文確定
      const confirmed = await request(app).post(`/api/orders/${order.body.id}/confirm`).send();
      expect(confirmed.status).toBe(200);
      expect(confirmed.body.status).toBe('CONFIRMED');

      // 在庫が引き当てられている
      const afterConfirm = await request(app).get(`/api/products/${product.body.id}`);
      expect(afterConfirm.body.stock).toBe(8);
    });

    it('注文をキャンセルすると在庫が戻る', async () => {
      const product = await createProduct({ initialStock: 5 });
      const customer = await createCustomerWithAddress();
      const order = await request(app).post('/api/orders').send({ customerId: customer.body.id });
      await request(app).post(`/api/orders/${order.body.id}/items`).send({ productId: product.body.id, quantity: 3 });
      await request(app).post(`/api/orders/${order.body.id}/confirm`).send();

      const cancelled = await request(app).post(`/api/orders/${order.body.id}/cancel`).send();
      expect(cancelled.status).toBe(200);
      expect(cancelled.body.status).toBe('CANCELLED');

      const afterCancel = await request(app).get(`/api/products/${product.body.id}`);
      expect(afterCancel.body.stock).toBe(5);
    });
  });

  context('永続化', () => {
    it('登録した商品が一覧取得で返る', async () => {
      await createProduct({ name: '商品A' });
      await createProduct({ name: '商品B' });

      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.map((p: { name: string }) => p.name).sort()).toEqual(['商品A', '商品B']);
    });

    it('顧客の注文一覧を取得できる', async () => {
      const customer = await createCustomer();
      await request(app).post('/api/orders').send({ customerId: customer.body.id });
      await request(app).post('/api/orders').send({ customerId: customer.body.id });

      const response = await request(app).get(`/api/orders/customer/${customer.body.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  context('エラーレスポンス', () => {
    it('存在しない商品IDは404を返す', async () => {
      const response = await request(app).get('/api/products/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
      expect(response.body.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('必須項目が欠けたリクエストは400を返す', async () => {
      const response = await request(app).post('/api/products').send({ name: 'テスト商品' });
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    // Express 5では未パースのbodyが {} ではなく undefined になるため、挙動の固定を兼ねる
    it('bodyなしのリクエストは400を返す', async () => {
      const response = await request(app).post('/api/products').set('Content-Type', 'application/json').send();
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('メールアドレスが重複した場合は409を返す', async () => {
      await createCustomer({ email: 'duplicate@example.com' });
      const response = await createCustomer({ email: 'duplicate@example.com' });
      expect(response.status).toBe(409);
      expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('在庫を超える数量で確定すると400を返す', async () => {
      const product = await createProduct({ initialStock: 1 });
      const customer = await createCustomerWithAddress();
      const order = await request(app).post('/api/orders').send({ customerId: customer.body.id });
      await request(app).post(`/api/orders/${order.body.id}/items`).send({ productId: product.body.id, quantity: 5 });

      const response = await request(app).post(`/api/orders/${order.body.id}/confirm`).send();
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INSUFFICIENT_STOCK');
    });

    it('配送先が未設定の注文を確定すると400を返す', async () => {
      const product = await createProduct();
      const customer = await createCustomer(); // 配送先を設定しない
      const order = await request(app).post('/api/orders').send({ customerId: customer.body.id });
      await request(app).post(`/api/orders/${order.body.id}/items`).send({ productId: product.body.id, quantity: 1 });

      const response = await request(app).post(`/api/orders/${order.body.id}/confirm`).send();
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SHIPPING_ADDRESS_REQUIRED');
    });

    it('商品が空の注文を確定すると400を返す', async () => {
      const customer = await createCustomer();
      const order = await request(app).post('/api/orders').send({ customerId: customer.body.id });

      const response = await request(app).post(`/api/orders/${order.body.id}/confirm`).send();
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('EMPTY_ORDER');
    });
  });

  context('確定処理の原子性', () => {
    // 在庫の引き当てと注文の確定が同一トランザクションで行われることを検証する。
    // 確定が失敗した場合に在庫だけが減っていてはならない。
    it('確定に失敗した場合は在庫が変化しない', async () => {
      const product = await createProduct({ initialStock: 10 });
      const customer = await createCustomer(); // 配送先なし → 確定は失敗する
      const order = await request(app).post('/api/orders').send({ customerId: customer.body.id });
      await request(app).post(`/api/orders/${order.body.id}/items`).send({ productId: product.body.id, quantity: 3 });

      const response = await request(app).post(`/api/orders/${order.body.id}/confirm`).send();
      expect(response.status).toBe(400);

      const afterFailure = await request(app).get(`/api/products/${product.body.id}`);
      expect(afterFailure.body.stock).toBe(10);
    });

    it('確定済みの注文を再度確定しても在庫は二重に引き当てられない', async () => {
      const product = await createProduct({ initialStock: 10 });
      const customer = await createCustomerWithAddress();
      const order = await request(app).post('/api/orders').send({ customerId: customer.body.id });
      await request(app).post(`/api/orders/${order.body.id}/items`).send({ productId: product.body.id, quantity: 3 });
      await request(app).post(`/api/orders/${order.body.id}/confirm`).send();

      const second = await request(app).post(`/api/orders/${order.body.id}/confirm`).send();
      expect(second.status).toBe(400);

      const afterSecond = await request(app).get(`/api/products/${product.body.id}`);
      expect(afterSecond.body.stock).toBe(7);
    });
  });

  context('OpenAPI仕様の配信', () => {
    // res.sendFile を通るため、Express移行時の回帰検知を兼ねる
    it('/swagger.json がOpenAPI仕様を返す', async () => {
      const response = await request(app).get('/swagger.json');
      expect(response.status).toBe(200);
      expect(response.body.openapi ?? response.body.swagger).toBeDefined();
      expect(response.body.paths['/api/products']).toBeDefined();
    });
  });
});
