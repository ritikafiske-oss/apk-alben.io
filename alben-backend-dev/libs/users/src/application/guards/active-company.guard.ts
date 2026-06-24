import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../user.service';
import { SKIP_ACTIVE_COMPANY_GUARD_KEY } from '../decorators/skip-active-company.decorator';

/**
 * Active Company Guard
 *
 * This guard ensures that the user is associated with the provided company
 * and that their status is 'active'.
 *
 * It extracts:
 * - userId: from the request.user (set by JwtAuthGuard)
 * - companyId: from request.query, request.body, or request.params
 *
 * @usage
 * ```typescript
 * @UseGuards(JwtAuthGuard, ActiveCompanyGuard)
 * @Get()
 * async getData(@Query('company_id') companyId: number) { ... }
 * ```
 */
@Injectable()
export class ActiveCompanyGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkip = this.reflector.getAllAndOverride<boolean>(
      SKIP_ACTIVE_COMPANY_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isSkip) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: { id: number };
      query?: { company_id?: string | number };
      body?: { company_id?: string | number; data?: string };
      params?: { company_id?: string | number };
    }>();
    const user = request.user;

    if (!user || !user.id) {
      return false;
    }

    // Try to get company_id from query, body, or params
    let companyId: string | number | undefined =
      request.query?.company_id ||
      request.body?.company_id ||
      request.params?.company_id;

    // Special case for multipart/form-data where company_id might be inside a JSON string field named 'data'
    if (
      !companyId &&
      request.body?.data &&
      typeof request.body.data === 'string'
    ) {
      try {
        let parsed = JSON.parse(request.body.data) as unknown;
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed) as unknown;
        }
        companyId = (parsed as { company_id?: string | number })?.company_id;
      } catch {
        // Ignore parsing errors, let the controller handle it if needed
      }
    }

    if (!companyId) {
      throw new BadRequestException({
        success: false,
        code: 'COMPANY_ID_REQUIRED',
        message: 'Company ID is required.',
        data: {},
      });
    }

    // Use the centralized validation logic in UserService
    await this.userService.validateUserCompany(
      Number(user.id),
      Number(companyId),
    );

    return true;
  }
}
