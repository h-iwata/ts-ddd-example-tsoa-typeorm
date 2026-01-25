import 'reflect-metadata';
import { AppDataSource } from '../../infrastructure/database';

// RSpec風のcontext記法を有効化
 
declare global {
  var context: typeof describe;
}
global.context = describe;

beforeAll(async () => {
  // テスト用データベースに接続
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  // 接続をクローズ
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

beforeEach(async () => {
  // 各テスト前にテーブルをクリア
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
  await queryRunner.query('TRUNCATE TABLE order_items');
  await queryRunner.query('TRUNCATE TABLE orders');
  await queryRunner.query('TRUNCATE TABLE customers');
  await queryRunner.query('TRUNCATE TABLE products');
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  await queryRunner.release();
});
