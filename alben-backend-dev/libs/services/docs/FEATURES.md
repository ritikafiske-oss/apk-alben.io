# Features: Services Module

All features are classified according to the `CHANGE_PROOF_RULEBOOK.md`.

| Feature | Category | Classification | Description |
| :--- | :--- | :--- | :--- |
| **Get Services** | DECISION | 🔒 FREEZE | Fetches services based on the authenticated user's department mapping and selected company. |
| **Multi-tenant Filtering** | DECISION | 🔒 FREEZE | Only services belonging to the selected `company_id` are returned. |
| **Active Service Filtering** | DECISION | 🔒 FREEZE | Only active services (`status = 1`) are returned. |
| **Department Validation** | DECISION | 🔒 FREEZE | Only products marked as `is_department = 1` are considered valid departments. |

## Feature Details

### 1. Get User Services
- **Status:** CORE
- **Logic:** Joins `user_products` -> `products` (check `is_department`) -> `department_services` -> `services`.
- **Flexibility:** None. Any change to the mapping logic requires a contract update.
