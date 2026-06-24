# Localization Module Contract

## 1. Public Interface
The `LocalizationModule` exposes the following services and repository ports:

### Standard API Response Format
All API responses strictly follow the generic structure from `@libs/common`.
Error and success codes (not text messages) are returned to the client on standard API routes.

### Services
- **`LocalizationService`**:
    - `getLanguages(langCode: string): Promise<Record<string, string>>`
    - Fetches the complete flat key-value language dictionary for the requested language.
    - Throws `ERR_LANGUAGE_NOT_FOUND` (400) if the language is not found or inactive.

### Repository Ports
- **`LOCALIZATION_REPOSITORY`** (`LocalizationRepositoryPort`):
    - `findActiveLanguage(code: string): Promise<Language | null>`
    - `getLanguageDictionary(languageId: number): Promise<Record<string, string>>`

## 2. Events & Messages
- **Events Emitted**:
    - None currently.

- **Events Listened**:
    - None currently.

## 3. Dependencies
### Internal Modules
- None.

### External Libraries
- `typeorm`: For database interactions.
- `@nestjs/swagger`: For API documentation decorators on the controller.
