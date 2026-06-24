# Reports Module Contract

## Public API

### Endpoints

#### `GET /reports/calls`
Fetches call statistics for a specific company and period.

**Query Parameters:**
- `company_id` (required, integer): The ID of the company.
- `filter_by` (required, string): One of `today`, `yesterday`, `this_week`, `previous_week`, `this_month`, `previous_month`, `this_year`, `custom_date`.
- `start_date` (optional, string, YYYY-MM-DD): Required if `filter_by` is `custom_date`.
- `end_date` (optional, string, YYYY-MM-DD): Required if `filter_by` is `custom_date`.

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Report data fetched successfully.",
  "data": {
    "total_calls": 10,
    "total_duration": "15:30",
    "total_call_log_product_details_count": 5,
    "contact_statuses": [
      {
        "contact_status": "Interested",
        "total": 3,
        "color_code": "#FF5733",
        "percentage": 60.0
      },
      ...
    ]
  }
}
```

**Calculation Rules:**
- **`total_calls` & `total_duration`**: Global counts fetched from the `call_logs` table.
- **`total_call_log_product_details_count`**: Total number of unique **(Client ID + Product ID)** pairs across all call logs in the period.
- **`contact_statuses[].total`**: Number of unique **(Client ID + Product ID)** pairs whose **most recent status** in the period matches this status.
- **`contact_statuses[].percentage`**: `(Status Product Count / total_call_log_product_details_count) * 100`.
- **Note**: The `contact_statuses` array is sorted in **descending order** by the product count (`total`). No duration is returned per status.


#### `GET /reports/visits`
Fetches visit statistics for a specific company and period.

**Query Parameters:**
- `company_id` (required, integer): Same as above.
- `filter_by` (required, string): Same as above.
- `start_date` (optional, string, YYYY-MM-DD): Same as above.
- `end_date` (optional, string, YYYY-MM-DD): Same as above.

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Report data fetched successfully.",
  "data": {
    "total_visits": 5,
    "total_travelling_distance": "12.5 km",
    "total_visit_log_product_details_count": 8,
    "visit_types": [
      {
        "visit_type": "Store Visit",
        "total": 5,
        "color_code": "#33FF57",
        "percentage": 62.5
      },
      ...
    ]
  }
}
```

**Calculation Rules:**
- **`total_visits`**: Global count fetched from the `visit_logs` table.
- **`total_travelling_distance`**: Calculated using `LocationLog` entries for the period.
- **`total_visit_log_product_details_count`**: Total number of unique **(Client ID + Product ID)** pairs across all visit logs in the period.
- **`visit_types[].total`**: Number of unique **(Client ID + Product ID)** pairs whose **most recent visit type** in the period matches this type.
- **`visit_types[].percentage`**: `(Visit Type Product Count / total_visit_log_product_details_count) * 100`.
- **Note**: The `visit_types` array is sorted in **descending order** by the product count (`total`).


#### `GET /reports/attendance`
Fetches user attendance records and summary statistics.

**Query Parameters:**
- `company_id` (required, integer): The ID of the company.
- `start_date` (optional, string, YYYY-MM-DD): Start of the date range.
- `end_date` (optional, string, YYYY-MM-DD): End of the date range.
- `page` (optional, integer, default 1): Page number for pagination.
- `limit` (optional, integer, default 200): Items per page.

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Fetched attendance records.",
  "data": {
    "today_hr": "08:30",
    "current_week_hr": "42:15",
    "current_month_hr": "160:00",
    "last_month_hr": "172:45",
    "current_status": "Check In",
    "current_page": 1,
    "total_pages": 1,
    "total_items": 10,
    "records": [
      {
        "user_id": 1,
        "company_id": 1,
        "date": "2024-03-20",
        "check_in_time": "09:00 AM",
        "check_out_time": "05:30 PM",
        "total_hours": "08:30",
        "total_minutes": 510,
        "total_hours_in_seconds": 30600,
        "latitude": 12.9716,
        "longitude": 77.5946
      }
    ]
  }
}
```

**Calculation Rules:**
- **Attendance Records**: Aggregated from `user_logs` grouped by `shift_date`.
- **Shift Calculation**: Uses `shift_start_datetime`, `shift_end_datetime`, and `buffer_hours` to filter valid check-in/out timestamps.
- **Working Hours**: Calculated by pairing consecutive check-in and check-out events within the shift window.
- **Summary Stats**: (Calculated independently of `start_date` and `end_date` inputs)
    - `today_hr`: Sum of working minutes for the current day.
    - `current_week_hr`: Sum of working minutes from Monday of the current week to the last day of the current week.
    - `current_month_hr`: Sum of working minutes from the 1st of the current month to the last day of the current month.
    - `last_month_hr`: Sum of working minutes from the 1st of the previous month to the last day of the previous month.
- **Current Status**: Fetched from the user's current `activity_status` in the company.

## Dependencies
- `libs/common`: For `DateUtil`, `ExceptionHandler`, and `ApiResponse`.
- `libs/users`: For authentication and authorization.
- `libs/contacts`: For `CallLog` and `ContactStatus` entities/repositories.
- `libs/visits`: For `VisitLog` and `VisitType` entities/repositories.
- `libs/locations`: For `LocationLog` entries to calculate distance.

## Events
- **Requirement:** Include product-related data from `call_log_product_details`.
