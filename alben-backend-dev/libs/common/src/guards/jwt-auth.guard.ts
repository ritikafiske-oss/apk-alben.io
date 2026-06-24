import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 *
 * This guard protects routes by validating JWT tokens using Passport's 'jwt' strategy.
 * It extends Passport's AuthGuard to leverage the JwtStrategy for token validation.
 *
 * @usage
 * Apply this guard to controllers or route handlers to require authentication:
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * async getProfile(@Request() req) {
 *   // req.user will contain the validated user object from JwtStrategy
 *   return req.user;
 * }
 * ```
 *
 * @security
 * - Validates JWT token signature
 * - Checks token expiration
 * - Enforces single device login by comparing token with database
 * - Returns 401 Unauthorized if validation fails
 *
 * @see JwtStrategy for token validation logic
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Unauthenticated',
        data: {},
      });
    }
    return user;
  }
}
