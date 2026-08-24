import { Container } from 'inversify';

// Repositories

// Domain Services

// Use Cases - Product

// Use Cases - Customer
import { CreateCustomerUseCase, GetCustomerUseCase, SetCustomerAddressUseCase } from '../../application/use-cases/customer';

// Use Cases - Order
import {
  AddOrderItemUseCase,
  CancelOrderUseCase,
  ConfirmOrderUseCase,
  CreateOrderUseCase,
  GetCustomerOrdersUseCase,
  GetOrderUseCase,
} from '../../application/use-cases/order';
import { CreateProductUseCase, GetAllProductsUseCase, GetProductUseCase } from '../../application/use-cases/product';
import { type ICustomerRepository, type IOrderRepository, type IProductRepository } from '../../domain/repositories';
import { OrderDomainService } from '../../domain/services';

// Controllers
import { CustomerController, OrderController, ProductController } from '../../presentation/controllers';
import { CustomerRepository, OrderRepository, ProductRepository } from '../repositories';
import { TYPES } from './types';

/**
 * InversifyJS DIコンテナ
 */
const container = new Container();

/**
 * 依存性注入コンテナの設定
 */
export function setupContainer(): Container {
  // リポジトリの登録（シングルトン）
  container.bind<IProductRepository>(TYPES.IProductRepository).to(ProductRepository).inSingletonScope();

  container.bind<ICustomerRepository>(TYPES.ICustomerRepository).to(CustomerRepository).inSingletonScope();

  container.bind<IOrderRepository>(TYPES.IOrderRepository).to(OrderRepository).inSingletonScope();

  // ドメインサービスの登録
  container.bind<OrderDomainService>(TYPES.OrderDomainService).to(OrderDomainService).inSingletonScope();

  // Product Use Cases
  container.bind<CreateProductUseCase>(TYPES.CreateProductUseCase).to(CreateProductUseCase);
  container.bind<GetProductUseCase>(TYPES.GetProductUseCase).to(GetProductUseCase);
  container.bind<GetAllProductsUseCase>(TYPES.GetAllProductsUseCase).to(GetAllProductsUseCase);

  // Customer Use Cases
  container.bind<CreateCustomerUseCase>(TYPES.CreateCustomerUseCase).to(CreateCustomerUseCase);
  container.bind<GetCustomerUseCase>(TYPES.GetCustomerUseCase).to(GetCustomerUseCase);
  container.bind<SetCustomerAddressUseCase>(TYPES.SetCustomerAddressUseCase).to(SetCustomerAddressUseCase);

  // Order Use Cases
  container.bind<CreateOrderUseCase>(TYPES.CreateOrderUseCase).to(CreateOrderUseCase);
  container.bind<GetOrderUseCase>(TYPES.GetOrderUseCase).to(GetOrderUseCase);
  container.bind<AddOrderItemUseCase>(TYPES.AddOrderItemUseCase).to(AddOrderItemUseCase);
  container.bind<ConfirmOrderUseCase>(TYPES.ConfirmOrderUseCase).to(ConfirmOrderUseCase);
  container.bind<CancelOrderUseCase>(TYPES.CancelOrderUseCase).to(CancelOrderUseCase);
  container.bind<GetCustomerOrdersUseCase>(TYPES.GetCustomerOrdersUseCase).to(GetCustomerOrdersUseCase);

  // Controllers（tsoaがクラスコンストラクタで解決するため、クラス自体をキーにバインド）
  container.bind<ProductController>(ProductController).toSelf();
  container.bind<CustomerController>(CustomerController).toSelf();
  container.bind<OrderController>(OrderController).toSelf();

  return container;
}

export { container };
