# Features Classification - Dashboard Module

## CORE (Frozen)
> These features are critical for dashboard reporting and must match the reference API logic (without plan filtering).

1.  **Get Dashboard Metrics** [DELIVERY]
    - Expose an API endpoint (`GET /dashboard/metrics`) to fetch dashboard statistics.
    - **Logic:** Return dynamic counts for set reminders, total new leads, total overdue, completed reminders, completed overdue, and completed new leads. 

2.  **Dynamic Metric Calculation** [PROCESS]
    - Fetching real-time metrics from the database based on `userId` and `companyId`.
    - **Constraint:** Synchronize with the `actions/count` logic from the `ContactsModule`.
    - **Update:** 
        - Must NOT include `is_my_plan = 0` filter for dashboard.
        - `totalNewLeadCount` now filters for `called_at IS NULL`.
        - `completedNewLeadCount` filters for `called_at` being today.
        - `completedOverdueCount` filters for `updated_at` being today.

3.  **Lead Activity Tracking** [CORE]
    - Track when a newly assigned lead is first called via the `called_at` timestamp.
    - Transition leads from "New" to "Completed New Lead" status upon saving call details.

## FLEX (Changeable)
> These features are likely to evolve in future phases.

2.  **Historical Trends**
    - Showing weekly or monthly graphs for reminders and lead assignments.
