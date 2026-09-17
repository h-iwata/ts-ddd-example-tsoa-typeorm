import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { OrderEntity } from './OrderEntity';

// TypeORMの自動生成名（IDX_<ハッシュ>）はカラム構成から導出されるため、スキーマ変更で黙って変わる
export const UQ_CUSTOMERS_EMAIL = 'UQ_customers_email';

@Entity('customers')
export class CustomerEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Index(UQ_CUSTOMERS_EMAIL, { unique: true })
  @Column({ type: 'varchar', length: 255 })
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

  @OneToMany(
    () => OrderEntity,
    (order) => order.customer
  )
  orders?: OrderEntity[];
}
