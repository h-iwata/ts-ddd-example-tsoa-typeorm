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
  CreateProductUseCase,
  GetProductUseCase,
  GetAllProductsUseCase,
} from '../../application/use-cases/product';
import {
  CreateProductDto,
  ProductResponseDto,
} from '../../application/dtos';
import { ErrorResponse } from '../../shared/types';

@Route('api/products')
@Tags('Products')
@injectable()
export class ProductController extends Controller {
  constructor(
    @inject(TYPES.CreateProductUseCase)
    private readonly createProductUseCase: CreateProductUseCase,
    @inject(TYPES.GetProductUseCase)
    private readonly getProductUseCase: GetProductUseCase,
    @inject(TYPES.GetAllProductsUseCase)
    private readonly getAllProductsUseCase: GetAllProductsUseCase
  ) {
    super();
  }

  /**
   * 全商品を取得
   */
  @Get('/')
  public async getAllProducts(): Promise<ProductResponseDto[]> {
    return this.getAllProductsUseCase.execute();
  }

  /**
   * 商品を取得
   * @param productId 商品ID
   */
  @Get('{productId}')
  @Response<ErrorResponse>(404, 'Product not found')
  public async getProduct(
    @Path() productId: string
  ): Promise<ProductResponseDto> {
    return this.getProductUseCase.execute(productId);
  }

  /**
   * 商品を作成
   * @param requestBody 商品情報
   */
  @Post('/')
  @SuccessResponse(201, 'Created')
  @Response<ErrorResponse>(400, 'Validation error')
  public async createProduct(
    @Body() requestBody: CreateProductDto
  ): Promise<ProductResponseDto> {
    this.setStatus(201);
    return this.createProductUseCase.execute(requestBody);
  }
}
