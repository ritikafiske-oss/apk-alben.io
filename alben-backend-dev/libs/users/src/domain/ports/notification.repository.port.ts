import { MappedNotification } from '../../interfaces/notification.interface';

/**
 * Notification Repository Port
 *
 * Defines the contract for notification data access.
 */
export interface NotificationRepositoryPort {
  /**
   * Count unread notifications for a user
   */
  countUnread(userId: number): Promise<number>;

  /**
   * Find paginated notifications with relations
   */
  findPaginated(
    userId: number,
    page: number,
    limit: number,
    companyId: number,
  ): Promise<{
    records: MappedNotification[];
    total: number;
    lastPage: number;
  }>;

  /**
   * Find latest pending surprise visit for a user and company
   */
  findLatestPendingSurpriseVisit(
    userId: number,
    companyId: number,
  ): Promise<{
    question_id: number;
    question: string;
    company_id: number;
  } | null>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');
