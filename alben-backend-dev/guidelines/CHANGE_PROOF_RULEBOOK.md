# Change-Proof Development: The Master Rulebook

**Status:** MANDATORY
**Scope:** All Software Development & AI-Assisted Coding
**Source:** Consolidated from Change Proof SOP, Developer Checklist, and Internal Handbook.

---

## 0. Core Objective & Principles

### The Prime Directive
**"Software exists to execute repetitive business decisions consistently."**

### Objectives
1.  **Upgrade Safety:** Software must not break during upgrades.
2.  **Modification Speed:** Software must be easy to modify.
3.  **AI Safety:** AI accelerates work without introducing risk.
4.  **Reviewability:** Non-developers must be able to safely review and approve behavior.

### The Final Principle
**"Working software is cheap. Change-proof software is leadership."**

---

## 1. Phase 1: Product Definition (Gate 1)

**Mandatory Rule:** No development work may start until the core business decision is defined.

### 1.1 strictly Forbidden Starting Points
x  Starting with UI / Screens.
x  Starting with Tech Stack / Database schema.
x  "Build an app like X".
x  Feature-only descriptions.

### 1.2 Required Output
A single sentence definition:
> **"The system decides whether ___________________."**

---

## 2. Phase 2: Feature Classification (Gate 2)

Every feature request **MUST** be classified into **exactly one** category.

| Category | Definition | Impact | Rules |
| :--- | :--- | :--- | :--- |
| **A. DECISION** | Introduces or modifies business rules, validation, eligibility, or compliance. | **Contract Update Required** | Rigid. Requires non-dev signoff. |
| **B. PROCESS** | Changes sequence, orchestration, workflow, retries, or automation. | **Flow Review Required** | Must verify sequence. |
| **C. DELIVERY** | UI, API, Messaging, Performance, Reports. | **Contracts MUST NOT Change** | Delivery must *never* alter decision behavior. |

---

## 3. Phase 3: Rule Extraction (Freeze vs Flex) (Gate 3)

Every identified rule must be marked.

### 3.1 Classification
*   **🔒 FREEZE (Business Truth):** Rarely changes. Lives in **CODE**.
*   **🔄 FLEX (Configuration):** Changes often. Lives in **DATA/CONFIG**.

### 3.2 Enforcement
*   FLEX items must **NEVER** require a redeploy to change.
*   No configuration values may be hard-coded.
*   **CTO Rule:** "If a change requires redeploy, you froze the wrong thing."

---

## 4. Phase 4: Architecture & Module Definition (Gate 4)

### 4.1 Default Architecture
*   **Modular Monolith** first.
*   **Docker** from Day 1 (Single Container).
*   **Manual deploy first.** (CI/CD only when change frequency demands it).
*   **Microservices** ONLY after proven need.
*   **Tech Selection:** Choose tools that optimize *change speed*, not prestige.

### 4.2 Module Rules
Every module MUST:
1.  Have **ONE** responsibility.
2.  Be **nameable in one sentence**.
3.  Be independent of UI, DB, and Infrastructure (unless explicitly designed as an adapter).

### 4.3 Prohibited Patterns
x  "God Services"
x  Mixed Decision + Execution logic in the same class.
x  Modules that "know too much" about other modules' internals.

---

## 5. Phase 5: Contract-First Development (Gate 5)

**Mandatory:** No core module may be coded without a written `CONTRACT.md`.

### 5.1 Contract Definition
A contract is a written agreement that overrides code. It must define:
1.  **Purpose**: What decision does this module make?
2.  **Inputs**: Facts only. No derived state.
3.  **Outputs**: Explicit decisions/results.
4.  **Rule Evaluation Order**: Step-by-step processing logic.
5.  **Non-Responsibilities**: What this module specifically does *not* do.

### 5.2 Contract Rules
*   Contracts are **FROZEN** before coding begins.
*   Contracts are reviewed by **Non-Developers** (PO/CTO).
*   Contracts are **Versioned**.

---

## 6. Phase 6: AI Usage Policy

### 6.1 Allowed AI Actions
*   Implement modules *inside* frozen contracts.
*   Refactor code *without* behavior change.
*   Write tests.

### 6.2 Strictly Forbidden AI Actions
x  Adding rules "for improvement".
x  Modifying contracts.
x  Guessing requirements.
x  Fetching data unless contract explicitly allows it.

### 6.3 Required Prompt Pattern
All AI prompts must include:
1.  The **Contract**.
2.  Explicit **Constraints**.
3.  Explicit **Confirmation Requirement**.

---

## 7. Phase 7: Code Review & Enforcement

Reviews check for **Contract Adherence**, not just syntax.

### Automatic Rejection Criteria (Red Flags)
*   [ ] Extra validations appear in code that are not in the Contract.
*   [ ] Rule execution order is changed.
*   [ ] Outputs are changed.
*   [ ] Reason codes are altered.
*   [ ] **Hidden Data/Time Fetching:** e.g., `Date.now()` or DB queries inside a decision module. (Time must be an INPUT).
*   [ ] Pricing or UI logic leaks into decision modules.
*   [ ] Logic is moved across module boundaries.

---

## 8. Authority & Accountability

*   **Product Owner / CTO:** Owns Contracts. Final say on business logic.
*   **Developers:** Own correct execution and technical implementation.
*   **"AI did it":** Never an acceptable excuse.

---

## 9. Change Management SOP

Any proposed change must answer:
1.  Is this **Decision**, **Process**, or **Delivery**?
2.  Does it affect a **Contract**?
3.  Does it require **Redeploy**?

**Forbidden Changes:**
*   Silent rule changes.
*   "Small tweaks" in decision logic without contract update.
*   UI-driven rule overrides.

---

## 10. The Developer Checklist (Exit Criteria)

If any box is unchecked, work is **NOT READY**.

### Product Clarity
- [ ] Core business decision is written as one sentence.
- [ ] Feature is classified (Decision/Process/Delivery).
- [ ] If Decision -> Contract updated.
- [ ] If Delivery -> Contract UNCHANGED.

### Freeze vs Flex
- [ ] All business rules identified.
- [ ] FREEZE (Code) vs FLEX (Config) marked.
- [ ] FLEX items do not require redeploy.
- [ ] No hard-coded configuration values.

### Module Discipline
- [ ] Single Responsibility.
- [ ] Name explains decision.
- [ ] No UI leakage.
- [ ] No DB structure leakage.
- [ ] No User Identity leakage.
- [ ] No Pricing/Commission leakage (unless specified).

### Contract & AI
- [ ] Contract exists before coding.
- [ ] Contract reviewed by Non-Dev.
- [ ] AI output explicitly confirmed "No extra behavior added".

### Code Review (Self-Correction)
- [ ] Inputs/Outputs exactly match contract.
- [ ] Reason codes unchanged.
- [ ] Rule evaluation order correct.
- [ ] No DB / API / Time fetching inside decision logic.
- [ ] No Pricing / Messaging / UI logic leakage.

### Safety & Delivery
- [ ] Runs locally.
- [ ] Runs via single Docker container.
- [ ] "This change respects all existing contracts."
- [ ] "No business decision was altered unintentionally."

---

## 11. GOLDEN RULE

> **Working code can be rejected.**
> **Contract-breaking code MUST be rejected.**
