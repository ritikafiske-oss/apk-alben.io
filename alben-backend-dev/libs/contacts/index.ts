export { CONTACT_REPOSITORY } from './src/domain/ports/contact.repository.port';
export type { ContactRepositoryPort } from './src/domain/ports/contact.repository.port';
export { Contact } from './src/domain/entities/contact.entity';
export { ContactEntity } from './src/infrastructure/persistence/entities/contact.entity';
export { ContactService } from './src/application/contact.service';
export { ProductContactEntity } from './src/infrastructure/persistence/entities/product-contact.entity';
export { UserProductContactEntity } from './src/infrastructure/persistence/entities/user-product-contact.entity';
export { CallLogEntity } from './src/infrastructure/persistence/entities/call-log.entity';
export { ProductContact } from './src/domain/entities/product-contact.entity';
export * from './src/interfaces/contact-status-record.interface';
export * from './src/interfaces/raw-call-log-row.interface';
export * from './src/interfaces/raw-contact-row.interface';
export * from './src/interfaces/raw-contact-detail-row.interface';
export * from './src/interfaces/raw-product-contact-row.interface';
export * from './src/interfaces/raw-attachment-row.interface';
export * from './src/interfaces/raw-visit-log-row.interface';

// Note related interfaces
export * from './src/interfaces/notes/note-object.interface';
export * from './src/interfaces/notes/note-response.interface';
export * from './src/interfaces/notes/raw-note-row.interface';
export { ContactTypeEnum } from './src/ui/dtos/get-contacts.dto';

// Module export moved to bottom to ensure all entities are defined first
export { ContactsModule } from './src/contacts.module';
