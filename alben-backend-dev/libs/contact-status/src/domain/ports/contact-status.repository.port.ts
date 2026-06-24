import { ContactStatus } from '../entities/contact-status.entity';

export const CONTACT_STATUS_REPOSITORY = 'CONTACT_STATUS_REPOSITORY';

export interface ContactStatusRepositoryPort {
  findContactStatuses(companyId: number): Promise<ContactStatus[]>;
  findContactStatusById(id: number): Promise<ContactStatus | null>;
}
