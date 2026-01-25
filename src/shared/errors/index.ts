// Re-export from new locations for backward compatibility
export { DomainError, InvalidPriceError, InvalidQuantityError } from '../../domain/shared/errors';
export { CustomerNotFoundError, InvalidEmailError } from '../../domain/aggregates/customer/errors';
export { ProductNotFoundError } from '../../domain/aggregates/product/errors';
export { OrderNotFoundError, InvalidOrderStateError, InsufficientStockError, EmptyOrderError } from '../../domain/aggregates/order/errors';
