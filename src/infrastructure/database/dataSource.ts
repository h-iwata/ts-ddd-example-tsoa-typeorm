import { DataSource } from 'typeorm';
import {
  ProductEntity,
  CustomerEntity,
  OrderEntity,
  OrderItemEntity,
} from './entities';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'ddd_example',
  synchronize: process.env.NODE_ENV !== 'production', // 本番では false
  logging: process.env.NODE_ENV !== 'production',
  entities: [ProductEntity, CustomerEntity, OrderEntity, OrderItemEntity],
  migrations: [],
  subscribers: [],
});
