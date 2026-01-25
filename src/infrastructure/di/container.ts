import { Container } from 'inversify';
import { TYPES } from './types';

// Repositories
import { IProductRepository, ICustomerRepository, IOrderRepository } from '../../domain/repositories';
import {
  InMemoryProductRepository,
  InMemoryCustomerRepository,
  InMemoryOrderRepository,
  MySQLProductRepository,
  MySQLCustomerRepository,
  MySQLOrderRepository,
} from '../repositories';

// Domain Services
import { OrderDomainService } from '../../domain/services';

// Use Cases - Product
import {
  CreateProductUseCase,
  GetProductUseCase,
  GetAllProductsUseCase,
} from '../../application/use-cases/product';

// Use Cases - Customer
import {
  CreateCustomerUseCase,
  GetCustomerUseCase,
  SetCustomerAddressUseCase,
} from '../../application/use-cases/customer';

// Use Cases - Order
import {
  CreateOrderUseCase,
  GetOrderUseCase,
  AddOrderItemUseCase,
  ConfirmOrderUseCase,
  CancelOrderUseCase,
  GetCustomerOrdersUseCase,
} from '../../application/use-cases/order';

// Controllers
import { ProductController, CustomerController, OrderController } from '../../presentation/controllers';

/**
 * InversifyJS DIコンテナ
 */
const container = new Container();

/**
 * 依存性注入コンテナの設定
 */
export function setupContainer(): Container {
  const useMySQL = process.env.USE_MYSQL === 'true';

  // リポジトリの登録（シングルトン）
  // 環境変数 USE_MYSQL=true でMySQL実装に切り替え
  if (useMySQL) {
    container
      .bind<IProductRepository>(TYPES.IProductRepository)
      .to(MySQLProductRepository)
      .inSingletonScope();

    container
      .bind<ICustomerRepository>(TYPES.ICustomerRepository)
      .to(MySQLCustomerRepository)
      .inSingletonScope();

    container
      .bind<IOrderRepository>(TYPES.IOrderRepository)
      .to(MySQLOrderRepository)
      .inSingletonScope();
  } else {
    container
      .bind<IProductRepository>(TYPES.IProductRepository)
      .to(InMemoryProductRepository)
      .inSingletonScope();

    container
      .bind<ICustomerRepository>(TYPES.ICustomerRepository)
      .to(InMemoryCustomerRepository)
      .inSingletonScope();

    container
      .bind<IOrderRepository>(TYPES.IOrderRepository)
      .to(InMemoryOrderRepository)
      .inSingletonScope();
  }

  // ドメインサービスの登録
  container
    .bind<OrderDomainService>(TYPES.OrderDomainService)
    .to(OrderDomainService)
    .inSingletonScope();

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

  // Controllers
  container.bind<ProductController>(TYPES.ProductController).to(ProductController);
  container.bind<CustomerController>(TYPES.CustomerController).to(CustomerController);
  container.bind<OrderController>(TYPES.OrderController).to(OrderController);

  return container;
}

export { container };
