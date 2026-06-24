import { VisitType } from '../entities/visit-type.entity';
import { VisitLog } from '../entities/visit-log.entity';
import { LocationChangeRequest } from '../entities/location-change-request.entity';
import { UserCompanyEntity } from '@libs/users';
import { ContactEntity, ProductContactEntity } from '@libs/contacts';
import { VisitLogEntity } from '../../infrastructure/persistence/entities/visit-log.entity';
import { VisitLogProductDetailEntity } from '../../infrastructure/persistence/entities/visit-log-product-detail.entity';
import { VisitLogDetails } from '../../interfaces/visit-log-details.interface';

export const VISIT_REPOSITORY = 'VISIT_REPOSITORY';

export interface VisitRepositoryPort {
  getVisitTypes(companyId: number): Promise<VisitType[]>;
  getVisitLogs(
    companyId: number,
    productId: number,
    userId: number,
    page: number,
    limit: number,
    visitTypeId?: number,
  ): Promise<{ items: VisitLog[]; total: number }>;
  getVisitLogWithDetails(
    visitLogId: number,
    companyId: number,
  ): Promise<VisitLogDetails | null>;
  findUserCompany(
    companyId: number,
    userId: number,
  ): Promise<UserCompanyEntity | null>;
  checkProduct(companyId: number, productId: number): Promise<boolean>;
  findContact(mobile: string, companyId: number): Promise<ContactEntity | null>;
  findProductContact(
    contactId: number,
    productId: number,
  ): Promise<ProductContactEntity | null>;
  findDuplicateVisitLog(
    contactId: number,
    productId: number,
    datetime: Date | null,
    userId: number,
  ): Promise<VisitLogEntity | null>;
  createVisitLog(data: Partial<VisitLogEntity>): Promise<VisitLogEntity>;
  createVisitLogProductDetails(
    details: Partial<VisitLogProductDetailEntity>[],
  ): Promise<void>;
  countVisitLogs(contactId: number, productId: number): Promise<number>;
  updateProductContactLocation(
    productContactId: number,
    lat: number,
    long: number,
  ): Promise<void>;
  updateVisitLogPrimaryLocation(
    contactId: number,
    productId: number,
    lat: number,
    long: number,
  ): Promise<void>;
  saveSurpriseVisit(
    questionId: number,
    userId: number,
    companyId: number,
    answer: string,
    lat: number,
    long: number,
  ): Promise<void>;
  findVisitLogById(id: number): Promise<VisitLog | null>;
  findPendingLocationChangeRequest(
    contactId: number,
    productId: number,
  ): Promise<LocationChangeRequest | null>;
  findApprovedLocationChangeRequest(
    visitLogId: number,
  ): Promise<LocationChangeRequest | null>;
  findFirstVisitLogId(
    contactId: number,
    productId: number,
  ): Promise<number | null>;
  createLocationChangeRequest(
    data: Partial<LocationChangeRequest>,
  ): Promise<void>;
}
