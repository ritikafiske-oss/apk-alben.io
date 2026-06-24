# Contract: Health Module

## 1. Purpose
The system decides whether the application and its critical dependencies are currently available and functioning correctly, serving as a pulse for external monitoring (Grafana).

## 2. Public Interface
- **Inbound:** `GET /health` (No request body or parameters required)
- **Outputs (`HealthCheckResponseDto`):**
  - `status`: "ok" | "error" | "shutting_down"
  - `info`: Key-value pairs of passing dependencies
  - `error`: Key-value pairs of failing dependencies
  - `details`: Aggregated details of all checks

## 3. Events
- This module emits **NO** domain events.

## 4. Dependencies
- `@nestjs/terminus` for standard health check abstractions.
- Database Driver/Connection (to ping database health).

## 5. Inputs (Facts)
- HTTP GET Request to the health endpoint.
- Live connectivity status of the configured services (e.g., MySQL database).
- Process-level metrics (e.g., memory heap usage).

## 6. Outputs (Decisions/Results)
- **HTTP 200 OK & Status 'ok':** System decides all critical dependencies are available.
- **HTTP 503 Service Unavailable & Status 'error':** System decides one or more critical dependencies are failing.

## 7. Rule Evaluation Order
1. Receive incoming HTTP health check request.
2. Execute registered system checks (Database connection ping, Memory threshold comparison).
3. Aggregate the status of all checks.
4. If any check fails, system outputs `error` state (HTTP 503).
5. If all checks pass, system outputs `ok` state (HTTP 200).

## 8. Non-Responsibilities
- This module **does not** push or send alerts to monitoring systems (it is passive/pull-based).
- This module **does not** attempt to automatically restart failed services.
- This module **does not** log routine business metrics or user activities.
- This module **does not** verify external third-party services not critical to app startup.

## 9. Performance Constraints
- **Execution Cost:** The health check must be extremely lightweight to support high-frequency polling (e.g., every 5 minutes).
- **Resource Usage:** It must **not** create new database connections (must reuse the existing pool) and must use the simplest possible query (e.g., `SELECT 1`).
- **Processing:** It must **not** perform heavy computations, trigger side-effects, or log to the database.
