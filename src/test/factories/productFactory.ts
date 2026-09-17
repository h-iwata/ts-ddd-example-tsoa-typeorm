import { Factory } from 'fishery';
import { Product } from '../../domain/aggregates/product';
import { ProductId } from '../../domain/aggregates/product/ProductId';
import { Money, Quantity } from '../../domain/shared/value-objects';

interface ProductTransientParams {
  stock?: number;
  price?: number;
}

export const productFactory = Factory.define<Product, ProductTransientParams>(({ sequence, transientParams }) => {
  const stock = transientParams.stock ?? 10;
  const price = transientParams.price ?? 1000;

  return Product.reconstruct({
    id: ProductId.fromString(`product-${sequence}`),
    name: `テスト商品${sequence}`,
    description: `商品${sequence}の説明`,
    price: Money.create(price),
    stock: Quantity.create(stock),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

// 統合テスト用。reconstructではなくProduct.create()を通すのでIDは自動採番される
export const newProductFactory = Factory.define<Product, ProductTransientParams>(({ sequence, transientParams }) => {
  const stock = transientParams.stock ?? 10;
  const price = transientParams.price ?? 1000;

  return Product.create(`テスト商品${sequence}`, `商品${sequence}の説明`, Money.create(price), Quantity.create(stock));
});
