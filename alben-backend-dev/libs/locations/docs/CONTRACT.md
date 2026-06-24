# CONTRACT - Locations Module

## Purpose
The system decides whether a user can **Check In** or **Check Out** at a specific **Company Location** based on their assigned shift and geographic proximity.

## Inputs
- `userId`: Identifier of the user.
- `companyId`: Identifier of the company.
- `activityStatus`: 'Check In' or 'Check Out'.
- `latitude`: User's current latitude (input fact).
- `longitude`: User's current longitude (input fact).
- `currentTime`: Current timestamp (passed as input to ensure determinism).

## Outputs
- `success`: Boolean.
- `message`: Description of the result.
- `logCreated`: Details of the created log entry (if any).

## Rule Evaluation Order

### 1. Attendance Validation
- If `activityStatus` is 'Check In':
    - Validate user belongs to the company.
    - Identify current shift from `currentTime`.
    - If user is currently checked in at another company, they must be checked out there first.
- If `activityStatus` is 'Check Out':
    - Validate user belongs to the company.

### 2. Shift Correction (Process)
- Check the last log for the user/company.
- If last log was 'Check In' and `currentTime` is past the shift end + buffer:
    - Automatically create a 'Check Out' log for the *past* shift.
    - Update `UserCompany` status to 'Check Out'.

### 3. Log Creation
- Get `ShiftDetails` (date, start/end times, holiday status).
- Get `JobLocation` (lat, long, radius).
- Create a new `UserLog` entry.
- Update `UserCompany`'s current `activityStatus`.

## Non-Responsibilities
- Does not handle payroll or salary calculation.
- Does not manage user roles (handled by `libs/users`).
- Does not handle device authentication.
