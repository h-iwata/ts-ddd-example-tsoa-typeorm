import { type Customer } from '../../../domain/aggregates/customer';
import { type Address } from '../../../domain/shared';

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

function toAddressResponseDto(address: Address): AddressResponseDto {
  return {
    postalCode: address.getPostalCode(),
    prefecture: address.getPrefecture(),
    city: address.getCity(),
    street: address.getStreet(),
    building: address.getBuilding(),
    fullAddress: address.getFullAddress(),
  };
}

export function toCustomerResponseDto(customer: Customer): CustomerResponseDto {
  const addr = customer.getShippingAddress();
  return {
    id: customer.getId().getValue(),
    name: customer.getName(),
    email: customer.getEmail().getValue(),
    shippingAddress: addr ? toAddressResponseDto(addr) : null,
    createdAt: customer.getCreatedAt().toISOString(),
    updatedAt: customer.getUpdatedAt().toISOString(),
  };
}
