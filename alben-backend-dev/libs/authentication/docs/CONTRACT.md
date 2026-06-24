# Contract - Authentication Module

**Module:** `libs/authentication`
**Version:** 1.1.0
**Status:** ACTIVE

## 1. Overview
This module handles the core authentication logic, ensuring that only valid users with active company associations can access the system. It manages user login, password recovery, and secure password updates.

## 2. Endpoints & Logic

### 2.1 Login
**Endpoint:** `POST /auth/login`
**Purpose:** Authenticate user credentials and issue a JWT token.

#### Inputs (Facts)
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `mobile` | string | Yes | 10 digits |
| `password` | string | Yes | Non-empty |
| `fcm_token` | string | No | Optional for push notifications |

#### Outputs (Decisions)
| Field | Type | Description |
| :--- | :--- | :--- |
| `success` | boolean | `true` if authentication succeeds |
| `message` | string | "Welcome {FirstName} {LastName}!" |
| `data` | object | User details + JWT Token |

#### Rule Evaluation Order
1.  **Input Validation:** Check mobile format and password presence.
2.  **Credential Check:** Verify mobile and password against `UserService`.
    *   *Failure:* 401 Unauthorized "Invalid mobile number or password."
3.  **Company Status:** Verify user is associated with an `active` company via `UserCompanyRepository`.
    *   *Failure:* 401 Unauthorized "Your account has been disabled..."
4.  **Role Restriction:** Verify the user has at least one active company association where their role is NOT `all_in_one`.
    *   *Failure:* 403 Forbidden `ERR_FORBIDDEN_ROLE` "Admins are not allowed to login."
5.  **Token Generation:** Create JWT with `sub` (userId) and `mobile`.
6.  **Single Device Enforcement:** Store new token in DB, invalidating previous sessions.
7.  **Audit:** Update `last_login_date` in `UserService`.
8.  **Response:** Return strict JSON format with user profile and token.

---

### 2.2 Forgot Password
**Endpoint:** `POST /auth/forgot-password`
**Purpose:** Initiate password reset flow by sending an OTP.

#### Inputs (Facts)
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `mobile` | string | Yes | 10 digits |

#### Outputs (Decisions)
| Field | Type | Description |
| :--- | :--- | :--- |
| `success` | boolean | `true` |
| `message` | string | "OTP sent on your number." |
| `data` | array | Empty array `[]` |

#### Rule Evaluation Order
1.  **Input Validation:** Check mobile format.
2.  **User Existence:** Verify user exists in `UserService`.
    *   *Failure:* 400 BadRequest "We can't find a user with that mobile number."
3.  **Company Status:** Verify user has an `active` company.
    *   *Failure:* 400 BadRequest "Your account has been disabled..."
4.  **OTP Generation:** Generate 6-digit random number.
5.  **OTP Management:**
    *   Expire all previous OTPs for this mobile.
    *   Save new OTP with `status: 'active'`.
6.  **Notification:**
    *   Send SMS via `NotificationsService`.
    *   Send Email (if available).
7.  **Response:** Return success message.

---

### 2.3 Reset Password
**Endpoint:** `POST /auth/reset-password`
**Purpose:** Verify OTP and set a new password.

#### Inputs (Facts)
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `mobile` | string | Yes | 10 digits |
| `otp` | string | Yes | 6 digits |
| `password` | string | Yes | Min 8 chars |
| `confirm_password`| string | Yes | Must match `password` exactly |

#### Outputs (Decisions)
| Field | Type | Description |
| :--- | :--- | :--- |
| `success` | boolean | `true` |
| `message` | string | "Password reset successfully!" |
| `data` | null | `null` |

#### Rule Evaluation Order
1.  **Input Validation:** Check mobile, OTP length, password constraints/match.
2.  **User Existence:** Verify user exists.
    *   *Failure:* 400 BadRequest "We can't find a user with that mobile number."
3.  **Company Status:** Verify active company status.
    *   *Failure:* 400 BadRequest "Your account has been disabled..."
4.  **OTP Verification:** Find active OTP matching mobile & code in `OtpRepository`.
    *   *Failure:* 400 BadRequest "The OTP you entered is incorrect."
5.  **OTP Invalidation:** Mark used OTP as `expired` and `isVerified`.
6.  **Password Update:**
    *   Hash new password (bcrypt).
    *   Update user record via `UserRepository`.
    *   Set `is_reset_password = 1`.
7.  **Response:** Return success message.

---

### 2.4 Generate OTP
**Endpoint:** `POST /auth/generate-otp`
**Purpose:** Send a 6-digit OTP for mobile verification. (Requires JWT Authentication)

#### Inputs (Facts)
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `mobile` | string | Yes | 10 digits |

#### Outputs (Decisions)
| Field | Type | Description |
| :--- | :--- | :--- |
| `success` | boolean | `true` |
| `message` | string | "OTP sent on your number." |

#### Rule Evaluation Order
1.  **Input Validation:** Check mobile format.
2.  **OTP Generation:** Generate 6-digit random number.
3.  **OTP Management:**
    *   Expire all previous OTPs for this mobile.
    *   Save new OTP with `status: 'active'`.
4.  **Notification:**
    *   Send SMS via `NotificationsService` with type `mobile_verification`.
5.  **Response:** Return success message.

---

### 2.5 Verify OTP
**Endpoint:** `POST /auth/verify-otp`
**Purpose:** Verify the 6-digit OTP for mobile verification. (Requires JWT Authentication)

#### Inputs (Facts)
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `mobile` | string | Yes | 10 digits |
| `otp` | string | Yes | 6 digits |

#### Outputs (Decisions)
| Field | Type | Description |
| :--- | :--- | :--- |
| `success` | boolean | `true` |
| `message` | string | "OTP is verified successfully!" |

#### Rule Evaluation Order
1.  **Input Validation:** Check mobile and OTP format.
2.  **OTP Verification:** Find active OTP matching mobile & code in `OtpRepository`.
    *   *Failure:* 400 BadRequest "Enter the correct OTP."
3.  **OTP Verification Status:**
    *   Update `is_verified = 1`.
    *   Save status.
4.  **Response:** Return success message.

---

## 3. Data Schemas

### User Response Object
```json
{
    "id": number,
    "firstname": "string",
    "lastname": "string",
    "mobile": "string",

    "is_reset_password": 0 | 1,
    "token": "string (JWT)"
}
```

## 4. Dependencies
- **Libs/Users:** For user validation, retrieval, and password updates.
- **Libs/Notifications:** For sending SMS and/or Emails.
- **Libs/Common:** For shared decorators (`@Match`, etc) and response DTOs.

## 5. Non-Responsibilities
- This module **DOES NOT** create users (Registration).
- This module **DOES NOT** manage user roles or permissions (Authorization).
- This module **DOES NOT** persist user profile changes (except password & last login).
