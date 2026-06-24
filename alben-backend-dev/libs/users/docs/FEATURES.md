# Features Classification

## CORE (Frozen)
> These features are critical and should not change without a major version update.

1.  **Get User Profile**
    - Retrieve authenticated user's details.
    - Fields: `id`, `firstname`, `lastname`, `mobile`, `email`, `profile_image`, `gender`, `language`, `skill`.
    - **Computed Field:** `activity_status` (Fetched from `user_companies` table based on `selected_company_id`).
    - Security: Must match the `sub` (userId) from the Auth Token.

2.  **Get User Companies**
    - Retrieve a **list** of companies associated with the user where the association is **active** and role is NOT **all_in_one**.
    - Source: Join `companies` table with `user_companies` table on `company_id` where `status = 'active'` and `role != 'all_in_one'`.
    - Fields: `id`, `business_name`, `business_logo`, `helpline_no_1`, `helpline_no_2`.

3.  **Single Device Login Enforcement (Best Practice)**
    - **Mechanism:** JWT with Stateful Session Validation.
    - **Login:**
        1. Generate a unique `session_id` (UUID).
        2. Mint a JWT containing this `session_id` in the payload (e.g., claim `sid`).
        3. Store the `session_id` in the `users.api_token` column.
    - **Verification (Auth Guard):**
        1. Decode JWT and extract `sid`.
        2. Compare `JWT.sid` with `user.api_token` from DB.
        3. If they mismatch, the session is invalid (another device has logged in).
    - **Logout:** Set `api_token` to `NULL`.

## FLEX (Changeable)
> These features are likely to evolve or are not yet fully defined.

1.  **Profile Image Handling**
    - URL generation or storage logic might change.

2.  **Company Data Structure**
    - The exact fields returned for "Company" are flexible depending on `companies` table structure (which is not yet provided, so we assume basic fields).

3.  **Get Active App Version**
    - Returns the single active record from the `app_versions` table.
    - Fields: `version`, `description`, `is_force`.
    - Endpoint: `GET /users/app-version` (public, no auth required).
    - Source: `app_versions` table where `status = 'active'`, first result.

4.  **Notification Management**
    - Manage user-directed notifications.
    - Source: `notifications` table.
    - Fields: `id`, `title`, `description`, `is_read`, `user_id`, `sent_by`, `contact_id`, `product_id`, `product_ids`, `note_id`, `note_ids`, `company_id`, `notification_type`.
    - **Positioning:** `product_ids` is positioned after `product_id`, and `note_ids` is positioned after `note_id`.

    ### 2. Get Notifications (Process)
    - Retrieve paginated notifications for the authenticated user and a specific company.
    - **Endpoint:** `GET /users/notifications`
    - **Query Params:**
        - `company_id`: number (required)
        - `page`: number (optional, default 1)
        - `limit`: number (optional, default 200)
    - **Logic:**
        1. Validate `company_id` exists and user is associated with it.
        2. Count unread notifications for the user.
        3. Fetch notifications with relations: `company`, `note`, `product`, `contact`.
        4. For each notification, fetch `contact_status` from `product_contacts` (matching `contact_id` and `product_id`).
        5. Fetch the latest unanswered `surprise_visit` for the user and company.
    - **Response:**
        - `surprise_visit`: latest unanswered question or null.
        - `total_unread`: count of unread notifications.
        - `current_page`: current page number.
        - `total_pages`: total number of pages.
        - `total_items`: total count of notifications.
        - `records`: array of notification objects with relations.


