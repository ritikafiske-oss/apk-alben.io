# Compliance Audit Log - libs/contacts

## 1. Dependency Rule Check
- [x] **Domain Layer**: Does NOT depend on Application, Infrastructure, or UI.
    - Verified `src/domain/entities/contact.entity.ts`: Pure TS class.
    - Verified `src/domain/ports/contact.repository.port.ts`: Interface only.
- [x] **Application Layer**: Depends ONLY on Domain and Shared Kernels.
    - Verified `src/application/*.usecase.ts`: Imports `Contact`, `ContactRepositoryPort`.
    - Verified Cross-module imports use aliases (`@libs/users`).
- [x] **Infrastructure Layer**: Depends on Domain and External Libs (TypeORM).
    - Verified `src/infrastructure/persistence/repositories/contact.repository.ts`: Imports TypeORM and Domain Entities/Ports.
- [x] **UI Layer**: Depends on Application.
    - Verified `src/ui/contacts.controller.ts`: Imports UseCases.

## 2. Interface & Visibility Check
- [x] **Barrel File (`index.ts`)**: Exports public modules and entities.
    - `contacts.module.ts`.
    - `ContactEntity`, `ContactStatusEntity` (exported for cross-module relations).
    - `ContactRepositoryPort` (exported for injection tokens).

## 3. Standard Workflow Check
- [x] **Phase 1 (Design)**: Aligned with `UsersModule` architecture.
- [x] **Phase 2 (Implementation)**: Refactored from CQRS to UseCase pattern.
    - **Get Contact Statuses**: Implemented `GetContactStatusesUseCase`.

## 4. Feature Verification
- [x] **Get Contact Statuses**:
    - Returns a list of available contact statuses for a company.
    - Filters by active status and sorts by name.
- [x] **Get Contacts**:
    - Implemented database-level pagination using a two-step query approach (Primary ID query + Detail query).
    - Added multi-product support: each contact returns a `products` array with all active assignments for the user.
    - Optimized response by completely removing notes and related joins from the list view.
    - Added strict product integrity checks (non-deleted products assigned to the user).
    - **Product Latest Note**: Each product in the `getContacts` API now includes the `latest_note` description from the `notes` table.
    - Honors user roles to manipulate dial targets (`autodial` vs `manualdial`) in the primary query.
    - Refactored Vendor filtering logic to restrict visibility to vendors assigned to the logged-in user's departments directly (via `user_products` cross-referenced with `product_contacts`).
- [x] **Get Contact Details**:
    - Returns deeply nested relationships according to the target contact type.
    - Relies purely on read-only queries. Matches exact required JSON output format.
- [x] **Create Contacts**:
    - Uses `CreateContactUseCase` isolating business logic.
    - Maintains transactional safety for single and bulk imports.
    - Implemented exact PHP duplicate checks (`isDuplicateMobileAndAlternateNumber`) in TS.
    - Determines autodial vs manualdial strictly based on UserCompany role.
    - **Vendor Handling**:
        - Faithfully implemented requirement to use `services` table for validation when `type=vendor`.
        - Correctly propagates `is_service=1` to `product_contacts` and `user_product_contacts` for vendor types.
        - Automatically resolves and maps departments from `department_services` to `user_products` for the logged-in user upon interaction.

- [x] **Update Contacts**:
    - Replicates Laravel `updateContact` method faithfully.
    - Uses `UpdateContactUseCase` with exact duplication rules for alternate numbers.
    - Ensures changes to unassigned statuses gracefully remove existing user product contact mapping.
    - Strictly maps to required DTO specifications correctly.
- [x] **Get Call Logs**:
    - Implemented with exact Laravel query builder translating to TypeORM subqueries and joins.
    - Validates company and product using existing repository patterns.
    - Correctly paginates and filters based on inputs without altering any rules.
- [x] **Save Bulk Call Logs**:
    - Iterates call logs ensuring validations run correctly for notes, durations, types.
    - Safely connects to Contacts, ProductContacts, and UserProductContacts enforcing constraints.
    - Utilizes TypeORM Query method for inserts bypassing circular deps.
- [x] **Save Call Log Details**:
    - Conditionally saves `note_reminder_datetime` allowing empty string `''` without failing format validation.
- [x] **Upload Attachments**:
    - Transitioned from physical file uploads to direct processing of attachment objects (`filename`, `url`).
    - Removed `StorageService` dependency and `AnyFilesInterceptor` from the process.
    - Validates existence of contact and target product (if provided) before saving attachment metadata.
    - Adheres to standard JSON response conventions and correctly uses repository layers.
- [x] **Get Contact Counts**:
    - Correctly calculates counts for `my_plan`, `new`, `reminder`, and `overdue`.
    - `my_plan`: Includes counts for `is_my_plan = 1`.
    - `new`, `reminder`, `overdue`: Excludes items already in My Plan (`is_my_plan = 0`).
    - Uses date-only comparison for `reminder` and `overdue` (today + future vs past days).
    - Exposed via `GET contacts/actions/count`.
- [x] **Get Action Details**:
    - Returns contact details for `my_plan`, `new`, `reminder`, or `overdue` based on the requested action type.
    - `my_plan`: Fetches all `notes` and `user_product_contacts` where `is_my_plan = 1`. For `notes`, `is_done` must be `false`.
    - `new`, `reminder`, `overdue`: Excludes items already in My Plan (`is_my_plan = 0`).
    - Uses the same filtration logic as `Get Contact Counts` (validated against code implementation).
    - Returns data in the same format as `Get Contacts` API (uses the same detail fetching logic and `GetContactsResponseDto`).
    - **Sorting Logic**:
        - `new`: Ascending by assignment time (`user_product_contacts.created_at`).
        - `reminder`/`overdue`: Ascending by `reminder_datetime`.
    - Paginated and optimized for performance.
- [x] **Optional Contact Type Support**:
    - Modified `GetContactsDto` to make `type` an optional parameter.
    - Updated `ContactService` to resolve `targetDial` correctly when `type` is omitted, allowing `autodial` to pass through for combined results.
    - Enhanced `ContactRepository` to support a "combined" view when `type` is missing:
        - Automatically joins and applies visibility rules for Clients, Vendors, and Colleagues in a single query.
        - Respects `targetDial` across all types: blocks non-client types when `autodial` is requested (as they lack autodial flags).
        - Handles detail fetching for mixed types by using `COALESCE` and conditional joins for `products` and `services`.
- [x] **Mark My Plan**:
    - Updates `is_my_plan = 1` for a list of notes or calls.
    - Receives an array of `{ id: number, type: 'notes' | 'call' }`.
- [x] **Unmark My Plan**:
    - Updates `is_my_plan = 0` for a list of notes or calls.
    - Reuses the same payload structure as Mark My Plan.
- [x] **Get Recent Actions**:
    - Returns all recent calls, reminders, and visits performed by the user.
    - Uses `UNION ALL` for calls and completed notes (`is_done = 1`).
    - Does not deduplicate contacts, showing multiple actions for the same contact if they exist.
    - Sorting is done by timestamp in descending order.
    - Matches the `Get Action Details` response format exactly.
- [x] **Update Contact Reminders**:
    - Implemented `markRemindersAsSent` in `NoteRepository`.
    - Correctly filters by `contactId`, `userId`, `is_done = 0`, `forNote = 'others'`, and `call_log_id != currentId`.
    - Updates `is_done = 1` for existing reminders.
    - Dynamically determines assigned products/services using `user_product_contacts` and `isService` flag.
    - Injected into `SaveCallLogDetailsUseCase` loop to ensure reminders are marked before new notes are created.
- [x] **Check Contact Products**:
    - Faithfully implemented requirement to return a `products` array in the `contacts/check` API.
    - Logic handles `is_service` flag correctly based on `contactType`.
    - Fetches product names from correct tables (`products`/`services`).
    - Includes latest status from `contact_statuses`.
    - Efficiently retrieves the latest note from the `notes` table for each product.
- [x] **Company Scoping [DECISION]**:
    - Verified that `getContacts` strictly scopes all product, service, and status joins by `contacts.company_id`.
    - Verified that `getContactDetails` includes `company_id` checks for both the target product/service and its associated status.
    - Prevents cross-company data overlap for products and statuses when a contact exists in multiple companies.

- [x] **Autodial Ordering [DECISION]**:
    - Implemented `MAX(upc.id) ASC` ordering for `targetDial === DialTypeEnum.AUTODIAL`.
    - Applied the logic to both `qb` (Step 1) and `detailQb` (Step 2) for correct pagination and response consistency.
    - Updated mapping logic to follow the insertion order of the `contactMap`, which preserves the order returned by `detailQb`.
    - Verified that this ensures recently updated or assigned products move to the end of the dialer list.

## 5. Non-Negotiable Rules Check
- [x] **Exact Spec Followed**: Matches defined requirements for both Create and Update endpoints.
- [x] **No Side Effects**: Validated properly; no hidden states or unrelated mutations.
- [x] **Consistent Imports**: All cross-module imports use aliases.

**Audit Status:** PASS
