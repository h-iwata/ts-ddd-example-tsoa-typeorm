import { injectable } from 'inversify';
import { type Repository } from 'typeorm';
import { CustomerId } from '../../domain/aggregates/customer';
import { Order, OrderId, OrderItem, OrderItemId, type OrderStatus } from '../../domain/aggregates/order';
import { ProductId } from '../../domain/aggregates/product';
import { type IOrderRepository } from '../../domain/repositories';
import { Address, Money, Quantity } from '../../domain/shared/value-objects';
import { OrderEntity, OrderItemEntity } from '../database/entities';
import { getEntityManager, runInTransaction } from '../database/transactionContext';

@injectable()
export class OrderRepository implements IOrderRepository {
  private get repository(): Repository<OrderEntity> {
    return getEntityManager().getRepository(OrderEntity);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const entity = await this.repository.findOne({
      where: { id: id.getValue() },
      relations: { items: true },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: CustomerId): Promise<Order[]> {
    const entities = await this.repository.find({
      where: { customerId: customerId.getValue() },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findAll(): Promise<Order[]> {
    const entities = await this.repository.find({
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  // insertは存在確認をしないので、主キーが衝突すれば例外になる
  async add(order: Order): Promise<void> {
    // 注文だけが残る中途半端な状態を防ぐため、集約1つの保存をトランザクションで束ねる
    await runInTransaction(async () => {
      const entity = this.toEntity(order);
      await this.repository.insert(entity);
      // insertはリレーションをカスケードしないので、明細は自分で挿入する
      if (entity.items && entity.items.length > 0) {
        await getEntityManager().getRepository(OrderItemEntity).insert(entity.items);
      }
    });
  }

  // TypeORMのsaveは存在確認付きのupsert。既存行があればUPDATEになる
  async save(order: Order): Promise<void> {
    await this.repository.save(this.toEntity(order));
  }

  async delete(id: OrderId): Promise<void> {
    await this.repository.delete({ id: id.getValue() });
  }

  private toDomain(entity: OrderEntity): Order {
    const items = (entity.items ?? []).map((itemEntity) =>
      OrderItem.reconstruct(
        OrderItemId.fromString(itemEntity.id),
        ProductId.fromString(itemEntity.productId),
        itemEntity.productName,
        Money.create(itemEntity.unitPrice, itemEntity.currency),
        Quantity.create(itemEntity.quantity)
      )
    );

    return Order.reconstruct({
      id: OrderId.fromString(entity.id),
      customerId: CustomerId.fromString(entity.customerId),
      items,
      status: entity.status as OrderStatus,
      shippingAddress: this.toAddress(entity),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toAddress(entity: OrderEntity): Address | null {
    if (!(entity.shippingPostalCode && entity.shippingPrefecture && entity.shippingCity && entity.shippingStreet)) {
      return null;
    }

    return Address.create(
      entity.shippingPostalCode,
      entity.shippingPrefecture,
      entity.shippingCity,
      entity.shippingStreet,
      entity.shippingBuilding
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
    this.applyShippingAddress(entity, order.getShippingAddress());
    entity.items = order.getItems().map((item) => this.toItemEntity(order.getId().getValue(), item));

    return entity;
  }

  private applyShippingAddress(entity: OrderEntity, address: Address | null): void {
    if (!address) {
      return;
    }
    entity.shippingPostalCode = address.getPostalCode();
    entity.shippingPrefecture = address.getPrefecture();
    entity.shippingCity = address.getCity();
    entity.shippingStreet = address.getStreet();
    entity.shippingBuilding = address.getBuilding();
  }

  private toItemEntity(orderId: string, item: OrderItem): OrderItemEntity {
    const itemEntity = new OrderItemEntity();
    itemEntity.id = item.getId().getValue();
    itemEntity.orderId = orderId;
    itemEntity.productId = item.getProductId().getValue();
    itemEntity.productName = item.getProductName();
    itemEntity.quantity = item.getQuantity().getValue();
    itemEntity.unitPrice = item.getUnitPrice().getAmount();
    itemEntity.currency = item.getUnitPrice().getCurrency();
    return itemEntity;
  }
}
