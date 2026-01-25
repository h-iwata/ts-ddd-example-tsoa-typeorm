import { Product } from '../aggregates/product';
import { ProductId } from '../value-objects';

export interface IProductRepository {
  findById(id: ProductId): Promise<Product | null>;
  findByIds(ids: ProductId[]): Promise<Product[]>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<void>;
  delete(id: ProductId): Promise<void>;
}
