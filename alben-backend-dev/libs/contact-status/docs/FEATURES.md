# Features Classification

## CORE (Frozen)
> These features are critical and should not change without a major version update.

1.  **Get Contact Statuses**
    - Retrieve a list of contact statuses for a specific company or system default.
    - Fields: `id`, `name`, `colorCode`, `status`, `companyId`, `isHide`, `isUnassigned`, `isDefault`.
    - **Filtration**: Filters by `companyId` and `status` (active).
    - **Ordering**: Sorted by `name` ASC.

## FLEX (Changeable)
> These features are likely to evolve or are not yet fully defined.

1.  **Status Configuration**
    - Logic for "hidden" or "unassigned" statuses might evolve.
