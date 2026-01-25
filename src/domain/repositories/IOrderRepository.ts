import { type Order } from '../aggregates/order';
import { type OrderId, type CustomerId } from '../value-objects';

export interface IOrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  findByCustomerId(customerId: CustomerId): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  save(order: Order): Promise<void>;
  delete(id: OrderId): Promise<void>;
}
