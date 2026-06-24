/**
 * Notification Domain Entity
 *
 * Represents a notification in the business domain layer.
 *
 * @architecture Hexagonal/Clean Architecture - Domain Layer
 */
export class Notification {
  constructor(
    /** Unique notification identifier (primary key) */
    public readonly id: number,

    /** Notification title */
    public readonly title: string,

    /** Notification description (optional) */
    public readonly description: string | null,

    /** Whether the notification has been read */
    public readonly isRead: boolean,

    /** ID of the user receiving the notification (optional) */
    public readonly userId: number | null,

    /** ID of the user who sent/triggered the notification (optional) */
    public readonly sentBy: number | null,

    /** ID of the contact related to this notification (optional) */
    public readonly contactId: number | null,

    /** ID of the single product related to this notification (optional) */
    public readonly productId: number | null,

    /** Comma-separated or JSON list of product IDs (optional) */
    public readonly productIds: string | null,

    /** ID of the single note related to this notification (optional) */
    public readonly noteId: number | null,

    /** Comma-separated or JSON list of note IDs (optional) */
    public readonly noteIds: string | null,

    /** ID of the company related to this notification (optional) */
    public readonly companyId: number | null,

    /** Type of notification (e.g., 'system', 'manual', etc.) */
    public readonly notificationType: string | null,

    /** Timestamp when notification was created */
    public readonly createdAt: Date | null,

    /** Timestamp when notification was last updated */
    public readonly updatedAt: Date | null,
  ) {}
}
