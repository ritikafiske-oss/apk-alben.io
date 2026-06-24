# Contract - Notifications Module

**Module:** `libs/notifications`
**Version:** 1.0.0
**Status:** DRAFT

## 1. Purpose
The system decides **how to deliver a message (SMS) to a user via an external provider.**

## 2. Inputs (Facts)
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `mobile` | string | Yes (SMS) | 10 digits |
| `message` | string | Yes (SMS) | Non-empty content |
| `templateId` | string | No | Optional DLT Template ID |
| `email` | string | Yes (Email) | Valid email address |
| `subject` | string | Yes (Email) | Non-empty subject |
| `html` | string | Yes (Email) | HTML content |

## 3. Outputs (Decisions)
| Field | Type | Description |
| :--- | :--- | :--- |
| `success` | boolean | True if gateway accepted the request |
| `referenceId` | string | Gateway reference ID / Transaction ID |
| `providerResponse` | any | Raw response for debugging (optional) |

## 4. Dependencies
- External SMS Gateway (BizSMS) via HTTP.
- SMTP Server (Gmail) via Nodemailer.
- `ConfigService` for credentials.

## 5. Rule Evaluation Order
1.  **Validation:** Check if `mobile` and `message` are present.
2.  **Configuration Check:** Verify API credentials exist.
3.  **Delivery:** Send HTTP POST request to Gateway.
4.  **Response handling:** Map gateway response (Success/Failure) to standardized output.

## 6. Non-Responsibilities
- This module DOES NOT decide *when* to send an SMS.
- This module DOES NOT decide *what* the content should be (content is an input).
- This module DOES NOT manage user preferences (opt-in/opt-out is caller's responsibility).
