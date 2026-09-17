// インターフェースは型でしかなく実行時に消えるため、Symbolを実体の識別子として使う
export const TYPES = {
  IProductRepository: Symbol.for('IProductRepository'),
  ICustomerRepository: Symbol.for('ICustomerRepository'),
  IOrderRepository: Symbol.for('IOrderRepository'),
  ITransactionManager: Symbol.for('ITransactionManager'),

  OrderDomainService: Symbol.for('OrderDomainService'),

  CreateProductUseCase: Symbol.for('CreateProductUseCase'),
  GetProductUseCase: Symbol.for('GetProductUseCase'),
  GetAllProductsUseCase: Symbol.for('GetAllProductsUseCase'),

  CreateCustomerUseCase: Symbol.for('CreateCustomerUseCase'),
  GetCustomerUseCase: Symbol.for('GetCustomerUseCase'),
  SetCustomerAddressUseCase: Symbol.for('SetCustomerAddressUseCase'),

  CreateOrderUseCase: Symbol.for('CreateOrderUseCase'),
  GetOrderUseCase: Symbol.for('GetOrderUseCase'),
  AddOrderItemUseCase: Symbol.for('AddOrderItemUseCase'),
  ConfirmOrderUseCase: Symbol.for('ConfirmOrderUseCase'),
  CancelOrderUseCase: Symbol.for('CancelOrderUseCase'),
  GetCustomerOrdersUseCase: Symbol.for('GetCustomerOrdersUseCase'),

  ProductController: Symbol.for('ProductController'),
  CustomerController: Symbol.for('CustomerController'),
  OrderController: Symbol.for('OrderController'),
};
