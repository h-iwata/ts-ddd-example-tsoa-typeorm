import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import {
  ProductEntity,
  CustomerEntity,
  OrderEntity,
  OrderItemEntity,
} from './entities';

const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3307'),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? 'password',
  database: isTest ? 'ddd_example_test' : (process.env.DB_DATABASE ?? 'ddd_example'),
  charset: 'utf8mb4',
  synchronize: isTest, // テスト時のみ自動同期
  dropSchema: isTest,  // テスト時のみスキーマ削除
  logging: !isTest && process.env.NODE_ENV !== 'production',
  entities: [ProductEntity, CustomerEntity, OrderEntity, OrderItemEntity],
  migrations: isTest ? [] : ['src/infrastructure/database/migrations/*.ts'],
  subscribers: [],
});
