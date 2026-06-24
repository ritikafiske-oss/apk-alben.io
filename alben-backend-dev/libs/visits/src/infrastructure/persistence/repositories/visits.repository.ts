import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { VisitTypeEntity } from '../entities/visit-type.entity';
import { VisitLogEntity } from '../entities/visit-log.entity';
import { SurpriseVisitEntity } from '../entities/surprise-visit.entity';
import { LocationChangeRequestEntity } from '../entities/location-change-request.entity';
import {
  VisitLogDetails,
  VisitLogProductDetail,
  RawNoteQueryResult,
  LatestNoteDetail,
} from '../../../interfaces/visit-log-details.interface';
import { VisitLogProductDetailEntity } from '../entities/visit-log-product-detail.entity';
import { UserCompanyEntity } from '@libs/users';
import { ContactEntity, ProductContactEntity } from '@libs/contacts';
import { ProductEntity } from '@libs/products';
import { VisitRepositoryPort } from '../../../domain/ports/visit.repository.port';
import { VisitType } from '../../../domain/entities/visit-type.entity';
import { VisitLog } from '../../../domain/entities/visit-log.entity';
import { LocationChangeRequest } from '../../../domain/entities/location-change-request.entity';
import { RawVisitLog } from '../../../interfaces/raw-visit-log.interface';

@Injectable()
export class VisitsRepository implements VisitRepositoryPort {
  constructor(
    @InjectRepository(VisitTypeEntity)
    private readonly visitTypeRepo: Repository<VisitTypeEntity>,
    @InjectRepository(VisitLogEntity)
    private readonly visitLogRepo: Repository<VisitLogEntity>,
    @InjectRepository(SurpriseVisitEntity)
    private readonly surpriseVisitRepo: Repository<SurpriseVisitEntity>,
    @InjectRepository(LocationChangeRequestEntity)
    private readonly locationChangeRequestRepo: Repository<LocationChangeRequestEntity>,
    @InjectRepository(UserCompanyEntity)
    private readonly userCompanyRepo: Repository<UserCompanyEntity>,
    @InjectRepository(ContactEntity)
    private readonly contactRepo: Repository<ContactEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductContactEntity)
    private readonly productContactRepo: Repository<ProductContactEntity>,
    @InjectRepository(VisitLogProductDetailEntity)
    private readonly visitLogProductDetailRepo: Repository<VisitLogProductDetailEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getVisitTypes(companyId: number): Promise<VisitType[]> {
    const entities = await this.visitTypeRepo.find({
      where: { companyId, status: 'active' },
      select: ['id', 'name', 'isNextFollowup', 'colorCode'],
      order: { name: 'ASC' },
    });
    return entities.map(
      (e) => new VisitType(Number(e.id), e.name, e.colorCode, e.isNextFollowup),
    );
  }

  async getVisitLogs(
    companyId: number,
    productId: number,
    userId: number,
    page: number,
    limit: number,
    visitTypeId?: number,
  ): Promise<{ items: VisitLog[]; total: number }> {
    const offset = (page - 1) * limit;

    const qb = this.visitLogRepo
      .createQueryBuilder('vl')
      .select([
        'vl.id AS id',
        'vl.photo AS photo',
        'vl.remark AS remark',
        'vl.datetime AS datetime',
        'vl.latitude AS latitude',
        'vl.longitude AS longitude',
        'vl.visit_type_id AS visitTypeId',
        'vl.contact_id AS contactId',
        'vl.product_id AS productId',
        'vl.user_id AS userId',
        'vl.created_at AS createdAt',
        'vt.id AS vt_id',
        'vt.name AS vt_name',
        'vt.color_code AS vt_colorCode',
        'c.id AS c_id',
        'c.mobile AS c_mobile',
        'c.firstname AS c_firstname',
        'c.lastname AS c_lastname',
      ])
      .leftJoin(VisitTypeEntity, 'vt', 'vt.id = vl.visit_type_id')
      .innerJoin(ContactEntity, 'c', 'c.id = vl.contact_id')
      .where('c.company_id = :companyId', { companyId })
      .andWhere('vl.product_id = :productId', { productId })
      .andWhere('vl.user_id = :userId', { userId });

    if (visitTypeId) {
      qb.andWhere('vl.visit_type_id = :visitTypeId', { visitTypeId });
    }

    qb.addSelect((subQuery) => {
      return subQuery
        .select('approved_status')
        .from(LocationChangeRequestEntity, 'lcr')
        .where('lcr.visit_log_id = vl.id')
        .orderBy('lcr.id', 'DESC')
        .limit(1);
    }, 'change_request_location_status');

    qb.addSelect((subQuery) => {
      return subQuery
        .select('approved_remark')
        .from(LocationChangeRequestEntity, 'lcr')
        .where('lcr.visit_log_id = vl.id')
        .orderBy('lcr.id', 'DESC')
        .limit(1);
    }, 'approved_rejected_remark');

    qb.addSelect((subQuery) => {
      return subQuery
        .select('user_remark')
        .from(LocationChangeRequestEntity, 'lcr')
        .where('lcr.visit_log_id = vl.id')
        .orderBy('lcr.id', 'DESC')
        .limit(1);
    }, 'change_request_location_user_remark');

    qb.orderBy('vl.datetime', 'DESC');

    const total = await qb.getCount();
    const rawItems = await qb
      .offset(offset)
      .limit(limit)
      .getRawMany<RawVisitLog>();

    const items = rawItems.map(
      (raw) =>
        new VisitLog(
          Number(raw.id),
          raw.photo,
          raw.remark,
          raw.datetime,
          raw.visitTypeId ? Number(raw.visitTypeId) : null,
          Number(raw.contactId),
          raw.productId ? Number(raw.productId) : null,
          raw.userId ? Number(raw.userId) : null,
          Number(raw.latitude),
          Number(raw.longitude),
          raw.createdAt,
          raw.change_request_location_status,
          raw.approved_rejected_remark,
          raw.change_request_location_user_remark ?? null,
          {
            id: Number(raw.vt_id),
            name: raw.vt_name,
            color_code: raw.vt_colorCode ?? null,
          },
          {
            id: Number(raw.c_id),
            mobile: raw.c_mobile,
            firstname: raw.c_firstname ?? '',
            lastname: raw.c_lastname ?? '',
          },
        ),
    );

    return { items, total };
  }

  async saveSurpriseVisit(
    questionId: number,
    userId: number,
    companyId: number,
    answer: string,
    lat: number,
    long: number,
  ): Promise<void> {
    await this.surpriseVisitRepo.update(
      { id: questionId, userId, companyId, answer: IsNull() },
      {
        answer,
        submittedAt: new Date(),
        latitude: lat,
        longitude: long,
      },
    );
  }

  async createVisitLog(data: Partial<VisitLogEntity>): Promise<VisitLogEntity> {
    const log = this.visitLogRepo.create(data);
    return await this.visitLogRepo.save(log);
  }

  async createVisitLogProductDetails(
    details: Partial<VisitLogProductDetailEntity>[],
  ): Promise<void> {
    const detailEntities = this.visitLogProductDetailRepo.create(details);
    await this.visitLogProductDetailRepo.save(detailEntities);
  }

  async countVisitLogs(contactId: number, productId: number): Promise<number> {
    return this.visitLogRepo
      .createQueryBuilder('vl')
      .where('vl.contact_id = :contactId', { contactId })
      .andWhere('vl.product_id = :productId', { productId })
      .andWhere('vl.latitude != 0')
      .andWhere('vl.longitude != 0')
      .getCount();
  }

  async findUserCompany(
    companyId: number,
    userId: number,
  ): Promise<UserCompanyEntity | null> {
    return this.userCompanyRepo.findOne({ where: { companyId, userId } });
  }

  async checkProduct(companyId: number, productId: number): Promise<boolean> {
    const product = await this.productRepo.findOne({
      where: { id: productId, companyId },
    });
    return !!product;
  }

  async findContact(
    mobile: string,
    companyId: number,
  ): Promise<ContactEntity | null> {
    return this.contactRepo.findOne({ where: { mobile, companyId } });
  }

  async findProductContact(
    contactId: number,
    productId: number,
  ): Promise<ProductContactEntity | null> {
    return this.productContactRepo.findOne({ where: { contactId, productId } });
  }

  async findDuplicateVisitLog(
    contactId: number,
    productId: number,
    datetime: Date | null,
    userId: number,
  ): Promise<VisitLogEntity | null> {
    return this.visitLogRepo.findOne({
      where: {
        contactId,
        productId,
        datetime: datetime === null ? IsNull() : datetime,
        userId,
      },
      order: { id: 'DESC' },
    });
  }

  async updateProductContactLocation(
    id: number,
    lat: number,
    long: number,
  ): Promise<void> {
    await this.productContactRepo.update(id, {
      latitude: lat,
      longitude: long,
    });
  }

  async updateVisitLogPrimaryLocation(
    contactId: number,
    productId: number,
    lat: number,
    long: number,
  ): Promise<void> {
    await this.visitLogRepo.update(
      { contactId, productId },
      { primaryLatitude: lat, primaryLongitude: long },
    );
  }

  async getVisitLogWithDetails(
    visitLogId: number,
    companyId: number,
  ): Promise<VisitLogDetails | null> {
    const visitLog = await this.visitLogRepo
      .createQueryBuilder('vl')
      .innerJoin(ContactEntity, 'c', 'c.id = vl.contact_id')
      .where('vl.id = :visitLogId', { visitLogId })
      .andWhere('c.company_id = :companyId', { companyId })
      .getOne();

    if (!visitLog) return null;

    const locationChange = await this.locationChangeRequestRepo.findOne({
      where: { visitLogId: visitLogId },
      order: { id: 'DESC' },
    });

    const productDetails = await this.visitLogProductDetailRepo.find({
      where: { visitLogId: visitLogId },
      relations: ['visitType'],
    });

    const products: VisitLogProductDetail[] = [];
    for (const detail of productDetails) {
      const product = await this.productRepo.findOne({
        where: { id: detail.productId },
      });

      const notes = await this.dataSource.query<RawNoteQueryResult[]>(
        `SELECT id, description, created_at 
         FROM notes 
         WHERE visit_log_id = ? AND product_id = ?
         ORDER BY id DESC LIMIT 1`,
        [visitLogId, detail.productId],
      );

      const latestNote: LatestNoteDetail | null =
        notes.length > 0
          ? {
              id: Number(notes[0].id),
              description: notes[0].description,
              created_at: notes[0].created_at,
            }
          : null;

      products.push({
        id: Number(detail.productId),
        name: product?.name || '',
        visit_type: detail.visitType
          ? {
              id: Number(detail.visitType.id),
              name: detail.visitType.name,
              color_code: detail.visitType.colorCode,
            }
          : null,
        latest_note: latestNote,
      });
    }

    return {
      id: Number(visitLog.id),
      photo: visitLog.photo,
      remark: visitLog.remark,
      datetime: visitLog.datetime,
      latitude: visitLog.latitude,
      longitude: visitLog.longitude,
      visit_type_id: visitLog.visitTypeId ? Number(visitLog.visitTypeId) : null,
      contact_id: Number(visitLog.contactId),
      change_request_location_status: locationChange?.approvedStatus || null,
      approved_rejected_remark: locationChange?.approvedRemark || null,
      change_request_location_user_remark: locationChange?.userRemark || null,
      products: products,
    };
  }

  async findVisitLogById(id: number): Promise<VisitLog | null> {
    const log = await this.visitLogRepo.findOne({ where: { id } });
    if (!log) return null;
    return new VisitLog(
      Number(log.id),
      log.photo,
      log.remark,
      log.datetime,
      log.visitTypeId ? Number(log.visitTypeId) : null,
      Number(log.contactId),
      log.productId ? Number(log.productId) : null,
      Number(log.userId),
      Number(log.latitude),
      Number(log.longitude),
      log.createdAt,
    );
  }

  async findPendingLocationChangeRequest(
    contactId: number,
    productId: number,
  ): Promise<LocationChangeRequest | null> {
    const entity = await this.locationChangeRequestRepo
      .createQueryBuilder('lcr')
      .innerJoin('lcr.visitLog', 'vl')
      .where('vl.contact_id = :contactId', { contactId })
      .andWhere('vl.product_id = :productId', { productId })
      .andWhere('lcr.approved_status = :status', { status: 'pending' })
      .orderBy('lcr.id', 'DESC')
      .getOne();

    return entity ? this.mapToDomain(entity) : null;
  }

  async findApprovedLocationChangeRequest(
    visitLogId: number,
  ): Promise<LocationChangeRequest | null> {
    const entity = await this.locationChangeRequestRepo.findOne({
      where: { visitLogId, approvedStatus: 'approved' },
      order: { id: 'DESC' },
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  async findFirstVisitLogId(
    contactId: number,
    productId: number,
  ): Promise<number | null> {
    const log = await this.visitLogRepo.findOne({
      where: { contactId, productId },
      order: { id: 'ASC' },
      select: ['id'],
    });

    return log ? Number(log.id) : null;
  }

  async createLocationChangeRequest(
    data: Partial<LocationChangeRequest>,
  ): Promise<void> {
    const entity = this.locationChangeRequestRepo.create({
      contactId: data.contactId,
      previousVisitLogId: data.previousVisitLogId,
      visitLogId: data.visitLogId,
      userId: data.userId,
      userRemark: data.userRemark,
      approvedStatus: data.approvedStatus || 'pending',
      updatedBy: data.updatedBy,
    });
    await this.locationChangeRequestRepo.save(entity);
  }

  private mapToDomain(
    entity: LocationChangeRequestEntity,
  ): LocationChangeRequest {
    return new LocationChangeRequest(
      Number(entity.id),
      Number(entity.contactId),
      entity.previousVisitLogId ? Number(entity.previousVisitLogId) : null,
      Number(entity.visitLogId),
      Number(entity.userId),
      entity.userRemark,
      entity.approvedStatus,
      entity.approvedBy ? Number(entity.approvedBy) : null,
      entity.approvedRemark,
      entity.approvedDatetime,
      entity.updatedBy ? Number(entity.updatedBy) : null,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
