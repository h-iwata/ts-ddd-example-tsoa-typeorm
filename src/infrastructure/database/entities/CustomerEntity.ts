import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderEntity } from './OrderEntity';

@Entity('customers')
export class CustomerEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

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

  @OneToMany(() => OrderEntity, (order) => order.customer)
  orders?: OrderEntity[];
}
