# Compliance Audit Log - libs/users

## 1. Dependency Rule Check
- [x] **Domain Layer**: Does NOT depend on Application, Infrastructure, or UI.
    - Verified `src/domain/user.entity.ts`: Pure TS class.
    - Verified `src/domain/ports/user.repository.port.ts`: Interface only.
- [x] **Application Layer**: Depends ONLY on Domain.
    - Verified `src/application/*.usecase.ts`: Imports `User`, `UserRepositoryPort`.
    - Verified `UpdateUserProfileUseCase` includes no Infrastructure or UI dependencies.
- [x] **Infrastructure Layer**: Depends on Domain and External Libs (TypeORM).
    - Verified `src/infrastructure/persistence/user.repository.ts`: Implements Port, uses Mappers.
- [x] **UI Layer**: Depends on Application.
    - Verified `src/ui/users.controller.ts`: Calls UseCases.

## 2. Interface & Visibility Check (Barrel File Rule)
- [x] **Barrel File (`index.ts`)**: Exports primarily public services and DTOs.
- [x] **Encapsulation**: 
    - Internal use cases (`UpdateUserProfileUseCase`) are NOT exported.
    - Internal interfaces (`UserUpdateData`) are NOT exported from the barrel.
- [x] **NO deep imports**: All cross-module communication happens through the public API.

## 3. Standard Workflow Check
- [x] **Phase 1 (Design)**: Contract defined in `CONTRACT.md` before implementation.
- [x] **Phase 2 (Implementation)**: Adheres to Hexagonal Architecture. 
- [x] **Consistency**: New feature uses existing patterns (Mappers, Ports, UseCases).

## 4. Feature Verification
- [x] **Get User Profile**: Correctly fetches and maps user data.
- [x] **Update Profile API**:
    - **Validation**: `UpdateUserProfileDto` enforces constraints (max 25, uniqueness, URL).
    - **Logic**: Implements `$user->lastname = $request->lastname ?? ''` and image deletion/update flags exactly.
    - **Uniqueness**: Enforces unique email and mobile checks excluding current user ID.
    - **Response**: Returns standardized JSON response instead of redirect (approved architectural deviation).

## 5. Non-Negotiable Rules Check
- [x] **Exact Spec Followed**: Logic matches the provided Laravel specification.
- [x] **No Side Effects**: No unauthorized behaviors or rule changes added.
- [x] **Audit Status**: PASS

## 6. Feature Verification (Additions)
- [x] **Notification Entity Implementation**:
    - **Schema**: Maps all columns from the provided SQL including `product_ids` and `note_ids`.
    - **Positioning**: `product_ids` uses `after: 'product_id'` and `note_ids` uses `after: 'note_id'`.
    - **Architecture**: Includes Domain Entity, Persistence Entity, and Mapper.
    - **Database Migration**: Added migration `1773320294420-AddIdsToNotifications.ts` with correct `AFTER` modifiers and registered in `data-source.ts`.
    - **Encapsulation**: Registered in `UsersModule` without altering public service interfaces.

- [x] **Filter Inactive Companies**:
    - **Logic**: `UserRepository.findCompaniesByUserId` now filters by `status: 'active'`.
    - **Verification**: Only companies where the user has an active association are returned per the specification.
    - **Compliance**: No existing behaviors were weakened, and no outside APIs were called.

- [x] **Get Notifications API Implementation**:
    - **Logic**: Matches the provided Laravel specification, including unread count, paginated notifications with relations, and pending surprise visits.
    - **Architecture**: Implemented using Ports, UseCases, and Repositories.
    - **Constraints**: No `any` types used; all imports are top-level.
    - **Decoupling**: Avoided `forwardRef` by registering `SurpriseVisitEntity` directly in `UsersModule` and implementing the lookup logic within `NotificationRepository`, maintaining a clean one-way dependency (Visits -> Users).
    - **Audit Status**: PASS

- [x] **Filter all_in_one Companies in Listing**:
    - **Logic**: `UserRepository.findCompaniesByUserId` now filters out companies where the user has the `all_in_one` role using `Not('all_in_one')`.
    - **Compliance**: Adheres strictly to the specification to exclude admin roles from standard company listings. No regression.
