import { Injectable } from '@nestjs/common';
import type { UserRepositoryPort } from '../domain/ports/user.repository.port';
import { USER_REPOSITORY } from '../domain/ports/user.repository.port';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

/**
 * Auth Service (Legacy)
 *
 * Provides session management functionality using UUID-based sessions.
 *
 * @deprecated This service uses UUID-based session tokens.
 * The application now primarily uses JWT authentication via AuthenticationService.
 * This service is kept for backward compatibility.
 *
 * @see AuthenticationService for current JWT-based authentication
 * @see JwtStrategy for JWT token validation
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate User Session
   *
   * Checks if a user's session ID matches the stored token.
   *
   * @param userId - User's ID to validate
   * @param sid - Session ID to check
   * @returns true if session is valid, false otherwise
   *
   * @deprecated Use JwtStrategy for token validation instead
   *
   * @note
   * This method validates UUID-based sessions stored in api_token.
   * The newer JWT authentication doesn't use this method.
   */
  async validateUserSession(userId: number, sid: string): Promise<boolean> {
    // Fetch user from database
    const user = await this.userRepository.findById(userId);
    if (!user) return false;

    // Compare provided session ID with stored api_token
    return user.apiToken === sid;
  }

  /**
   * Create Session
   *
   * Generates a new UUID session token and stores it for the user.
   *
   * @param userId - User's ID to create session for
   * @returns Generated session ID (UUID)
   *
   * @deprecated Use AuthenticationService.login() for JWT tokens instead
   *
   * @note
   * This method generates UUID sessions stored in api_token.
   * The newer JWT authentication uses AuthenticationService.login().
   */
  async createSession(userId: number): Promise<string> {
    // Generate unique session ID
    const sid = uuidv4();

    // Store session ID in database (api_token column)
    await this.userRepository.updateApiToken(userId, sid);

    return sid;
  }
}
