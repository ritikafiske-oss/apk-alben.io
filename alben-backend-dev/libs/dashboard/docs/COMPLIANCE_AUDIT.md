# Compliance Audit Log - libs/dashboard

## 1. Dependency Rule Check
- [x] **Domain Layer**: Does NOT depend on Application, Infrastructure, or UI. (No domain changes in this module).
- [x] **Application Layer**: Depends ONLY on Domain and Shared Kernels.
    - Verified `GetDashboardMetricsUseCase`: Uses `UserProductContactEntity`, `NoteEntity` via TypeORM repositories.
- [x] **Infrastructure Layer**: Depends on Domain and External Libs (TypeORM). (N/A).
- [x] **UI Layer**: Depends on Application.
    - Verified `DashboardController`: Calls `GetDashboardMetricsUseCase`.

## 2. Interface & Visibility Check
- [x] **Barrel File (`index.ts`)**: No internal entities or private logic leaked. (N/A).

## 3. Standard Workflow Check
- [x] **Phase 1 (Design)**: Created `CONTRACT.md` and `FEATURES.md` with updated logic.
- [x] **Phase 2 (Implementation)**: Implemented `called_at` logic and dashboard metric refinements.

## 4. Feature Verification
- [x] **User Product Contact Schema**:
    - Added `called_at` datetime column (nullable) to the `user_product_contacts` table.
    - Successfully registered migration `1773320294410-AddCalledAtToUserProductContacts.ts`.
- [x] **Lead Tracking (saved_at)**:
    - Automatically updates `called_at` when saving call log details if it is currently null.
    - Ensures newly assigned leads remain in "new" status until the first interaction.
- [x] **Dashboard Metrics Refinement**:
    - **Total New Leads**: Now filters for `called_at IS NULL`.
    - **Completed New Leads**: Correctly implemented today-only filter (`DATE(called_at) = today`).
    - **Completed Overdue**: Refined to items updated today (`updated_at >= todayStart`).
    - **Checked-in Time**: **[IMPLEMENTED]** Fetching latest `check_in`/`check_out` log. Returns IST time if latest is `check_in`, else `null`.
    - **Total Auto-dial Leads**: **[IMPLEMENTED]** Counted unique contacts with `is_autodial = 1`.
    - **Completed Auto-dial Leads**: **[IMPLEMENTED]** Counted autodial leads excluding those already called today, as per the requested "exclude today's calls" logic.
- [x] **Contact Actions Refinement**:
    - `actions/count` and `actions/details` for "new" contact type now strictly filter for `called_at IS NULL`.

## 5. Non-Negotiable Rules Check
- [x] **Exact Spec Followed**: All requirements from the specification were met without adding extra behavior.
- [x] **No Side Effects**: Module only reads/updates records as required by the business logic.
- [x] **Consistent Architecture**: Followed the existing Hexagonal/Onion architecture of the project.

**Audit Status:** PASS
