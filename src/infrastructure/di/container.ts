import { Container } from 'inversify';

import { CreateCustomerUseCase, GetCustomerUseCase, SetCustomerAddressUseCase } from '../../application/use-cases/customer';

import {
  AddOrderItemUseCase,
  CancelOrderUseCase,
  ConfirmOrderUseCase,
  CreateOrderUseCase,
  GetCustomerOrdersUseCase,
  GetOrderUseCase,
} from '../../application/use-cases/order';
import { CreateProductUseCase, GetAllProductsUseCase, GetProductUseCase } from '../../application/use-cases/product';
import {
  type ICustomerRepository,
  type IOrderRepository,
  type IProductRepository,
  type ITransactionManager,
} from '../../domain/repositories';
import { OrderDomainService } from '../../domain/services';

import { CustomerController, OrderController, ProductController } from '../../presentation/controllers';
import { CustomerRepository, OrderRepository, ProductRepository, TransactionManager } from '../repositories';
import { TYPES } from './types';

const container = new Container();

export function setupContainer(): Container {
  container.bind<IProductRepository>(TYPES.IProductRepository).to(ProductRepository).inSingletonScope();

  container.bind<ICustomerRepository>(TYPES.ICustomerRepository).to(CustomerRepository).inSingletonScope();

  container.bind<IOrderRepository>(TYPES.IOrderRepository).to(OrderRepository).inSingletonScope();

  container.bind<ITransactionManager>(TYPES.ITransactionManager).to(TransactionManager).inSingletonScope();

  container.bind<OrderDomainService>(TYPES.OrderDomainService).to(OrderDomainService).inSingletonScope();

  container.bind<CreateProductUseCase>(TYPES.CreateProductUseCase).to(CreateProductUseCase);
  container.bind<GetProductUseCase>(TYPES.GetProductUseCase).to(GetProductUseCase);
  container.bind<GetAllProductsUseCase>(TYPES.GetAllProductsUseCase).to(GetAllProductsUseCase);

  container.bind<CreateCustomerUseCase>(TYPES.CreateCustomerUseCase).to(CreateCustomerUseCase);
  container.bind<GetCustomerUseCase>(TYPES.GetCustomerUseCase).to(GetCustomerUseCase);
  container.bind<SetCustomerAddressUseCase>(TYPES.SetCustomerAddressUseCase).to(SetCustomerAddressUseCase);

  container.bind<CreateOrderUseCase>(TYPES.CreateOrderUseCase).to(CreateOrderUseCase);
  container.bind<GetOrderUseCase>(TYPES.GetOrderUseCase).to(GetOrderUseCase);
  container.bind<AddOrderItemUseCase>(TYPES.AddOrderItemUseCase).to(AddOrderItemUseCase);
  container.bind<ConfirmOrderUseCase>(TYPES.ConfirmOrderUseCase).to(ConfirmOrderUseCase);
  container.bind<CancelOrderUseCase>(TYPES.CancelOrderUseCase).to(CancelOrderUseCase);
  container.bind<GetCustomerOrdersUseCase>(TYPES.GetCustomerOrdersUseCase).to(GetCustomerOrdersUseCase);

  // tsoaはクラスのコンストラクタで解決するため、Symbolではなくクラス自体をキーにする
  container.bind<ProductController>(ProductController).toSelf();
  container.bind<CustomerController>(CustomerController).toSelf();
  container.bind<OrderController>(OrderController).toSelf();

  return container;
}

export { container };
