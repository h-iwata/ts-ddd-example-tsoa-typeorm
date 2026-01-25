import { injectable } from 'inversify';
import { Order, OrderId } from '../../../domain/aggregates/order';
import { CustomerId } from '../../../domain/aggregates/customer';
import { IOrderRepository } from '../../../domain/repositories';

@injectable()
export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, Order> = new Map();

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id.getValue()) ?? null;
  }

  async findByCustomerId(customerId: CustomerId): Promise<Order[]> {
    const customerOrders: Order[] = [];
    for (const order of this.orders.values()) {
      if (order.getCustomerId().equals(customerId)) {
        customerOrders.push(order);
      }
    }
    return customerOrders;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.getId().getValue(), order);
  }

  async delete(id: OrderId): Promise<void> {
    this.orders.delete(id.getValue());
  }
}
