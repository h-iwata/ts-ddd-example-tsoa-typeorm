import { type Product } from '../../../domain/aggregates/product';

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  currency?: string;
  initialStock: number;
}

export interface ProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export function toProductResponseDto(product: Product): ProductResponseDto {
  return {
    id: product.getId().getValue(),
    name: product.getName(),
    description: product.getDescription(),
    price: product.getPrice().getAmount(),
    currency: product.getPrice().getCurrency(),
    stock: product.getStock().getValue(),
    createdAt: product.getCreatedAt().toISOString(),
    updatedAt: product.getUpdatedAt().toISOString(),
  };
}
