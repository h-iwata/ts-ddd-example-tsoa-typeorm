import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { OrderEntity } from './OrderEntity';
import { ProductEntity } from './ProductEntity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ name: 'order_id', type: 'varchar', length: 36 })
  orderId!: string;

  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId!: string;

  @Column({ name: 'product_name', type: 'varchar', length: 255 })
  productName!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'int' })
  unitPrice!: number;

  @Column({ type: 'varchar', length: 3, default: 'JPY' })
  currency!: string;

  @ManyToOne(
    () => OrderEntity,
    (order) => order.items,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'order_id' })
  order?: OrderEntity;

  @ManyToOne(
    () => ProductEntity,
    (product) => product.orderItems
  )
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity;
}
