# Features Classification - Products Module

## CORE (Frozen)
> These features are critical for product management and assignment.

1.  **Get Assigned Products**
    - Retrieve list of products a user has access to within a company.
    - **Logic:** filters `user_products` by `userId` and `companyId`.
    - **Sorting:** Products are sorted alphabetically by name.

2.  **Product Contact Status Management**
    - **Get Status:** Retrieve the current status of a contact for a specific product context.
    - **Update Status:** Modify the status of a contact (e.g., Interested, Not Interested) for a specific product.
    - **Validation:** Ensures the user has rights to update the status.

## FLEX (Changeable)
> These features are likely to evolve.

1.  **Product Metadata**
    - The specific fields returned for a product (e.g., `document`, `is_department`) might be expanded.

2.  **Contact Interaction Logic**
    - The rules for how many attempts or what specific status transitions are allowed might change.
