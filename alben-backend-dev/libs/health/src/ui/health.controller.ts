import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { ApiResponse, ExceptionHandler } from '@libs/common';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'System Health Check',
    description:
      'Verifies the availability of the application and critical dependencies (Database, Memory) for external monitoring.',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'All critical dependencies are available.',
  })
  @SwaggerApiResponse({
    status: 503,
    description: 'One or more critical dependencies are failing.',
  })
  @HealthCheck()
  async check(): Promise<ApiResponse<HealthCheckResult>> {
    try {
      const result = await this.health.check([
        // Database check (SELECT 1 under the hood, minimal load)
        () => this.db.pingCheck('database', { timeout: 1500 }),
        // Memory check (ensures heap usage is within safe bounds, minimal compute)
        () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      ]);

      return {
        success: true,
        code: 'DATA_FETCHED',
        message: 'Data fetched successfully.',
        data: result,
      };
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}
