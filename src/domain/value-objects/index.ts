// Re-export from new locations for backward compatibility
// Shared value objects
export { Money, Quantity, Address } from '../shared/value-objects';

// Aggregate-specific value objects
export { CustomerId } from '../aggregates/customer/CustomerId';
export { Email } from '../aggregates/customer/Email';
export { ProductId } from '../aggregates/product/ProductId';
export { OrderId } from '../aggregates/order/OrderId';
export { OrderItemId } from '../aggregates/order/OrderItemId';
