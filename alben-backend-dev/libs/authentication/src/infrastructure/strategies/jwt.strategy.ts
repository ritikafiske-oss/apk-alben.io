import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { USER_REPOSITORY } from '@libs/users';
import type { UserRepositoryPort } from '@libs/users';

/**
 * JWT Payload Interface
 *
 * Defines the structure of the data encoded in the JWT token.
 * This payload is signed and verified to ensure authenticity.
 */
export interface JwtPayload {
  sub: number; // Subject: User ID (primary key)
  mobile: string; // User's mobile number for identification
}

/**
 * JWT Passport Strategy
 *
 * This strategy is responsible for validating JWT tokens on protected routes.
 * It implements Passport's Strategy pattern and is automatically invoked by
 * the JwtAuthGuard when protecting endpoints.
 *
 * @security Single Device Login Enforcement
 * Unlike standard JWT implementations, this strategy validates the token against
 * the database to enforce single device login. When a user logs in from a new device,
 * their old token is invalidated, preventing concurrent sessions.
 *
 * @flow Token Validation Flow
 * 1. Extract token from Authorization header
 * 2. Verify JWT signature and expiration (automatic by Passport)
 * 3. Decode payload to get user ID
 * 4. Fetch user from database
 * 5. Compare request token with stored api_token in database
 * 6. Return user object or throw UnauthorizedException
 *
 * @configuration
 * - Secret: JWT_SECRET environment variable or 'SECRET_KEY' fallback
 * - Token Location: Authorization header with Bearer scheme
 * - Expiration: Configured in JwtModule registration (24 hours)
 *
 * @see JwtAuthGuard - Guard that triggers this strategy
 * @see AuthenticationService.login - Where tokens are generated and stored
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Initialize the JWT Strategy
   *
   * @param userRepository - Repository for user database operations
   * @param configService - Service to access environment variables
   */
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly configService: ConfigService,
  ) {
    // Configure Passport JWT strategy options
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract from "Authorization: Bearer <token>"
      ignoreExpiration: false, // Reject expired tokens
      secretOrKey: configService.get<string>('JWT_SECRET') || 'SECRET_KEY', // Secret key for signature verification
      passReqToCallback: true, // Pass full request to validate() method
    });
  }

  /**
   * Validate JWT Token
   *
   * This method is automatically called by Passport after JWT signature verification.
   * It performs additional validation including database token comparison for
   * single device login enforcement.
   *
   * @param req - Express request object containing headers
   * @param payload - Decoded JWT payload containing user ID and mobile
   * @returns User object to be attached to request.user
   * @throws UnauthorizedException if token is invalid, user not found, or token mismatch
   *
   * @security
   * - Validates token exists in Authorization header
   * - Ensures user exists in database
   * - Enforces single device login by comparing tokens
   */
  async validate(req: Request, payload: JwtPayload) {
    // Step 1: Extract the raw token from the Authorization header
    // We need the full token string to compare with database
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    // Step 2: Ensure token was provided
    if (!token) {
      throw new UnauthorizedException({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'No token provided',
        data: {},
      });
    }

    // Step 3: Fetch user from database using ID from JWT payload
    const user = await this.userRepository.findById(payload.sub);

    // Step 4: Verify user exists
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'User not found',
        data: {},
      });
    }

    // Step 5: CRITICAL - Enforce single device login
    // Compare the token from the request with the token stored in the database.
    // If they don't match, it means the user logged in from another device,
    // and this token should be invalidated.
    if (user.apiToken !== token) {
      throw new UnauthorizedException({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Token mismatch - logged in on another device',
        data: {},
      });
    }

    // Step 6: Return minimal user object to attach to request
    // This object will be available as req.user in route handlers
    return { id: user.id, mobile: user.mobile };
  }
}
