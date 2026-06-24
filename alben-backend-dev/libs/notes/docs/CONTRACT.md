# Notes Module Contract

## 1. Public Interface
The `NotesModule` exposes the following services and DTOs:

### Standard API Response Format
All API responses must strictly follow this generic structure:
```typescript
interface StandardApiResponse<T> {
  success: boolean; // true for success, false for errors
  message: string;  // Human-readable message
  data: T;          // The payload
}
```

### Services
- **`NotesService`**: Use cases for retrieving notes.
    - `getRemainderNotes(userId: number, dto: GetRemainderNotesDto): Promise<StandardApiResponse<any>>`

### DTOs (Data Transfer Objects)
- **`GetRemainderNotesDto`**:
    - `company_id`: number (Required)
    - `type`: string ('All', 'Note', 'Reminder')
    - `filter_by`: string ('today', 'tomorrow', 'upcoming', 'past')
    - `page`: number (Optional, default 1)
    - `limit`: number (Optional, default 10)
    - `search`: string (Optional)

### Domains / Entities
- **`Note`**:
    - `id`: number
    - `note`: string
    - `remainderDate`: Date
    - `contactId`: number
    - `companyId`: number
    - `createdBy`: number
    - `status`: string
    - `type`: string

## 2. Dependencies
### Internal Modules
- **`UsersModule`**: Required for verifying User-Company association.
- **`CommonModule`**: Required for guards (`JwtAuthGuard`).

### External Libraries
- `class-validator` (for DTO validation)
- `typeorm` (Database ORM)
