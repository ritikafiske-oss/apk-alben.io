import {
  Controller,
  Get,
  Put,
  Query,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, User, ExceptionHandler } from '@libs/common';
import { ActiveCompanyGuard } from '@libs/users';
import { ProductService } from '../application/product.service';
import { GetProductsDto } from './dtos/get-products.dto';
import { GetContactStatusByProductDto } from './dtos/get-contact-status-by-product.dto';
import { UpdateProductContactStatusDto } from './dtos/update-product-contact-status.dto';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveCompanyGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get user products' })
  async getProducts(
    @User() user: { id: number },
    @Query() query: GetProductsDto,
  ) {
    try {
      return await this.productService.getUserProducts(
        user.id,
        query.company_id,
      );
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Get('contact-status')
  @ApiOperation({ summary: 'Get contact status by product' })
  async getContactStatusByProduct(
    @User() user: { id: number },
    @Query() query: GetContactStatusByProductDto,
  ) {
    try {
      return await this.productService.getContactStatusByProduct(
        user.id,
        query.company_id,
        query.product_id,
        query.mobile,
      );
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Put('contact-status/:statusId')
  @ApiOperation({ summary: 'Update product contact status' })
  async updateContactStatus(
    @User() user: { id: number },
    @Param('statusId', ParseIntPipe) statusId: number,
    @Body() body: UpdateProductContactStatusDto,
  ) {
    try {
      return await this.productService.updateProductContactStatus(
        user.id,
        body.company_id,
        body.product_contact_id,
        statusId,
      );
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}
