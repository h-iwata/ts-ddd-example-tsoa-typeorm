import { type Order, type OrderItem } from '../../../domain/aggregates/order';

// ========== Request DTOs ==========

export interface CreateOrderDto {
  customerId: string;
}

export interface AddOrderItemDto {
  productId: string;
  quantity: number;
}

export interface UpdateOrderItemDto {
  quantity: number;
}

export interface SetShippingAddressDto {
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
  building?: string;
}

// ========== Response DTOs ==========

export interface OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponseDto {
  id: string;
  customerId: string;
  status: string;
  items: OrderItemResponseDto[];
  totalAmount: number;
  currency: string;
  shippingAddress: {
    postalCode: string;
    prefecture: string;
    city: string;
    street: string;
    building?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

function toOrderItemResponseDto(item: OrderItem): OrderItemResponseDto {
  return {
    id: item.getId().getValue(),
    productId: item.getProductId().getValue(),
    productName: item.getProductName(),
    unitPrice: item.getUnitPrice().getAmount(),
    quantity: item.getQuantity().getValue(),
    subtotal: item.getSubtotal().getAmount(),
  };
}

export function toOrderResponseDto(order: Order): OrderResponseDto {
  const address = order.getShippingAddress();
  const totalAmount = order.getTotalAmount();

  return {
    id: order.getId().getValue(),
    customerId: order.getCustomerId().getValue(),
    status: order.getStatus(),
    items: order.getItems().map(toOrderItemResponseDto),
    totalAmount: totalAmount.getAmount(),
    currency: totalAmount.getCurrency(),
    shippingAddress: address
      ? {
          postalCode: address.getPostalCode(),
          prefecture: address.getPrefecture(),
          city: address.getCity(),
          street: address.getStreet(),
          building: address.getBuilding(),
        }
      : null,
    createdAt: order.getCreatedAt().toISOString(),
    updatedAt: order.getUpdatedAt().toISOString(),
  };
}
