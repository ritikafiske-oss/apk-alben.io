# Reports Module Features

## Features

### [CORE] Get Call Statistics
- Returns global `total_calls` and `total_duration` based on the `call_logs` table.
- Returns ALL contact statuses for the company, even if they have 0 calls/products.
- Calculates product-based status breakdown: `total` is the count of unique **(Client + Product)** pairs whose last status matches.
- Calculates `percentage` for each status relative to the total number of unique product-client pairs.
- Returns the status breakdown sorted by product count in descending order.

- Returns global `total_visits` and `total_travelling_distance`.
- Returns ALL visit types for the company, even if they have 0 visits/products.
- Calculates product-based visit-type breakdown: `total` is the count of unique **(Client + Product)** pairs whose last visit type matches.
- Calculates `percentage` for each visit type relative to the total number of unique product-client pairs.
- Returns the visit type breakdown sorted by product count in descending order.

### [CORE] Get Attendance Report
- Returns user attendance records including check-in, check-out, and total working hours.
- Calculates summary statistics (independent of date filters): today's hours, current week's hours (Mon-Sun), current month's hours, and last month's hours.
- Handles shift-based attendance with buffer hours and multi-session check-ins/outs.
- Returns current activity status for the user in the company.
- Supports pagination for detailed records.
- Supports date range filtering (defaults to last month).
- [FIX] Corrected double timezone conversion for check-in and check-out times.

### [FLEX] Date Filtering Range
- Supports various predefined ranges (`today`, `yesterday`, `this_week`, etc.).
- Supports custom ranges.
- Uses `DateUtil` for timezone-aware date parsing.

### [FLEX] Response Formatting
- Standard `ApiResponse` body.
- Stats in a nested `data` object.
