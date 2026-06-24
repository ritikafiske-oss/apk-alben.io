# User Module Contract

## 1. Public Interface
The `UsersModule` exposes the following services and DTOs:

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
- **`UsersService`**: Use cases for retrieving user data.
    - `getProfile(userId: number): Promise<StandardApiResponse<UserProfileDto>>`
    - `updateProfile(userId: number, data: UpdateUserProfileDto): Promise<StandardApiResponse<UserProfileDto>>`
    - `getCompanies(userId: number): Promise<StandardApiResponse<CompanyDto[]>>` (Only returns active associations where the role is NOT all_in_one)
    - `getConfig(userId: number, companyId: number): Promise<StandardApiResponse<UserConfigDto>>`

### DTOs (Data Transfer Objects)
- **`UpdateUserProfileDto`**:
    - `firstname`: string (required, max 25)
    - `lastname`: string (required, max 25)
    - `email`: string (required, email format, unique)
    - `mobile`: string (required, unique)
    - `profile_image`: string | null (optional URL, must have image extension)
    - `isDeleteProfileImg`: number (optional, 0 or 1)

- **`UserProfileDto`**:
    - `id`: number
    - `firstname`: string
    - `lastname`: string | null
    - `mobile`: string | null
    - `email`: string | null
    - `profile_image`: string | null
    - `gender`: string | null
    - `language`: string | null
    - `skill`: string | null
    - `activity_status`: string (from `user_companies` table)

- **`CompanyDto`**:
    - `id`: number
    - `business_name`: string
    - `business_logo`: string | null
    - `helpline_no_1`: string | null
    - `helpline_no_2`: string | null

- **`UserConfigDto`**:
    - `is_paid_contact_handler`: number (0 or 1)
    - `privacy`:
        - `delete_phone_log`: number
        - `save_phone`: number
        - `hide_number`: number
    - `popup_note_mandatory`: number
    - `call_attempts`: string | null
    - `wait_call_seconds`: string | null
    - `allow_phone_logs`: number
    - `role`: string
    - `allow_autodial`: number
    - `allow_visits`: number
    - `allow_web_access`: number
    - `is_manager`: number
    - `is_active_membership`: number
    - `is_show_plan`: number
    - `reminder`:
        - `reminder_duplication`: number
        - `reminder_attempt_limit`: number
        - `reminder_snooze_duration`: number
    - `live_location_tracking`:
        - `is_live_tracking`: number
        - `tracking_interval`: number
        - `min_sync_interval`: number
        - `max_sync_interval`: number
    - `is_show_recording`: number
    - `permissions`:
        - `allow_popup_for_client_contact`: number
        - `allow_popup_for_vendor_contact`: number
        - `allow_popup_for_colleagues_contact`: number
    - `popup_category_names`:
        - `personal`: string
        - `client`: string
        - `vendor`: string
        - `colleague`: string

## 2. Events & Messages
- **Events Emitted**:
    - `UserLoggedIn` (Proposed for Single Device Login tracking)

- **Events Listened**:
    - None currently.

## 3. Dependencies
### Internal Modules
- **`AuthModule`**: Required for `JwtAuthGuard` and `CurrentUser` decorator.
- **`DatabaseModule`**: Required for database connection (TypeORM/Prisma).

### External Libraries
- `class-validator` (for DTO validation)
- `class-transformer` (for DTO serialization)
- `uuid` (for generating unique Session IDs)
- `typeorm` or `prisma` (Database ORM - *Not currently in package.json*)
