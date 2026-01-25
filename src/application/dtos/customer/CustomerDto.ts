import { Customer } from '../../../domain/aggregates/customer';

// ========== Request DTOs ==========

export interface CreateCustomerDto {
  name: string;
  email: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
}

export interface SetAddressDto {
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
  building?: string;
}

// ========== Response DTOs ==========

export interface AddressResponseDto {
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
  building?: string;
  fullAddress: string;
}

export interface CustomerResponseDto {
  id: string;
  name: string;
  email: string;
  shippingAddress: AddressResponseDto | null;
  createdAt: string;
  updatedAt: string;
}

export function toCustomerResponseDto(customer: Customer): CustomerResponseDto {
  const address = customer.getShippingAddress();
  return {
    id: customer.getId().getValue(),
    name: customer.getName(),
    email: customer.getEmail().getValue(),
    shippingAddress: address
      ? {
          postalCode: address.getPostalCode(),
          prefecture: address.getPrefecture(),
          city: address.getCity(),
          street: address.getStreet(),
          building: address.getBuilding(),
          fullAddress: address.getFullAddress(),
        }
      : null,
    createdAt: customer.getCreatedAt().toISOString(),
    updatedAt: customer.getUpdatedAt().toISOString(),
  };
}
