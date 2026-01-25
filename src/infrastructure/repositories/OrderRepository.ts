import { injectable } from 'inversify';
import { Repository } from 'typeorm';
import { Order, OrderItem, OrderStatus, OrderId, OrderItemId } from '../../domain/aggregates/order';
import { CustomerId } from '../../domain/aggregates/customer';
import { ProductId } from '../../domain/aggregates/product';
import { Money, Quantity } from '../../domain/shared/value-objects';
import { IOrderRepository } from '../../domain/repositories';
import { AppDataSource } from '../database';
import { OrderEntity, OrderItemEntity } from '../database/entities';

@injectable()
export class OrderRepository implements IOrderRepository {
  private get repository(): Repository<OrderEntity> {
    return AppDataSource.getRepository(OrderEntity);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const entity = await this.repository.findOne({
      where: { id: id.getValue() },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: CustomerId): Promise<Order[]> {
    const entities = await this.repository.find({
      where: { customerId: customerId.getValue() },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findAll(): Promise<Order[]> {
    const entities = await this.repository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async save(order: Order): Promise<void> {
    const entity = this.toEntity(order);
    await this.repository.save(entity);
  }

  async delete(id: OrderId): Promise<void> {
    await this.repository.delete({ id: id.getValue() });
  }

  private toDomain(entity: OrderEntity): Order {
    const items = (entity.items || []).map((itemEntity) =>
      OrderItem.reconstruct(
        OrderItemId.fromString(itemEntity.id),
        ProductId.fromString(itemEntity.productId),
        itemEntity.productName,
        Money.create(itemEntity.unitPrice, itemEntity.currency),
        Quantity.create(itemEntity.quantity)
      )
    );

    return Order.reconstruct(
      OrderId.fromString(entity.id),
      CustomerId.fromString(entity.customerId),
      items,
      entity.status as OrderStatus,
      null, // shippingAddress - OrderEntityには保存していないためnull
      entity.createdAt,
      entity.updatedAt
    );
  }

  private toEntity(order: Order): OrderEntity {
    const entity = new OrderEntity();
    entity.id = order.getId().getValue();
    entity.customerId = order.getCustomerId().getValue();
    entity.status = order.getStatus();
    entity.totalPrice = order.getTotalAmount().getAmount();
    entity.currency = order.getTotalAmount().getCurrency();
    entity.createdAt = order.getCreatedAt();
    entity.updatedAt = order.getUpdatedAt();

    entity.items = order.getItems().map((item) => {
      const itemEntity = new OrderItemEntity();
      itemEntity.id = item.getId().getValue();
      itemEntity.orderId = order.getId().getValue();
      itemEntity.productId = item.getProductId().getValue();
      itemEntity.productName = item.getProductName();
      itemEntity.quantity = item.getQuantity().getValue();
      itemEntity.unitPrice = item.getUnitPrice().getAmount();
      itemEntity.currency = item.getUnitPrice().getCurrency();
      return itemEntity;
    });

    return entity;
  }
}
