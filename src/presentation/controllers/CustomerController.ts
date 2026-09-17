import { Body, Controller, Get, Path, Post, Put, Response, Route, SuccessResponse, Tags } from '@tsoa/runtime';
import { inject, injectable } from 'inversify';
import { type CreateCustomerDto, type CustomerResponseDto, type SetAddressDto } from '../../application/dtos';
import { type CreateCustomerUseCase, type GetCustomerUseCase, type SetCustomerAddressUseCase } from '../../application/use-cases/customer';
import { TYPES } from '../../infrastructure/di/types';
import { type ErrorResponse } from '../types';

@Response<ErrorResponse>(400, 'Validation error (詳細は code を参照)')
@Response<ErrorResponse>(500, 'Internal server error')
@Route('api/customers')
@Tags('Customers')
@injectable()
export class CustomerController extends Controller {
  constructor(
    @inject(TYPES.CreateCustomerUseCase)
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    @inject(TYPES.GetCustomerUseCase)
    private readonly getCustomerUseCase: GetCustomerUseCase,
    @inject(TYPES.SetCustomerAddressUseCase)
    private readonly setCustomerAddressUseCase: SetCustomerAddressUseCase
  ) {
    super();
  }

  /**
   * 顧客を取得
   * @param customerId 顧客ID
   */
  @Get('{customerId}')
  @Response<ErrorResponse>(404, 'Customer not found')
  async getCustomer(@Path() customerId: string): Promise<CustomerResponseDto> {
    return this.getCustomerUseCase.execute(customerId);
  }

  /**
   * 顧客を作成
   * @param requestBody 顧客情報
   */
  @Post('/')
  @SuccessResponse(201, 'Created')
  @Response<ErrorResponse>(409, 'Email already exists')
  async createCustomer(@Body() requestBody: CreateCustomerDto): Promise<CustomerResponseDto> {
    this.setStatus(201);
    return this.createCustomerUseCase.execute(requestBody);
  }

  /**
   * 顧客の配送先を設定
   * @param customerId 顧客ID
   * @param requestBody 住所情報
   */
  @Put('{customerId}/address')
  @Response<ErrorResponse>(404, 'Customer not found')
  async setAddress(@Path() customerId: string, @Body() requestBody: SetAddressDto): Promise<CustomerResponseDto> {
    return this.setCustomerAddressUseCase.execute(customerId, requestBody);
  }
}
