/**
 * InversifyJS用の依存関係識別子
 * シンボルを使用することで、インターフェースと実装の紐付けを型安全に行う
 */
export const TYPES = {
  // Repositories
  IProductRepository: Symbol.for('IProductRepository'),
  ICustomerRepository: Symbol.for('ICustomerRepository'),
  IOrderRepository: Symbol.for('IOrderRepository'),

  // Domain Services
  OrderDomainService: Symbol.for('OrderDomainService'),

  // Product Use Cases
  CreateProductUseCase: Symbol.for('CreateProductUseCase'),
  GetProductUseCase: Symbol.for('GetProductUseCase'),
  GetAllProductsUseCase: Symbol.for('GetAllProductsUseCase'),

  // Customer Use Cases
  CreateCustomerUseCase: Symbol.for('CreateCustomerUseCase'),
  GetCustomerUseCase: Symbol.for('GetCustomerUseCase'),
  SetCustomerAddressUseCase: Symbol.for('SetCustomerAddressUseCase'),

  // Order Use Cases
  CreateOrderUseCase: Symbol.for('CreateOrderUseCase'),
  GetOrderUseCase: Symbol.for('GetOrderUseCase'),
  AddOrderItemUseCase: Symbol.for('AddOrderItemUseCase'),
  ConfirmOrderUseCase: Symbol.for('ConfirmOrderUseCase'),
  CancelOrderUseCase: Symbol.for('CancelOrderUseCase'),
  GetCustomerOrdersUseCase: Symbol.for('GetCustomerOrdersUseCase'),

  // Controllers
  ProductController: Symbol.for('ProductController'),
  CustomerController: Symbol.for('CustomerController'),
  OrderController: Symbol.for('OrderController'),
};
