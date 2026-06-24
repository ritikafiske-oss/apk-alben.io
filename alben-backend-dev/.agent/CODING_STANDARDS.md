# Coding Standards - Code Documentation

## Mandatory Code Comments Rule

**All code files MUST include comprehensive documentation comments.**

This rule applies to:
- Classes and interfaces
- Public and protected methods
- Complex private methods
- Service classes
- Repository methods
- Guards and middleware
- DTOs and entities (when logic is present)

## Code Formatting & Prettier

We enforce a consistent code style using Prettier. All code must pass the `pnpm run format:check` command.

### formatting Rules & Reasoning

- **`singleQuote: true`**: We use single quotes for strings in JavaScript/TypeScript. This is standard practice in the JS ecosystem as it avoids the need to escape double quotes (commonly used in HTML strings).
- **`trailingComma: 'all'`**: We enforce trailing commas in objects and arrays. This results in cleaner git diffs when adding new items to the end of a list or object, as only the new line is modified rather than the previous line also being changed to add a comma.
- **`printWidth: 80`**: Lines should not exceed 80 characters. This ensures code is readable on split screens and standard terminal widths without horizontal scrolling.
- **`tabWidth: 2`**: Indentation is 2 spaces. This is the standard for modern JavaScript/TypeScript projects and provides a good balance between readability and nesting depth.
- **`semi: true`**: We require semicolons at the end of statements. This avoids potential issues with Automatic Semicolon Insertion (ASI) and makes statement termination explicit.
- **`bracketSpacing: true`**: We add spaces inside object literals (e.g., `{ foo: bar }`). This improves readability by visually separating the braces from the content.
- **`arrowParens: 'always'`**: Arrow functions always include parentheses around arguments (e.g., `(x) => x`). This provides consistency and makes it easier to add types or additional arguments later without syntax changes.
- **`endOfLine: 'lf'`**: We use Line Feed (`\n`) for line endings, regardless of the operating system. This ensures consistency across different development environments (Windows, macOS, Linux).

## JSDoc Standards

### 1. Class/Service Documentation

Every class must have a JSDoc comment explaining:
- **Purpose**: What the class does
- **Responsibilities**: Main responsibilities
- **Security considerations**: If applicable
- **Related classes**: Using `@see` tags

**Example**:
```typescript
/**
 * Authentication Service
 * 
 * Handles user authentication operations including login, token generation,
 * and session management. Implements Laravel-compatible login logic with
 * single device enforcement.
 * 
 * @security Features
 * - Password validation using bcrypt
 * - JWT token generation and storage
 * - Single device login enforcement
 * 
 * @see JwtStrategy for token validation logic
 * @see UserService for credential validation
 */
@Injectable()
export class AuthenticationService {
  // ...
}
```

### 2. Method Documentation

Every method must have a JSDoc comment including:
- **Description**: What the method does
- **@param**: For each parameter with description
- **@returns**: Return value description
- **@throws**: Any exceptions thrown
- **@security**: Security implications (if applicable)
- **@note**: Important implementation notes
- **@example**: Usage example for complex methods

**Example**:
```typescript
/**
 * User Login
 * 
 * Authenticates a user and generates a JWT token. This implementation
 * matches Laravel's login behavior for API compatibility.
 * 
 * @param request - Login credentials (mobile and password)
 * @returns Login response with user data and JWT token
 * @throws UnauthorizedException if credentials are invalid or account is disabled
 * 
 * @security Single Device Login
 * Storing the token in the database ensures that when a user logs in from
 * a new device, their previous session is automatically invalidated.
 * 
 * @example
 * ```typescript
 * const result = await authService.login({
 *   mobile: '9764233336',
 *   password: 'SecurePassword123'
 * });
 * ```
 */
async login(request: LoginRequestDto): Promise<LoginResponseDto> {
  // Implementation
}
```

### 3. Inline Comments

Use inline comments for:
- **Complex logic**: Explain WHY, not WHAT
- **Step-by-step processes**: Number steps for clarity
- **Security-critical code**: Mark with "CRITICAL" or "SECURITY"
- **Workarounds**: Explain temporary solutions
- **Performance optimizations**: Explain trade-offs

**Example**:
```typescript
// Step 1: Validate user credentials (mobile and password)
// UserService.validateUser() checks bcrypt password hash
const user = await this.userService.validateUser(request.mobile, request.password);

// CRITICAL: Enforce single device login
// Compare the token from the request with the token stored in the database.
// If they don't match, it means the user logged in from another device,
// and this token should be invalidated.
if (user.apiToken !== token) {
  throw new UnauthorizedException('Token mismatch - logged in on another device');
}
```

## Comment Quality Standards

### ✅ Good Comments

- Explain business logic and intent
- Provide context for decisions
- Document security implications
- Explain complex algorithms
- Note important dependencies

### ❌ Bad Comments

- State the obvious: `// Set name to user.name`
- Commented-out code (remove instead)
- Outdated comments (update when code changes)
- Vague descriptions: `// Do stuff here`

## Security Documentation Requirements

For authentication, authorization, and security-related code:

1. **Document the security model**
   - How it protects the system
   - What attacks it prevents
   
2. **Explain validation logic**
   - What is being validated
   - Why it's important
   
3. **Mark critical sections**
   - Use `@security` tags
   - Add inline "CRITICAL" comments

**Example**:
```typescript
/**
 * JWT Passport Strategy
 * 
 * @security Single Device Login Enforcement
 * Unlike standard JWT implementations, this strategy validates the token against
 * the database to enforce single device login. When a user logs in from a new device,
 * their old token is invalidated, preventing concurrent sessions.
 */
```

## Flow Documentation

For complex processes, document the flow:

```typescript
/**
 * @flow Login Process
 * 1. Validate mobile number and password against database
 * 2. Check if user has an active company association
 * 3. Generate JWT token with user ID and mobile
 * 4. Store token in database (overwrites previous token)
 * 5. Update last login date for audit tracking
 * 6. Fetch activity status from user_company table
 * 7. Return user data with token
 */
```

## Enforcement

- **Code Review**: All PRs must have proper documentation
- **No undocumented public methods**: Will be rejected in review
- **Update on changes**: Comments must be updated when code changes
- **Examples required**: For complex or frequently used methods

---

**Last Updated**: February 12, 2026  
**Version**: 1.0  
**Status**: Mandatory for all new code
