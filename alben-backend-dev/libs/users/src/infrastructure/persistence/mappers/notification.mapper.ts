import { Notification } from '../../../domain/notification.entity';
import { MappedNotification } from '../../../interfaces/notification.interface';
import { NotificationEntity } from '../entities/notification.entity';

/**
 * Notification Mapper
 *
 * Translates between domain entities and persistence entities for Notifications.
 *
 * @architecture Hexagonal Architecture - Infrastructure Layer
 */
export class NotificationMapper {
  /**
   * Convert Persistence Entity to Domain Entity
   *
   * @param entity - TypeORM entity from database
   * @returns Domain entity for business logic
   */
  static toDomain(entity: NotificationEntity): Notification {
    return new Notification(
      Number(entity.id),
      entity.title,
      entity.description,
      Boolean(entity.isRead),
      entity.userId ? Number(entity.userId) : null,
      entity.sentBy ? Number(entity.sentBy) : null,
      entity.contactId ? Number(entity.contactId) : null,
      entity.productId ? Number(entity.productId) : null,
      entity.productIds,
      entity.noteId ? Number(entity.noteId) : null,
      entity.noteIds,
      entity.companyId ? Number(entity.companyId) : null,
      entity.notificationType,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  /**
   * Convert Persistence Entity to Mapped Domain Entity (with relations)
   */
  static toMappedDomain(entity: NotificationEntity): MappedNotification {
    const domain = this.toDomain(entity);
    const mapped = domain as MappedNotification;

    mapped.company = entity.company
      ? {
          id: Number(entity.company.id),
          business_name: entity.company.businessName,
          business_logo: entity.company.businessLogo,
        }
      : null;

    mapped.note = entity.note
      ? {
          id: Number(entity.note.id),
          description: entity.note.description,
          reminder_datetime: entity.note.reminderDatetime,
          created_at: entity.note.createdAt,
          for_note: entity.note.forNote,
        }
      : null;

    mapped.product = entity.product
      ? {
          id: Number(entity.product.id),
          name: entity.product.name,
        }
      : null;

    mapped.contact = entity.contact
      ? {
          id: Number(entity.contact.id),
          firstname: entity.contact.firstname,
          lastname: entity.contact.lastname,
          mobile: entity.contact.mobile,
          business_name: entity.contact.businessName,
          designation: entity.contact.designation,
          email: entity.contact.email,
          contact_type: entity.contact.contactType,
        }
      : null;

    mapped.contact_status = null;

    return mapped;
  }

  /**
   * Convert Domain Entity to Persistence Entity
   *
   * @param domain - Domain entity from business logic
   * @returns TypeORM entity for database persistence
   */
  static toPersistence(domain: Notification): NotificationEntity {
    const entity = new NotificationEntity();
    entity.id = domain.id;
    entity.title = domain.title;
    entity.description = domain.description;
    entity.isRead = domain.isRead;
    entity.userId = domain.userId;
    entity.sentBy = domain.sentBy;
    entity.contactId = domain.contactId;
    entity.productId = domain.productId;
    entity.productIds = domain.productIds;
    entity.noteId = domain.noteId;
    entity.noteIds = domain.noteIds;
    entity.companyId = domain.companyId;
    entity.notificationType = domain.notificationType;
    // Timestamps are handled by TypeORM decorators
    return entity;
  }
}
