import { type Product } from '../aggregates/product';
import { type ProductId } from '../value-objects';

export interface IProductRepository {
  findById(id: ProductId): Promise<Product | null>;
  findByIds(ids: ProductId[]): Promise<Product[]>;
  findByIdsForUpdate(ids: ProductId[]): Promise<Product[]>;
  findAll(): Promise<Product[]>;
  add(product: Product): Promise<void>;
  save(product: Product): Promise<void>;
  delete(id: ProductId): Promise<void>;
}
