import { type Order } from '../aggregates/order';
import { type CustomerId, type OrderId } from '../value-objects';

export interface IOrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  findByIdOrFail(id: OrderId): Promise<Order>;
  findByIdForUpdateOrFail(id: OrderId): Promise<Order>;
  findByCustomerId(customerId: CustomerId): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  add(order: Order): Promise<void>;
  save(order: Order): Promise<void>;
  delete(id: OrderId): Promise<void>;
}
