import { injectable } from 'inversify';
import { type Repository } from 'typeorm';
import { Product, ProductId } from '../../domain/aggregates/product';
import { ProductNotFoundError } from '../../domain/aggregates/product/errors';
import { type IProductRepository } from '../../domain/repositories';
import { Money, Quantity } from '../../domain/shared/value-objects';
import { ProductEntity } from '../database/entities';
import { getEntityManager } from '../database/transactionContext';

@injectable()
export class ProductRepository implements IProductRepository {
  private get repository(): Repository<ProductEntity> {
    return getEntityManager().getRepository(ProductEntity);
  }

  async findById(id: ProductId): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { id: id.getValue() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByIdOrFail(id: ProductId): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id.getValue());
    }
    return product;
  }

  async findByIds(ids: ProductId[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const entities = await this.repository.findBy(ids.map((id) => ({ id: id.getValue() })));
    return entities.map((e) => this.toDomain(e));
  }

  // 在庫の確認と更新の間に他トランザクションを割り込ませないため、読み取り時に行ロックを取る。
  // id順で取ることで、複数商品をロックする際のデッドロックを避ける
  async findByIdsForUpdate(ids: ProductId[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const entities = await this.repository.find({
      where: ids.map((id) => ({ id: id.getValue() })),
      lock: { mode: 'pessimistic_write' },
      order: { id: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find();
    return entities.map((e) => this.toDomain(e));
  }

  // insertは存在確認をしないので、主キーが衝突すれば例外になる
  async add(product: Product): Promise<void> {
    await this.repository.insert(this.toEntity(product));
  }

  // TypeORMのsaveは存在確認付きのupsert。既存行があればUPDATEになる
  async save(product: Product): Promise<void> {
    await this.repository.save(this.toEntity(product));
  }

  async delete(id: ProductId): Promise<void> {
    await this.repository.delete({ id: id.getValue() });
  }

  private toDomain(entity: ProductEntity): Product {
    return Product.reconstruct({
      id: ProductId.fromString(entity.id),
      name: entity.name,
      description: entity.description ?? '',
      price: Money.create(entity.price, entity.currency),
      stock: Quantity.create(entity.stock),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(product: Product): ProductEntity {
    const entity = new ProductEntity();
    entity.id = product.getId().getValue();
    entity.name = product.getName();
    entity.description = product.getDescription();
    entity.price = product.getPrice().getAmount();
    entity.currency = product.getPrice().getCurrency();
    entity.stock = product.getStock().getValue();
    entity.createdAt = product.getCreatedAt();
    entity.updatedAt = product.getUpdatedAt();
    return entity;
  }
}
