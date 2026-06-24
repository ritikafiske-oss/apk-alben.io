# Features - Authentication Module

**Module:** `libs/authentication`

## Classification Legend
*   **🔒 CORE (Frozen):** Business Truth. Rigid. Lives in CODE.
*   **🔄 FLEX (Configuration):** Process details. Changeable. Lives in CONFIG.

## Feature List

| ID | Feature | Classification | Notes |
| :--- | :--- | :--- | :--- |
| F1 | Validate 10-digit mobile number | 🔒 CORE | Hard rule for this system. |
| F2 | Authenticate against User Service | 🔒 CORE | Core security logic. |
| F3 | Generate JWT Token | 🔒 CORE | Core security mechanism. |
| F4 | Response Format (Success/Data structure) | 🔒 CORE | Defined by Contract. |
| F5 | Welcome Message format | 🔄 FLEX | "Welcome {name}" template could change. |
| F6 | FCM Token handling | 🔒 CORE | Pass-through / optional input support. |
| F7 | Forgot Password (OTP Generation) | 🔒 CORE | Security flow. |
| F8 | Send OTP via SMS | 🔄 FLEX | Provider can change. |
| F9 | Validate OTP (Reset Password) | 🔒 CORE | Security check. |
| F10 | Update Password & Reset Flag | 🔒 CORE | State change. |
| F11 | Check Active Company Status | 🔒 CORE | Business Rule (Login/Forgot/Reset). |
| F12 | Single Device Login (Token Overwrite) | 🔒 CORE | Security Policy. |
| F13 | Update Last Login Date | 🔒 CORE | Audit requirement. |
| F14 | Mobile Verification OTP | 🔒 CORE | Protected via JWT. |
| F15 | Verify Mobile Status | 🔒 CORE | Protected via JWT. |
| F16 | Restrict Login for All-in-One (Admin) Users | 🔒 CORE | Requires at least one active company with a role other than all_in_one. |
