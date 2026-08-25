import { Body, Controller, Get, Path, Post, Response, Route, SuccessResponse, Tags } from '@tsoa/runtime';
import { inject, injectable } from 'inversify';
import { type AddOrderItemDto, type CreateOrderDto, type OrderResponseDto } from '../../application/dtos';
import {
  type AddOrderItemUseCase,
  type CancelOrderUseCase,
  type ConfirmOrderUseCase,
  type CreateOrderUseCase,
  type GetCustomerOrdersUseCase,
  type GetOrderUseCase,
} from '../../application/use-cases/order';
import { TYPES } from '../../infrastructure/di/types';
import { type ErrorResponse } from '../types';

@Route('api/orders')
@Tags('Orders')
@injectable()
export class OrderController extends Controller {
  constructor(
    @inject(TYPES.CreateOrderUseCase)
    private readonly createOrderUseCase: CreateOrderUseCase,
    @inject(TYPES.GetOrderUseCase)
    private readonly getOrderUseCase: GetOrderUseCase,
    @inject(TYPES.AddOrderItemUseCase)
    private readonly addOrderItemUseCase: AddOrderItemUseCase,
    @inject(TYPES.ConfirmOrderUseCase)
    private readonly confirmOrderUseCase: ConfirmOrderUseCase,
    @inject(TYPES.CancelOrderUseCase)
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    @inject(TYPES.GetCustomerOrdersUseCase)
    private readonly getCustomerOrdersUseCase: GetCustomerOrdersUseCase
  ) {
    super();
  }

  /**
   * 注文を取得
   * @param orderId 注文ID
   */
  @Get('{orderId}')
  @Response<ErrorResponse>(404, 'Order not found')
  async getOrder(@Path() orderId: string): Promise<OrderResponseDto> {
    return this.getOrderUseCase.execute(orderId);
  }

  /**
   * 顧客の注文一覧を取得
   * @param customerId 顧客ID
   */
  @Get('customer/{customerId}')
  async getCustomerOrders(@Path() customerId: string): Promise<OrderResponseDto[]> {
    return this.getCustomerOrdersUseCase.execute(customerId);
  }

  /**
   * 注文を作成
   * @param requestBody 注文情報
   */
  @Post('/')
  @SuccessResponse(201, 'Created')
  @Response<ErrorResponse>(400, 'Validation error')
  @Response<ErrorResponse>(404, 'Customer not found')
  async createOrder(@Body() requestBody: CreateOrderDto): Promise<OrderResponseDto> {
    this.setStatus(201);
    return this.createOrderUseCase.execute(requestBody);
  }

  /**
   * 注文に商品を追加
   * @param orderId 注文ID
   * @param requestBody 商品情報
   */
  @Post('{orderId}/items')
  @Response<ErrorResponse>(400, 'Invalid order state')
  @Response<ErrorResponse>(404, 'Order or Product not found')
  async addItem(@Path() orderId: string, @Body() requestBody: AddOrderItemDto): Promise<OrderResponseDto> {
    return this.addOrderItemUseCase.execute(orderId, requestBody);
  }

  /**
   * 注文を確定
   * 在庫の引き当てを行い、注文を確定状態にする
   * @param orderId 注文ID
   */
  @Post('{orderId}/confirm')
  @Response<ErrorResponse>(400, 'Invalid order state / Insufficient stock')
  @Response<ErrorResponse>(404, 'Order not found')
  async confirmOrder(@Path() orderId: string): Promise<OrderResponseDto> {
    return this.confirmOrderUseCase.execute(orderId);
  }

  /**
   * 注文をキャンセル
   * 確定済みの場合は在庫を戻す
   * @param orderId 注文ID
   */
  @Post('{orderId}/cancel')
  @Response<ErrorResponse>(400, 'Invalid order state')
  @Response<ErrorResponse>(404, 'Order not found')
  async cancelOrder(@Path() orderId: string): Promise<OrderResponseDto> {
    return this.cancelOrderUseCase.execute(orderId);
  }
}
