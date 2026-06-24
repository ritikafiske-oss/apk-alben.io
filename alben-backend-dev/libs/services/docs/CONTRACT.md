# Contract: Services Module

## 1. Purpose
The `Services` module is responsible for identifying and fetching the services associated with a user's assigned departments.

## 2. Decision
The system decides which services are available to a user by mapping their assigned departments (from `user_products`) to the services defined in `department_services`.

## 3. Public Interface

### 3.1 Get Services
**Endpoint:** `GET /services`

**Input:**
- `userId`: `number` (Derived from authentication context via JWT)
- `companyId`: `number` (Passed as a query parameter)

**Output:**
- `services`: `Array<{ id: bigint, name: string }>`

**Rule Evaluation Order:**
1. Identify all `departmentId`s associated with the `userId` from the `user_products` table.
2. Filter departments from the `products` table where `is_department = 1` (Verification step).
3. Identify all `serviceId`s associated with these `departmentId`s from the `department_services` table.
4. Fetch service details (`id`, `name`) from the `services` table for the identified `serviceId`s where `status = 1` (Active) AND `company_id = companyId`.
5. Return the list of unique services.

## 4. Dependencies
- `Users` (Implicit via `userId`)
- `Products` (For department validation)

## 5. Non-Responsibilities
- This module does NOT handle user authentication.
- This module does NOT handle service execution or logic beyond discovery.
- This module does NOT handle pricing or billing for services.
