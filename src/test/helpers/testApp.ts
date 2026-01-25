import 'reflect-metadata';
import express, { type Express } from 'express';
import { CreateCustomerUseCase, GetCustomerUseCase, SetCustomerAddressUseCase } from '../../application/use-cases/customer';
import {
  CreateOrderUseCase,
  GetOrderUseCase,
  AddOrderItemUseCase,
  ConfirmOrderUseCase,
  CancelOrderUseCase,
  GetCustomerOrdersUseCase,
} from '../../application/use-cases/order';
import { CreateProductUseCase, GetProductUseCase, GetAllProductsUseCase } from '../../application/use-cases/product';
import { type ICustomerRepository, type IProductRepository, type IOrderRepository } from '../../domain/repositories';
import { OrderDomainService } from '../../domain/services';
import { RegisterRoutes } from '../../../generated/routes';

// tsoaのiocModuleが参照するグローバルコンテナ
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../infrastructure/di/types';
import { CustomerController, ProductController, OrderController } from '../../presentation/controllers';
import { errorHandler } from '../../presentation/middlewares';

export interface MockRepositories {
  customerRepository?: jest.Mocked<ICustomerRepository>;
  productRepository?: jest.Mocked<IProductRepository>;
  orderRepository?: jest.Mocked<IOrderRepository>;
  orderDomainService?: jest.Mocked<OrderDomainService>;
}

/**
 * テスト用のExpressアプリケーションを作成
 * モックリポジトリを注入可能
 */
export function createTestApp(mocks: MockRepositories = {}): Express {
  // コンテナをリセット
  container.unbindAll();

  // モックまたはデフォルトのリポジトリをバインド
  if (mocks.customerRepository) {
    container.bind<ICustomerRepository>(TYPES.ICustomerRepository).toConstantValue(mocks.customerRepository);
  }
  if (mocks.productRepository) {
    container.bind<IProductRepository>(TYPES.IProductRepository).toConstantValue(mocks.productRepository);
  }
  if (mocks.orderRepository) {
    container.bind<IOrderRepository>(TYPES.IOrderRepository).toConstantValue(mocks.orderRepository);
  }
  if (mocks.orderDomainService) {
    container.bind<OrderDomainService>(TYPES.OrderDomainService).toConstantValue(mocks.orderDomainService);
  } else if (mocks.productRepository) {
    // OrderDomainServiceはProductRepositoryに依存
    container.bind<OrderDomainService>(TYPES.OrderDomainService).to(OrderDomainService);
  }

  // Customer Use Cases
  if (mocks.customerRepository) {
    container.bind<CreateCustomerUseCase>(TYPES.CreateCustomerUseCase).to(CreateCustomerUseCase);
    container.bind<GetCustomerUseCase>(TYPES.GetCustomerUseCase).to(GetCustomerUseCase);
    container.bind<SetCustomerAddressUseCase>(TYPES.SetCustomerAddressUseCase).to(SetCustomerAddressUseCase);
    container.bind<CustomerController>(CustomerController).toSelf();
  }

  // Product Use Cases
  if (mocks.productRepository) {
    container.bind<CreateProductUseCase>(TYPES.CreateProductUseCase).to(CreateProductUseCase);
    container.bind<GetProductUseCase>(TYPES.GetProductUseCase).to(GetProductUseCase);
    container.bind<GetAllProductsUseCase>(TYPES.GetAllProductsUseCase).to(GetAllProductsUseCase);
    container.bind<ProductController>(ProductController).toSelf();
  }

  // Order Use Cases
  if (mocks.orderRepository && mocks.customerRepository) {
    container.bind<CreateOrderUseCase>(TYPES.CreateOrderUseCase).to(CreateOrderUseCase);
    container.bind<GetOrderUseCase>(TYPES.GetOrderUseCase).to(GetOrderUseCase);
    container.bind<AddOrderItemUseCase>(TYPES.AddOrderItemUseCase).to(AddOrderItemUseCase);
    container.bind<ConfirmOrderUseCase>(TYPES.ConfirmOrderUseCase).to(ConfirmOrderUseCase);
    container.bind<CancelOrderUseCase>(TYPES.CancelOrderUseCase).to(CancelOrderUseCase);
    container.bind<GetCustomerOrdersUseCase>(TYPES.GetCustomerOrdersUseCase).to(GetCustomerOrdersUseCase);
    container.bind<OrderController>(OrderController).toSelf();
  }

  const app = express();
  app.use(express.json());

  RegisterRoutes(app);
  app.use(errorHandler);

  return app;
}

/**
 * モックリポジトリを作成するヘルパー
 */
export function createMockCustomerRepository(): jest.Mocked<ICustomerRepository> {
  return {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    existsByEmail: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
}

export function createMockProductRepository(): jest.Mocked<IProductRepository> {
  return {
    findById: jest.fn(),
    findByIds: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
}

export function createMockOrderRepository(): jest.Mocked<IOrderRepository> {
  return {
    findById: jest.fn(),
    findByCustomerId: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
}
