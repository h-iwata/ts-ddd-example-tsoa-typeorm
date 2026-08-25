import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { CustomerEntity } from './CustomerEntity';
import { OrderItemEntity } from './OrderItemEntity';

@Entity('orders')
export class OrderEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ name: 'customer_id', type: 'varchar', length: 36 })
  customerId!: string;

  @Column({ type: 'varchar', length: 20 })
  status!: string;

  @Column({ name: 'total_price', type: 'int' })
  totalPrice!: number;

  @Column({ type: 'varchar', length: 3, default: 'JPY' })
  currency!: string;

  @Column({ name: 'shipping_postal_code', type: 'varchar', length: 10, nullable: true })
  shippingPostalCode?: string;

  @Column({ name: 'shipping_prefecture', type: 'varchar', length: 50, nullable: true })
  shippingPrefecture?: string;

  @Column({ name: 'shipping_city', type: 'varchar', length: 100, nullable: true })
  shippingCity?: string;

  @Column({ name: 'shipping_street', type: 'varchar', length: 255, nullable: true })
  shippingStreet?: string;

  @Column({ name: 'shipping_building', type: 'varchar', length: 255, nullable: true })
  shippingBuilding?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(
    () => CustomerEntity,
    (customer) => customer.orders
  )
  @JoinColumn({ name: 'customer_id' })
  customer?: CustomerEntity;

  @OneToMany(
    () => OrderItemEntity,
    (item) => item.order,
    { cascade: true }
  )
  items?: OrderItemEntity[];
}
