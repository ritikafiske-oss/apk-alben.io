# Project General Rules

This document outlines the general architectural decisions, coding standards, and workflow rules for the entire project.

## 1. Technology Stack
*   **Framework:** NestJS (Node.js).
*   **Language:** TypeScript (Strict Mode).
*   **Package Manager:** pnpm (Strict).
*   **Architecture:** Modular Monolith (See `MODULE_RULES.md` for details).
    *   **Root Modules:** Located in `libs/` (e.g., `libs/user`, `libs/billing`).
    *   **Core Logic:** Shared utilities/infrastructure reside in `libs/core` or `libs/shared`.
    *   **API Interface:** REST (default) or GraphQL as specified per module.

## 2. Authentication & Security
*   **Identity:** Authentication is strictly via **`username`** and **`password`**.
*   **Token Strategy:** JSON Web Tokens (JWT) for stateless authentication.
*   **Schema Restrictions:**
    *   Do **NOT** use `email` or `name` columns for users unless explicitly required by the domain.
    *   Do **NOT** include unnecessary timestamp columns unless requested.
*   **Error Handling:**
    *   Use Standard HTTP Status Codes (200, 201, 400, 401, 403, 404, 500).
    *   Return consistent JSON error responses (e.g., `{ "statusCode": 400, "message": "...", "error": "Bad Request" }`).

## 3. Code Standards & Quality
*   **Formatting:** Prettier (default config).
*   **Linting:** ESLint (strict NestJS config).
*   **DTOs:**
    *   **Mandatory** for all Input/Output (Request/Response).
    *   Use `class-validator` and `class-transformer`.
*   **Documentation:**
    *   **Swagger:** Mandatory `@ApiProperty()`, `@ApiOperation()`, `@ApiResponse()` on all Controllers and DTOs.
    *   **DocBlocks:** Mandatory for complex business logic methods.

## 4. Workflow Protocols
*   **Design First:** Always create/update a detailed `implementation_plan.md` before coding complex features.
*   **Contract First:** Define module contracts (DTOs, interfaces) before implementation (See `MODULE_RULES.md`).
*   **Validation:** All new features must be verified via `task.md` checklists and `walkthrough.md`.
*   **Compliance:** strictly adhere to the **Dependency Rule** defined in `MODULE_RULES.md`.
