# Features Classification - Contacts Module

## CORE (Frozen)
> These features are critical for contact management.

1.  **Get Contact Statuses**
    - Retrieve a list of all defined statuses that can be assigned to a contact (e.g., New, In Progress, Closed).
    - **Logic:** Filters by `companyId` and `status='active'`.
    - **Sorting:** Alphabetical by name.

## FLEX (Changeable)
> These features are likely to evolve.

1.  **Status Metadata**
    - Colors (`colorCode`), visibility flags (`isHide`, `isUnassigned`) might be adjusted or augmented.

2.  **Create Contacts** [DECISION]
    - Single or bulk creation of contacts.
    - Validates mobile numbers (10 digits, unique) and alternate numbers (not duplicate).
    - `firstname` and `mobile` are mandatory; `email` and other fields are optional.
    - Checks relationships: reference contact, targeted company, valid product, valid status.
    - Determines auto-dial or manual-dial status automatically based on the user's role.
    - Evaluates contact limit restrictions and duplicates.
    - **Vendor Handling**: Use `services` table for product validation. Maps departments from `department_services` to `user_products`. Sets `is_service = 1` in mapping tables.


3.  **Update Contacts** [DECISION]
    - Updates basic contact information.
    - Handles status transitions, correctly removing user-product-contact associations if marked unassigned.
    - Validates alternate numbers.

3. **Get Contacts** [DECISION]
   - Retrieve a list of contacts with full filtering (by type, search query, dial mode, status, date range).
   - `type` is optional. If omitted, returns all contacts the user is authorized to see (clients, vendors, colleagues).
   - Return matched pagination response format exactly as required.
   - For `client` and `colleague`, includes all products assigned to the user for each contact, along with their status, details, and the `latest_note` from the `notes` table.
   - For `vendor`, returning all vendors based on the logged-in user's departments (via `user_products` mapping to department products that correspond to `product_contacts`).
   - Restricts `autodial` and `manualdial` visibility based on users' company role (`telecaller`, `field_agent`).
   - **Company Scoping [DECISION]**: Strictly returns ONLY contacts and their associated products/services/statuses that belong to the active `company_id`.
   - **Autodial Ordering [DECISION]**: When `dial=autodial`, contacts are ordered by the maximum `user_product_contacts.id` in ascending order. This ensures contacts with recent product updates or new assignments are moved to the end of the list.

4. **Get Contact Details** [DELIVERY]
   - Fetch comprehensive details of a specific contact based on their type (`client`, `vendor`, `colleague`).
   - Retrieve associated notes, attachments, call logs, and visit logs (with latest location change request status).
   - Handles product and status relations gracefully according to contact type.
   - **Data Isolation [DECISION]**: Ensures all joined product and status information belongs to the contact's `company_id`.
   - Does not alter business rules or states.

5. **Get Call Logs** [DELIVERY]
   - Retrieve paginated call logs with filtering by company, product, contact type, call type, date range, and search query.
   - Includes related contact, product, status, and latest note data.
   - Does not alter business rules or states.

6. **Save Bulk Call Logs** [DECISION]
   - Validates the array payload strictly including nested relations.
   - Resolves Dialing types and increments attempts mapping.
   - Triggers dependent creation processes (Contact, ProductContact, Note).

6a. **Save Call Log Details** [DECISION]
   - Saves specific product, status, and note updates for an existing call log.
   - Updates assignments and contact statuses similar to bulk save.
   - Allows `note_reminder_datetime` to be empty (`''`). Validation only applies if a value is provided.

7. **Upload Attachments** [PROCESS/DELIVERY]
   - Allows users to provide multiple attachment paths associated with a contact (and optionally a product).
   - Validates existence of contact and target product (if given and required).
   - Updates the attachment paths directly in the contact record instead of uploading physical files.
   - Does not alter underlying rules or decision outputs.

8. **Get Contact Counts** [DELIVERY]
    - Returns counts for `my_plan`, `new`, `reminder`, and `overdue` filtered by user and company.
    - `my_plan`: Count of `user_product_contacts` (where `is_my_plan` is 1) + count of `notes` (where `is_my_plan` is 1 and `is_done` is false) for `userId` in `company_id`.
    - `new`: Count of `user_product_contacts` for `userId` in `company_id` where `is_newly_assigned` is true and `is_my_plan = 0`.
    - `reminder`: Count of `notes` for `userId` in `company_id` where `is_done` is false, `is_my_plan = 0`, and date of `reminder_datetime >= current date`.
    - `overdue`: Count of `notes` for `userId` in `company_id` where `is_done` is false, `is_my_plan = 0`, and date of `reminder_datetime < current date`.

9. **Get Action Details** [DELIVERY]
    - Returns contact details for `my_plan`, `new`, `reminder`, or `overdue` based on the requested action type.
    - `my_plan`: Fetches all `notes` and `user_product_contacts` where `is_my_plan = 1`. For `notes`, `is_done` must be `false`.
    - `new`, `reminder`, `overdue`: Fetches data with `is_my_plan = 0`.
    - Includes a `type` field: `"call"` for calls (from `user_product_contacts` and `notes` where `for_note = "others"`) and `"visit"` for visits (from `notes` where `for_note = "visit"`).
    - Uses the same filtration logic as `Get Contact Counts` for other types.
    - Returns data in the same format as `Get Contacts` API.

10. **Mark My Plan** [PROCESS/DELIVERY]
    - Updates `is_my_plan = 1` for a list of notes or calls.
    - Receives an array of `{ id: number, type: 'notes' | 'call' }`.
    - Updates `notes` table for type `notes`.
    - Updates `user_product_contacts` table for type `call`.

11. **Unmark My Plan** [PROCESS/DELIVERY]
    - Updates `is_my_plan = 0` for a list of notes or calls.
    - Receives an array of `{ id: number, type: 'notes' | 'call' }`.
    - Updates `notes` table for type `notes`.
    - Updates `user_product_contacts` table for type `call`.

12. **Get Recent Actions** [DELIVERY]
    - Returns a list of all recent actions (calls, reminders, visits) performed by the user.
    - Does NOT deduplicate contacts; each action is shown as a separate entry.
    - Filters notes/reminders by `is_done = 1` and `reminder_datetime IS NOT NULL`.
    - Returns data in the same format as `Action Details` API.

13. **Update Contact Reminders [PROCESS]**
    - Automated step in `SaveCallLogDetailsUseCase` to mark existing reminders as completed.
    - **Logic:** Sets `is_done = 1` for existing notes where `reminder_datetime` is set, `for_note = 'others'`, matching the contact, assigned products/services, and logged-in user.
    - Ensures a clean slate for new reminders by marking previous ones as handled upon interaction.

14. **Check Contact Products [DELIVERY]**
    - Returns a list of all products associated with a contact in the `check` API.
    - **Logic:**
        - Filters by contact ID and `is_service` (1 for vendors, 0 for others).
        - Includes the latest status for each product.
        - Includes the latest note (description) for each product from the `notes` table.

