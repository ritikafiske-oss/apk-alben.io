# NestJS Module Development Rules (Domain-Centric)

This document outlines the specific rules and standards for developing modules within the **Modular Monolithic Architecture**.

> **CRITICAL RULE:** All development must strictly adhere to the **Dependency Rule** and the **Standard Workflow**.
> *Domain Logic depends on NOTHING.*
> *Infrastructure depends on Domain.*
> *UI depends on Application.*

## 1. Directory Structure & Naming
* **Root Location:** `libs/` (Strictly lowercase).
* **Module Name:** `libs/{domain-name}` (Kebab-case, e.g., `libs/billing`, `libs/user-access`).
* **Internal Anatomy:** Each module must strictly follow the **Hexagonal/Onion Architecture**:
    * `src/domain/` - (The Core) Entities, Value Objects, Repository Ports. **NO FRAMEWORK CODE.**
    * `src/application/` - (The Use Cases) Services, Command Handlers.
    * `src/infrastructure/` - (The Adapters) Database Repositories (TypeORM), External APIs.
    * `src/ui/` - (The Interface) Controllers, Resolvers, DTOs.
    * `docs/` - **(MANDATORY)** Contains Contract, Features, and Audit logs.
* **The Public API:** Every module must have an `index.ts` at its root.

## 2. Interface & Visibility (The "Barrel File" Rule)
* **Encapsulation:** You are strictly **FORBIDDEN** from importing deep paths from another module (e.g., `import ... from '../users/src/domain/user.entity'`).
* **Public Contract:** You may ONLY import what is exported in the module's root `index.ts`.
* **Export Restrictions:**
    * ✅ **DO** export: Facades, Public DTOs, Module Class, Domain Events.
    * ❌ **NEVER** export: Database Entities, Repositories, Internal Domain Logic.

## 3. Component Standards
### A. UI Layer (`src/ui`)
* **Controllers:** Must be "dumb". They only parse requests, call an `Application Service`, and return a `Response DTO`.
* **Validation:** ALWAYS use `class-validator` DTOs. Do not validate in the controller method body.
* **Documentation:** All Controllers must use `@ApiTags()` and `@ApiOperation()` (Swagger).

### B. Application Layer (`src/application`)
* **Orchestration:** Implement the business use case (e.g., `CreateUserService`).
* **No Direct DB Access:** Inject a **Repository Interface** (Port), never a concrete Repository implementation.

### C. Domain Layer (`src/domain`)
* **Pure TypeScript:** No NestJS decorators (`@Injectable`) inside Entities.
* **Business Rules:** Validation of business logic belongs in the **Entity** or **Domain Service**.

### D. Infrastructure Layer (`src/infrastructure`)
* **Implementation:** The ONLY place where TypeORM/Prisma imports are allowed.
* **Mapping:** You must implement a `Mapper` to convert Database Schemas to Domain Entities.

## 4. Coding Standards
* **Dependency Injection:** Always inject interfaces using standard tokens.
* **DTOs:** Explicitly define `RequestDto` and `ResponseDto`. Never return a raw Database Entity.
* **Strict Boolean Logic:** When handling flags, ensure `false` is treated differently from `undefined`.

---

## 5. Standard Workflow (Mandatory for AI)
To ensure compliance with the Change-Proof Rulebook, the following workflow is **ENFORCED** for all new modules or features. 
**No code is written until Phase 1 is complete.**

### **Phase 1: Design & Contract (Docs First)**
1.  **Create Structure:** Ensure the `libs/{Module}/docs/` folder exists.
2.  **Define the Contract (`CONTRACT.md`):**
    * Define the **Public Interface** (What DTOs come in? What DTOs go out?).
    * Define the **Events** (What events does this module emit? e.g., `UserCreated`).
    * Define the **Dependencies** (What other modules does this module need?).
    * *Note:* In NestJS, this maps directly to your `index.ts` exports and `*.dto.ts` files.
3.  **Classify Features (`FEATURES.md`):**
    * List every feature and classify it as **CORE** (Frozen) or **FLEX** (Changeable).
4.  **STOP:** Get User Approval on the Contract.

### **Phase 2: Implementation (The Build)**
1.  **Write Code:** strictly following `FREEZE vs FLEX` rules defined in Phase 1.
2.  **Refactor:** Ensure logic resides in `Domain/Application` layers. Keep Controllers "dumb".
3.  **Style Check:** * Verify Imports (No deep imports).
    * Verify DocBlocks/Swagger Decorators.
    * Verify Naming Conventions.

### **Phase 3: Audit & Close**
1.  **Create Audit Log (`COMPLIANCE_AUDIT.md`):**
    * Review the module against the **Dependency Rule** (Did UI import DB? If yes, FAIL).
    * Review against the **Barrel File Rule** (Did we export private entities? If yes, FAIL).
2.  **Verify:** Check all points from the Rulebook.
3.  **Completion:** If Audit passes, mark Task as Complete.