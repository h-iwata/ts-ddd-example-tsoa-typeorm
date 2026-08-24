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
