# FEATURES - Locations Module

This document classifies the features for the Locations module according to the Change-Proof Rulebook.

| Feature Name | Category | Rules | Classification |
| :--- | :--- | :--- | :--- |
| **Change Activity Status** | PROCESS | Orchestrates validation, past entry creation, and log creation. | CORE (Frozen) |
| **Shift Validation** | DECISION | Determines if a timestamp falls within a specific shift + buffer. | CORE (Frozen) |
| **Location Validation** | DECISION | Validates if lat/long is within radius of job location. | CORE (Frozen) |
| **Past Check-Out Entry** | PROCESS | Automatically creates a check-out log if a shift was missed. | CORE (Frozen) |
| **Shift Buffer Hours** | FLEX | Configurable buffer for checking in/out. | FLEX (Config) |
| **Sync Locations** | PROCESS / DELIVERY | Bulk sync of location logs with deduplication. | ADAPTER (Flex) |

## Change Classification
- **Decision Layer**: Pure logic evaluating time and distance against shift/location rules.
- **Process Layer**: The sequence of checking previous logs, creating new logs, and updating user status.
- **Delivery Layer**: The REST API controller which receives the payload.

## Freeze vs Flex
- **🔒 FREEZE**:
    - The requirement that a user must be checked out of other companies before checking into a new one.
    - The rule for creating past check-out entries.
- **🔄 FLEX**:
    - Shift buffer hours (stored in database/config).
    - Location radius (stored in database per location).
