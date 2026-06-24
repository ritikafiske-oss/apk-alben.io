# ContactStatus Module Contract

## 1. Public Interface
The `ContactStatusModule` exposes the following services and DTOs:

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
- **`ContactStatusService`**: Use cases for retrieving contact status data.
    - `getContactStatuses(userId: number, companyId: number): Promise<StandardApiResponse<ContactStatus[]>>`

### DTOs (Data Transfer Objects)
- **`GetContactStatusesDto`**:
    - `company_id`: number (Required)

### Domains / Entities
- **`ContactStatus`**:
    - `id`: number
    - `name`: string
    - `colorCode`: string
    - `status`: string ('active' | 'inactive')
    - `companyId`: number
    - `isHide`: boolean
    - `isUnassigned`: boolean
    - `isDefault`: boolean

## 2. Dependencies
### Internal Modules
- **`UsersModule`**: Required for verifying User-Company association (`UserRepositoryPort`).
- **`CommonModule`**: Required for guards (`JwtAuthGuard`).

### External Libraries
- `class-validator` (for DTO validation)
- `typeorm` (Database ORM)
