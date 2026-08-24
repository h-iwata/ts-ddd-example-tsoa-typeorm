import { injectable } from 'inversify';
import { type Repository } from 'typeorm';
import { Product, ProductId } from '../../domain/aggregates/product';
import { type IProductRepository } from '../../domain/repositories';
import { Money, Quantity } from '../../domain/shared/value-objects';
import { AppDataSource } from '../database';
import { ProductEntity } from '../database/entities';

@injectable()
export class ProductRepository implements IProductRepository {
  private get repository(): Repository<ProductEntity> {
    return AppDataSource.getRepository(ProductEntity);
  }

  async findById(id: ProductId): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { id: id.getValue() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByIds(ids: ProductId[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    const entities = await this.repository.findBy(ids.map((id) => ({ id: id.getValue() })));
    return entities.map((e) => this.toDomain(e));
  }

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find();
    return entities.map((e) => this.toDomain(e));
  }

  async save(product: Product): Promise<void> {
    const entity = this.toEntity(product);
    await this.repository.save(entity);
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
