# Features - Notifications Module

## 1. Send SMS
*   **Type:** Delivery
*   **Description:** Sends a transactional/promotional SMS via the configured provider.
*   **Trigger:** Called by other modules (Auth, User, etc.).
*   **Key Logic:** Wrapper around external API.
*   **Status:** Active

## 2. Send Email
*   **Type:** Delivery
*   **Description:** Sends an HTML email via SMTP.
*   **Trigger:** Called by other modules.
*   **Key Logic:** Wrapper around Nodemailer.
*   **Status:** Planned
