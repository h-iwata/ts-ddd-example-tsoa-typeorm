// Re-export from new locations for backward compatibility
// Shared value objects

// Aggregate-specific value objects
export { CustomerId } from '../aggregates/customer/CustomerId';
export { Email } from '../aggregates/customer/Email';
export { OrderId } from '../aggregates/order/OrderId';
export { OrderItemId } from '../aggregates/order/OrderItemId';
export { ProductId } from '../aggregates/product/ProductId';
export { Address, Money, Quantity } from '../shared/value-objects';
