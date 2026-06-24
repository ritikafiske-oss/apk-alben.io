# Features Classification - Localization Module

## CORE (Frozen)
> These features are critical for the app's localization strategy.

1. **Get Language Dictionary** (`GET /mobile/languages/:lang`)
    - Fetches the full key-value dictionary of all language strings for a specific language.
    - **Logic:** Validates the language is active, then returns all keys/values matching that language from the DB.
    - **Output format:** Flat JSON object `{ "KEY_NAME": "Translated text", ... }`
    - Returns `400 ERR_LANGUAGE_NOT_FOUND` if the language code is not found or inactive.

2. **Standardized API Error Codes**
    - All standard API routes return deterministic error codes (e.g., `ERR_VALIDATION_FAILED`) instead of translated messages.
    - The `AllExceptionsFilter` automatically attaches a `code` field to every error response.
    - The `ValidationPipe` uses a custom `exceptionFactory` to return `ERR_VALIDATION_FAILED` with field-level details.

3. **Standardized API Success Codes**
    - The global `SuccessResponseInterceptor` wraps every successful response in `{ success: true, code: 'SUCCESS' | 'CREATED' | 'UPDATED' | 'DELETED', data: ... }`.

## FLEX (Changeable)
> These features are expected to evolve.

1. **Language Management**
    - Languages can be seeded or managed via direct DB operations.
    - Status flag (`status: 'active' | 'inactive'`) controls which languages are served.

2. **Language Key/Value Management**
    - Keys (`ERR_USER_NOT_FOUND`, `login_btn`) and their per-language values are managed in the DB.
    - As the app grows, new keys can be added without changing the API contract.
