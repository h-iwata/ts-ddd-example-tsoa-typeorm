import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItemEntity } from './OrderItemEntity';

@Entity('products')
export class ProductEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int' })
  price!: number;

  @Column({ type: 'varchar', length: 3, default: 'JPY' })
  currency!: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.product)
  orderItems?: OrderItemEntity[];
}
