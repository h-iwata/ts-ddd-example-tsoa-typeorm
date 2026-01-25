import { Factory } from 'fishery';
import { Product } from '../../domain/aggregates/product';
import { ProductId } from '../../domain/aggregates/product/ProductId';
import { Money, Quantity } from '../../domain/shared/value-objects';

type ProductTransientParams = {
  stock?: number;
  price?: number;
};

export const productFactory = Factory.define<Product, ProductTransientParams>(
  ({ sequence, transientParams }) => {
    const stock = transientParams.stock ?? 10;
    const price = transientParams.price ?? 1000;

    return Product.reconstruct(
      ProductId.fromString(`product-${sequence}`),
      `テスト商品${sequence}`,
      `商品${sequence}の説明`,
      Money.create(price),
      Quantity.create(stock),
      new Date(),
      new Date()
    );
  }
);
