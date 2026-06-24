# Features Classification

## CORE (Frozen)
> These features are critical and should not change without a major version update.

1.  **Visit Logging**
    - **`saveVisitLog`**: Records details of a field visit, including location, photos, and remarks.
    - **Multi-Product Support**: A single visit can now be associated with multiple products, each having its own note/remark, reminder date, and status.
    - **Offline/Batch Support**: Accepts a JSON string (`data`) containing an array of visits to support loose coupling and potential offline-sync scenarios.
    - **Photo Upload**: Supports uploading multiple photos (handled via `StorageService`) mapped to specific visit entries.
    - **Duplicate Check**: Prevents duplicate logs for the same contact, product, and date.

2.  **Visit Types**
    - **`getVisitTypes`**: Retrieves configurable visit types (e.g., "Meeting", "Demo") specific to a company.
    - **Follow-up Logic**: flags if a visit type requires a next follow-up date.

3.  **Visit History**
    - **`getVisitLogs`**: Retrieves a paginated history of visits for a user/product/company.
    - **`getVisitLogDetails`**: Retrieves detailed information for a specific visit, including multi-product details and notes.
    - **Filtering**: Supports filtering by `visit_type_id`.

4.  **Surprise Visits**
    - **`saveSurpriseVisit`**: Logs a "surprise" or audit visit answering a specific question (e.g., "Is the shop open?").
    - **Geolocation**: Captures latitude and longitude for verification.

5.  **Location Change Requests**
    - **`contactLocationChangeRequest`**: Allows users to request a location update for a specific visit.
    - **Status Tracking**: Requests transition through `pending`, `approved`, `rejected`, `cancelled`, or `reverted`.
    - **History Chain**: Maintains a link to the `previous_visit_log_id` to track the change history.
    - **Batch Processing**: Supports submitting multiple requests in a single call.

## FLEX (Changeable)
> These features are likely to evolve or are not yet fully defined.

1.  **Location Validation**
    - The logic for `primaryLatitude`/`primaryLongitude` updates on the first visit might evolve.
    - Geofencing or stricter location checks could be added.

2.  **Reporting**
    - Aggregated reports (daily/weekly summaries) are not yet implemented in this module.
