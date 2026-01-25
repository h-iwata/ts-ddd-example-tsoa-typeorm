import {
  Controller,
  Get,
  Post,
  Route,
  Path,
  Body,
  SuccessResponse,
  Response,
  Tags,
} from 'tsoa';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../infrastructure/di/types';
import {
  CreateOrderUseCase,
  GetOrderUseCase,
  AddOrderItemUseCase,
  ConfirmOrderUseCase,
  CancelOrderUseCase,
  GetCustomerOrdersUseCase,
} from '../../application/use-cases/order';
import {
  CreateOrderDto,
  AddOrderItemDto,
  OrderResponseDto,
} from '../../application/dtos';
import { ErrorResponse } from '../../shared/types';

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
  public async getOrder(@Path() orderId: string): Promise<OrderResponseDto> {
    return this.getOrderUseCase.execute(orderId);
  }

  /**
   * 顧客の注文一覧を取得
   * @param customerId 顧客ID
   */
  @Get('customer/{customerId}')
  public async getCustomerOrders(
    @Path() customerId: string
  ): Promise<OrderResponseDto[]> {
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
  public async createOrder(
    @Body() requestBody: CreateOrderDto
  ): Promise<OrderResponseDto> {
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
  public async addItem(
    @Path() orderId: string,
    @Body() requestBody: AddOrderItemDto
  ): Promise<OrderResponseDto> {
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
  public async confirmOrder(
    @Path() orderId: string
  ): Promise<OrderResponseDto> {
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
  public async cancelOrder(
    @Path() orderId: string
  ): Promise<OrderResponseDto> {
    return this.cancelOrderUseCase.execute(orderId);
  }
}
