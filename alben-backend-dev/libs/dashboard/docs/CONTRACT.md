# Dashboard Module Contract

## 1. Purpose
The `DashboardModule` is responsible for fetching and calculating various metrics and counts for the dashboard interface. It must synchronize its logic with the `ContactsModule` (specifically the `actions/count` endpoint handled by `GetContactCountsUseCase`), but WITHOUT filtering by `is_my_plan = 0`.

## 2. Public Interface
The `DashboardModule` exposes the following services (UseCases) and DTOs:

### Standard API Response Format
All API responses must strictly follow the generic structure from `@libs/common`.

### UseCases (Services)
- **`GetDashboardMetricsUseCase`**: 
    - `execute(userId: number, companyId: number): Promise<ApiResponse<DashboardMetricsResponseDto>>`
    - Retrieves static metrics for the dashboard (completed reminders, new assigned leads, overdue, etc.).

### DTOs (Data Transfer Objects)
- **`DashboardMetricsResponseDto`**:
    - `completedReminderCount`: number
    - `setReminderCount`: number
    - `completedNewLeadCount`: number
    - `totalNewLeadCount`: number
    - `completedOverdueCount`: number
    - `totalOverdueCount`: number
    - `completedAutoDialLeadCount`: number
    - `totalAutoDialLeadCount`: number
    - `checkedInTime`: string | null // IST Date string (YYYY-MM-DD HH:mm:ss)

## 3. Events & Messages
- **Events Emitted**: None currently.
- **Events Listened**: None currently.

## 4. Dependencies
### Internal Modules
- **`UsersModule`**: For user-company validation.
- **`ContactsModule`**: For `UserProductContactEntity`.
- **`NotesModule`**: For `NoteEntity`.
- **`LocationsModule`**: For `LocationLogEntity`.

## 5. Dynamic Calculation Rules
All metrics should match the logic implemented in the `ContactsModule`'s `GetContactCountsUseCase` (API: `actions/count`), but including both "My Plan" and regular items (specifically, NO `is_my_plan` filter).

### Calculation Logic Mapping:
1.  **`setReminderCount`**: Count unique contacts from `notes` where `userId` and `companyId` match, `is_done = 0`, and `reminder_datetime >= todayStart`.
2.  **`totalNewLeadCount`**: Count unique contacts from `user_product_contacts` where `userId` and `companyId` match, `is_newly_assigned = 1`, and `called_at IS NULL`.
3.  **`totalOverdueCount`**: Count unique contacts from `notes` where `userId` and `companyId` match, `is_done = 0`, and `reminder_datetime < todayStart`.
4.  **`completedReminderCount`**: Count unique contacts from `notes` where `userId` and `companyId` match, `is_done = 1`, and `reminder_datetime >= todayStart`.
5.  **`completedOverdueCount`**: Count unique contacts from `notes` where `userId` and `companyId` match, `is_done = 1`, `reminder_datetime < todayStart`, and `updated_at` is today.
6.  **`completedNewLeadCount`**: Count unique contacts from `user_product_contacts` where `userId` and `companyId` match, `is_newly_assigned = 1`, and `called_at` is today.
7.  **`totalAutoDialLeadCount`**: Count unique contacts from `contacts` where `userId` and `companyId` match, `is_autodial = 1`, and `contact_type = 'client'`.
8.  **`completedAutoDialLeadCount`**: Same calculation as `totalAutoDialLeadCount`, but excluding contacts that have a call log entry for today.
9.  **`checkedInTime`**: Fetch the latest `location_logs` entry, considering both `check_in` and `check_out` log types. If the latest log is `check_in`, returns the IST timestamp; otherwise, returns `null`.

### Filtering Rules:
- All counts must respect `deleted_at IS NULL` for contacts.
- All counts must validate the `userId` and `companyId` association.
- Must join `product_contacts` for notes to ensure `is_service` matches `contact_type` (1 for VENDOR, 0 otherwise).

## 6. Non-Responsibilities
- Does not modify any user or system data.
