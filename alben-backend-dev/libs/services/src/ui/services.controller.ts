import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiExtraModels,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  User,
  ApiResponse as ApiResponseDto,
  ExceptionHandler,
} from '@libs/common';
import { ActiveCompanyGuard } from '@libs/users';
import { GetUserServicesService } from '../application/get-user-services.service';
import { ServiceResponseDto } from './dtos/service-response.dto';

@ApiTags('Services')
@ApiBearerAuth()
@ApiExtraModels(ApiResponseDto, ServiceResponseDto)
@UseGuards(JwtAuthGuard, ActiveCompanyGuard)
@Controller('services')
export class ServicesController {
  constructor(
    private readonly getUserServicesService: GetUserServicesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get services for the authenticated user' })
  @ApiQuery({ name: 'company_id', required: true, type: Number })
  @ApiOkResponse({
    description: 'Services fetched successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ServiceResponseDto) },
            },
          },
        },
      ],
    },
  })
  async getServices(
    @User() user: { id: number },
    @Query('company_id') companyId: number,
  ): Promise<ApiResponseDto<ServiceResponseDto[]>> {
    try {
      const services = await this.getUserServicesService.execute(
        user.id,
        companyId,
      );
      const data = services.map(
        (s) => new ServiceResponseDto(Number(s.id), s.name),
      );
      return {
        success: true,
        code: 'DATA_FETCHED',
        message: 'Services fetched successfully.',
        data: data,
      };
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}
