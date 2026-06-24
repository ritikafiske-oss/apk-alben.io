# Features: Health Module

## Feature Classification

| Feature | Category | Description | Classification |
| :--- | :--- | :--- | :--- |
| **Health Check API Endpoint** | Delivery | Exposes a `/health` endpoint for external monitoring tools like Grafana. | **CORE** (Frozen) |
| **Database Connectivity Check** | Process | Verifies that the application can communicate with the primary database. | **CORE** (Frozen) |
| **Memory Heap Usage Check** | Process | Verifies the node application is not exceeding safe memory bounds. | **FLEX** (Configurable Threshold) |
| **Response Formatting** | Delivery | Formats the aggregated health check results into a standard JSON structure. | **CORE** (Frozen) |
