# AI Interaction Guide & Standard Prompts

**Purpose:** Use these prompts to ensure every AI interaction (Create, Update, Fix) strictly adheres to the Project Rules.

---

## 🛑 Mandatory Context Files
Always reference these two files at the start of every session or request:
1.  `@[guidelines/CHANGE_PROOF_RULEBOOK.md]` (The Master Logic Rules)
2.  `@[guidelines/MODULE_RULES.md]` (The Coding & Workflow Standards)
3.  `@[guidelines/PROJECT_RULES.md]` (The Project-Wide Tech Stack & Security Rules)

---

## 1. Prompt: Create a New Module
**Use when:** Starting a brand new domain (e.g., "Payment", "Reports").

"You are a senior software engineer working in a production system.

Your task is to IMPLEMENT a new module named `@[libs/module-name]` strictly according to the specification provided below.

====================
NON-NEGOTIABLE RULES
====================

1. You MUST follow the specification exactly.
2. You MUST NOT add new behavior, rules, validations, fields, or assumptions arbitrary.
3. You MUST NOT fetch data, call APIs, access databases, or read environment variables unless explicitly allowed.
4. You MUST NOT add logging, messaging, UI logic, pricing logic, or side effects unless explicitly allowed.
5. If any requirement is ambiguous or missing, you MUST ASK before proceeding.
6. Code must be deterministic, testable, and side-effect free unless specified otherwise.

====================
TASK CONTEXT
====================

I want to create a new module named `@[libs/module-name]`.
Detailed Requirement: [Insert Description]

====================
PROCESS REQUIREMENT (Standard 3-Phase Workflow)
====================

Follow the **Standard 3-Phase Standard Workflow** defined in `@[guidelines/MODULE_RULES.md]`:
1.  **Phase 1:** Create `CONTRACT.md` and `FEATURES.md` first. **STOP** and ask for my approval.
2.  **Phase 2:** After approval, implement the code. STRICTLY follow the style guide (Imports, DocBlocks).
3.  **Phase 3:** detailed audit using `COMPLIANCE_AUDIT.md`.

Refer to `@[guidelines/CHANGE_PROOF_RULEBOOK.md]` for the 11-point Checklist.

====================
SPECIFICATION / CONTRACT
====================

[Paste the FULL contract, spec, or instructions here if already defined, or explicitly state that Phase 1 is to create this.]

====================
IMPLEMENTATION REQUIREMENTS
====================

- Use clear, readable code.
- Prefer simple, boring solutions over clever ones.
- Keep responsibilities limited to this task.
- Do not introduce new dependencies unless approved.
- Follow existing project conventions if provided.

====================
VERIFICATION & SELF-CHECK
====================

After completing each phase, you MUST:
1. Map each part of your implementation back to the specification.
2. Explicitly state: No additional behavior, rules, or interfaces were added.
3. Confirm all non-negotiable rules were followed."

---

## 2. Prompt: Add/Update a Feature
**Use when:** Adding functionality to an existing module (e.g., "Add email notification to Auth").

"You are a senior software engineer working in a production system.

Your task is to MODIFY `@[libs/module-name]` strictly according to the specification provided below.

====================
NON-NEGOTIABLE RULES
====================

1. You MUST follow the specification exactly.
2. You MUST NOT add new behavior, rules, validations, fields, or assumptions.
3. You MUST NOT remove or weaken any existing behavior.
4. You MUST NOT change inputs, outputs, data formats, or interfaces unless explicitly instructed.
5. You MUST NOT change the order of rule execution or processing unless explicitly instructed.
6. You MUST NOT fetch data, call APIs, access databases, or read environment variables unless explicitly allowed.
7. You MUST NOT add logging, messaging, UI logic, pricing logic, or side effects unless explicitly allowed.
8. If any requirement is ambiguous or missing, you MUST ASK before proceeding.
9. Code must be deterministic, testable, and side-effect free unless specified otherwise.

If any of the above rules are violated, the result is considered incorrect even if the code works.

====================
TASK CONTEXT
====================

I want to add a feature to `@[libs/module-name]`: [Insert Feature Description].

====================
PROCESS REQUIREMENT (Change Classification)
====================

Execute this using the **Change Classification** steps from `@[guidelines/CHANGE_PROOF_RULEBOOK.md]`:
1.  Classify this feature (Decision, Process, or Delivery).
2.  **IF DECISION:** Update `CONTRACT.md` first and ask for approval.
3.  **IF PROCESS/DELIVERY:** Update `FEATURES.md` and proceed.
4.  Update the code.
5.  Update `COMPLIANCE_AUDIT.md` to prove no regression.

====================
SPECIFICATION / CONTRACT
====================

[Paste the FULL contract, spec, or instructions here.
If modifying existing code, paste:
- Current behavior summary
- What is allowed to change
- What must remain unchanged]

====================
ALLOWED & FORBIDDEN SCOPE
====================

ALLOWED:
- [Explicitly list what AI may do]

FORBIDDEN:
- [Explicitly list what AI must NOT do]

====================
IMPLEMENTATION REQUIREMENTS
====================

- Use clear, readable code.
- Prefer simple, boring solutions over clever ones.
- Keep responsibilities limited to this task.
- Do not introduce new dependencies unless approved.
- Follow existing project conventions if provided.

====================
VERIFICATION & SELF-CHECK
====================

After completing the task, you MUST:
1. Map each part of your implementation back to the specification.
2. Explicitly state: No additional behavior, rules, or interfaces were added.
3. List anything you deliberately chose NOT to implement and why.
4. Confirm all non-negotiable rules were followed.
Only then present the final output."

---

## 3. Prompt: Bug Fix (Issue Resolution)
**Use when:** Something is broken, and you need a fix without breaking rules.

"I am facing an issue in `@[libs/module-name]`: [Insert Error/Issue].

Please fix this following the **Golden Rule**:
1.  Analyze if this bug violates the existing `CONTRACT.md`.
2.  If the Contract is wrong, propose a Contract Update first (Phase 1).
3.  If the Code is wrong (Contract violation), fix the Code (Phase 2).
4.  **DO NOT** change business logic silently.
5.  Verify the fix against `guidelines/CHANGE_PROOF_RULEBOOK.md`."

---

## 4. Prompt: Refactoring (Code Cleanup)
**Use when:** Cleaning up code, optimizing, or fixing style violations.

"Refactor `@[libs/module-name]` to improve [Readability/Performance/Style].

**Constraints:**
1.  You must NOT change any logic defined in `CONTRACT.md`.
2.  You must NOT change external behavior (Inputs/Outputs).
3.  Ensure strict adherence to `@[guidelines/MODULE_RULES.md]` (Imports, DocBlocks).
4.  Run a final check against `COMPLIANCE_AUDIT.md`."

---

## 5. Prompt: Compliance Self-Check
**Use when:** You suspect a module might be "drifting" or non-compliant.

"Perform a **Compliance Audit** on `@[libs/module-name]`.

1.  Read `@[guidelines/CHANGE_PROOF_RULEBOOK.md]`.
2.  Verify `CONTRACT.md` exists and matches the Code.
3.  Verify `FEATURES.md` covers all code paths.
4.  Check for prohibited patterns (Hidden Logic, Time fetching).
5.  Report any violations."
