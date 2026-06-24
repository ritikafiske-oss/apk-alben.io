# Contacts Module Contract

## 1. Public Interface
The `ContactsModule` exposes the following services (UseCases) and DTOs:

### Standard API Response Format
All API responses must strictly follow the generic structure from `@libs/common`.

### UseCases (Services)
- **`GetContactStatusesUseCase`**: 
    - `execute(userId: number, companyId: number): Promise<ContactStatus[]>`
    - Retrieves available contact statuses for a specific company, validated against the user.

- **`CreateContactUseCase`**:
    - `execute(userId: number, dto: CreateContactRequestDto): Promise<any>`
    - Validates single or bulk contact creation based on `company_id`.
    - `email` is optional; `firstname` and `mobile` (10 digits) are mandatory.
    - Pre-fetches statuses and implements duplicate number checking (mobile, alternate).
    - Checks assignments using `isAssignContactLimitReached`.
    - Registers contacts to dials (`is_manualdial`, `is_autodial`) conditionally by user role.
    - **Vendor Specific Logic**:
        - If `contact_type` is `vendor`, validates `product_id` against the `services` table instead of `products`.
        - Sets `is_service = 1` in `product_contacts` and `user_product_contacts` for vendor types.
        - For vendor contacts, maps departments associated with the input service (from `department_services`) to the user in `user_products`.


- **`UpdateContactUseCase`**:
    - `execute(userId: number, dto: UpdateContactRequestDto): Promise<any>`
    - Updates contact details ensuring the target contact belongs to the user's active company.
    - Resolves status changes and applies duplicate checking for alternate numbers.
    - Conditionally deletes `UserProductContact` if new status `is_unassigned` is true (excluding colleague types).

- **`SaveBulkCallLogUseCase`**:
    - `execute(userId: number, dto: SaveBulkCallLogRequestDto): Promise<any>`
    - Validates company and contact IDs before iterating.
    - Resolves status matching and product matching for each call log.
    - Conditionally creates contacts if they do not exist.
    - Inserts Notes with valid reminder date (checked against current time UTC).
    - Logs `CallLog` entry with duration, type, start time.
    - Decides Dial Type updates (`is_autodial`, `is_manualdial`, `attempts`) based on `userCompany.role` and `callStatus` mapped to `UserProductContact`.
    - **Client-Basis Autodial Tracking [DECISION]**:
        - For contacts of type **client**, autodial attempts are now tracked in a separate `client_autodial_attempts` table on a per-client, per-user basis.
        - `user_product_contacts` continues to manage product-wise assignments for all types.

- **`SaveCallLogDetailsUseCase`**:
    - `execute(userId: number, dto: SaveCallLogDetailsRequestDto): Promise<any>`
    - Saves product specific details for a specific call log.
    - Conditionally updates assignments and contact statuses similar to bulk save.
    - **Note Reminder Datetime [DECISION]**: `note_reminder_datetime` can be empty (`''`). Validation for the datetime format (Y-m-d H:i:s) only applies if `note_reminder_datetime != ''`.


- **`GetContactCountsUseCase`**: 
    - `execute(userId: number, companyId: number): Promise<ApiResponse<ContactCountsResponseDto>>`
    - Retrieves counts for `my_plan`, `new`, `reminder`, and `overdue` filtered by user and company.
    - `my_plan`: Count of `user_product_contacts` (where `is_my_plan` is 1) + count of `notes` (where `is_my_plan` is 1 and `is_done` is false) for `userId` in `companyId`.
    - `new`: Count of `user_product_contacts` for `userId` in `companyId` where `is_newly_assigned` is true AND `is_my_plan` is 0.
    - `reminder`: Count of `notes` for `userId` in `companyId` where `is_done` is false AND `is_my_plan` is 0 AND date of `reminder_datetime >= today`.
    - `overdue`: Count of `notes` for `userId` in `companyId` where `is_done` is false AND `is_my_plan` is 0 AND date of `reminder_datetime < today`.

- **`MarkMyPlanUseCase`**:
    - `execute(userId: number, dto: MarkMyPlanRequestDto, companyId: number): Promise<ApiResponse<null>>`
    - Updates `is_my_plan = 1` for the given IDs and types (`notes` or `call`).
    - If type is `notes`, updates the `notes` table.
    - If type is `call`, updates the `user_product_contacts` table.

- **`UnmarkMyPlanUseCase`**:
    - `execute(userId: number, dto: UnmarkMyPlanRequestDto, companyId: number): Promise<ApiResponse<null>>`
    - Updates `is_my_plan = 0` for the given IDs and types (`notes` or `call`).
    - If type is `notes`, updates the `notes` table.
    - If type is `call`, updates the `user_product_contacts` table.

- **`GetActionDetailsUseCase`**:
    - `execute(userId: number, dto: GetActionDetailsQueryDto): Promise<ApiResponse<GetContactsResponseDto>>`
    - Retrieves contact details for a specific action type (`my_plan`, `new`, `reminder`, `overdue`).
    - `my_plan`: Fetches all `notes` and `user_product_contacts` where `is_my_plan = 1`. For `notes`, `is_done` must be `false`.
    - `new`, `reminder`, `overdue`: Fetches data with `is_my_plan = 0`.
    - Returns records with an additional `type` field:
        - `type = "call"` for data from `user_product_contacts`.
        - `type = for_note` value for data from `notes`, EXCEPT if `for_note = "others"`, then `type = "call"`.
    - Uses the same filtration as `GetContactCountsUseCase` for other types.
    - Returns records in paginated format.

- **`GetActionRecentsUseCase`**:
    - `execute(userId: number, dto: GetActionRecentsQueryDto): Promise<ApiResponse<GetContactsResponseDto>>`
    - Retrieves all recent actions (calls, reminders, visits) performed by the user.
    - Uses a UNION of calls and completed notes.
    - Returns records in paginated format without contact deduplication.

- **`GetContacts`**:
    - `execute(userId: number, dto: GetContactsDto): Promise<ApiResponse<GetContactsResponseDto>>`
    - Retrieves a paginated list of contacts with filtering.
    - `company_id` is mandatory.
    - `type` is optional. 
        - If `type` is provided (client, vendor, colleague), filters by that type.
        - If `type` is omitted, returns a combined list of all contacts the user has access to (assigned clients, vendors in assigned departments, and all colleagues) of the company.
    - `dial` is optional; defaults to `manualdial`.
        - Applied to **all** types when `type` is omitted.
        - `autodial` will only return contacts that have the `is_autodial` flag set (typically only clients). [DECISION] Ordered by maximum `user_product_contacts.id` in ascending order.
        - `manualdial` will return contacts that have the `is_manualdial` flag set (clients) plus all vendors and colleagues (as they are considered manual contacts).
    - Supports filtering by `product_id`, `status_id`, `search` query, and date range.
    - **Company Scoping [DECISION]**: Strictly returns ONLY contacts and their associated products/services/statuses that belong to the active `company_id`.
    - **Autodial Ordering [DECISION]**: When `dial=autodial`, contacts are ordered by the maximum `user_product_contacts.id` in ascending order. This ensures contacts with recent product updates or new assignments are moved to the end of the list.
    - **Product Latest Note**: Each product object includes the `latest_note` from the `notes` table for that specific product.
    - This prevents data overlap if a contact is registered in multiple companies.


### DTOs (Data Transfer Objects)
- None explicitly exposed for this use case (uses Domain Entities for read operations or primitives).

## 2. Events & Messages
- **Events Emitted**:
    - None currently.

- **Events Listened**:
    - None currently.

## 3. Dependencies
### Internal Modules
- **`UsersModule`**: Uses `UserRepository` (via port/alias) to validate users.

### External Libraries
- `typeorm`: For database interactions.
