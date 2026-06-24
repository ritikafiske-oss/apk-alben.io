/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common'; // , Logger
import { DateUtil, DynamicLoggerService } from '@libs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder } from 'typeorm';
import { ContactRepositoryPort } from '../../../domain/ports/contact.repository.port';
import { Contact } from '../../../domain/entities/contact.entity';
import { ContactEntity } from '../entities/contact.entity';
import { ExcludedContact } from '../../../domain/entities/excluded-contact.entity';
import { ExcludedContactEntity } from '../entities/excluded-contact.entity';
import { ProductContactEntity } from '../entities/product-contact.entity';
import { UserProductContactEntity } from '../entities/user-product-contact.entity';
import { AttachmentEntity } from '../entities/attachment.entity';
import { ContactStatusRecord } from '../../../interfaces/contact-status-record.interface';
import { RawContactRow } from '../../../interfaces/raw-contact-row.interface';
import { RawContactDetailRow } from '../../../interfaces/raw-contact-detail-row.interface';
import { RawProductContactRow } from '../../../interfaces/raw-product-contact-row.interface';
import { RawAttachmentRow } from '../../../interfaces/raw-attachment-row.interface';
import { RawCallLogRow } from '../../../interfaces/raw-call-log-row.interface';
import { RawVisitLogRow } from '../../../interfaces/raw-visit-log-row.interface';
import { RawNoteRow } from '../../../interfaces/notes/raw-note-row.interface';
import { GroupedContact } from '../../../interfaces/grouped-contact.interface';
import { RawActionLog } from '../../../interfaces/raw-action-log.interface';
import {
  ActionItem,
  GroupedAction,
} from '../../../interfaces/action-item.interface';

import {
  GetContactsDto,
  ContactTypeEnum,
  FilterByEnum,
  DialTypeEnum,
} from '../../../ui/dtos/get-contacts.dto';
import {
  GetContactsResponseDto,
  ContactProductDto,
} from '../../../ui/dtos/get-contacts-response.dto';
import { ActionTypeEnum } from '../../../ui/dtos/get-action-details-query.dto';
import { GetActionRecentsQueryDto } from '../../../ui/dtos/get-action-recents-query.dto';
import { CheckContactProductResult } from '../../../interfaces/check-contact-product-result.interface';
import { RawCheckContactProductRow } from '../../../interfaces/raw-check-contact-product-row.interface';

@Injectable()
export class ContactRepository implements ContactRepositoryPort {
  // private readonly logger = new Logger(ContactRepository.name);
  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactRepo: Repository<ContactEntity>,
    @InjectRepository(ExcludedContactEntity)
    private readonly excludedContactRepo: Repository<ExcludedContactEntity>,
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepo: Repository<AttachmentEntity>,
    @InjectRepository(ProductContactEntity)
    private readonly productContactRepo: Repository<ProductContactEntity>,
    @InjectRepository(UserProductContactEntity)
    private readonly userProductContactRepo: Repository<UserProductContactEntity>,
    private readonly logger: DynamicLoggerService,
  ) {}

  async findContact(
    mobile: string,
    companyId: number,
  ): Promise<Contact | null> {
    const entity = await this.contactRepo
      .createQueryBuilder('contacts')
      .where('contacts.company_id = :companyId', { companyId })
      .andWhere(
        '(contacts.mobile = :mobile OR contacts.alternate_number LIKE :mobileLike)',
        { mobile, mobileLike: `%${mobile}%` },
      )
      .getOne();

    if (!entity) return null;

    return new Contact(
      Number(entity.id),
      entity.mobile,
      entity.alternateNumber,
      entity.firstname,
      entity.lastname,
      entity.businessName,
      entity.designation,
      entity.email,
      entity.status,
      entity.contactType,
      Number(entity.companyId),
      Number(entity.createdBy),
      entity.referenceByContactId ? Number(entity.referenceByContactId) : null,
      entity.others,
    );
  }

  async findUserProductContact(
    productId: number,
    contactId: number,
    userId: number,
    isService = false,
  ): Promise<UserProductContactEntity | null> {
    return await this.userProductContactRepo.findOne({
      where: { productId, contactId, userId, isService: !!isService },
    });
  }

  async findUserProductContactsByContact(
    contactId: number,
    userId: number,
  ): Promise<UserProductContactEntity[]> {
    return await this.userProductContactRepo.find({
      where: { contactId, userId },
    });
  }

  async getContacts(
    userId: number,
    targetDial: DialTypeEnum,
    dto: GetContactsDto,
  ): Promise<GetContactsResponseDto> {
    const {
      company_id,
      product_id,
      type,
      page = 1,
      limit = 200,
      search,
      start_date,
      end_date,
      filter_by,
      status_id,
    } = dto;

    const qbProductIds = product_id
      ? String(product_id)
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id !== '')
          .map((id) => Number(id))
          .filter((id) => !isNaN(id))
      : [];
    const qbStatusIds = status_id
      ? String(status_id)
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id !== '')
          .map((id) => Number(id))
          .filter((id) => !isNaN(id))
      : [];

    // STEP 1: Fetch paginated contact IDs matching filters
    const qb = this.contactRepo.createQueryBuilder('contacts');
    qb.select('contacts.id', 'id');

    if (type === ContactTypeEnum.CLIENT) {
      qb.innerJoin(
        'user_product_contacts',
        'upc',
        'contacts.id = upc.contact_id',
      );
      qb.innerJoin(
        'products',
        'p',
        'p.id = upc.product_id AND p.company_id = contacts.company_id AND p.deleted_at IS NULL',
      );
      qb.innerJoin(
        'product_contacts',
        'pc',
        'pc.contact_id = upc.contact_id AND pc.product_id = upc.product_id',
      );

      qb.where('upc.user_id = :userId', { userId });
      qb.andWhere('pc.is_hide = 0');
      qb.andWhere('pc.is_service = 0');

      if (qbProductIds.length > 0) {
        qb.andWhere('pc.product_id IN (:...qbProductIds)', { qbProductIds });
      }
      if (qbStatusIds.length > 0) {
        qb.andWhere('pc.contact_status_id IN (:...qbStatusIds)', {
          qbStatusIds,
        });
      }

      if (targetDial !== DialTypeEnum.ALL) {
        if (targetDial === DialTypeEnum.MANUALDIAL) {
          qb.andWhere('upc.is_manualdial = 1');
        } else {
          qb.andWhere('upc.is_autodial = 1');
        }
      }
    } else if (type === ContactTypeEnum.VENDOR) {
      qb.innerJoin('product_contacts', 'pc', 'pc.contact_id = contacts.id');
      qb.leftJoin(
        'department_services',
        'ds',
        'pc.is_service = 1 AND ds.service_id = pc.product_id',
      );
      qb.innerJoin(
        'products',
        'dept',
        'dept.company_id = contacts.company_id AND dept.deleted_at IS NULL AND dept.is_department = 1 AND (' +
          '(pc.is_service = 0 AND dept.id = pc.product_id) OR ' +
          '(pc.is_service = 1 AND dept.id = ds.department_id))',
      );
      qb.innerJoin(
        'user_products',
        'up',
        'up.product_id = dept.id AND up.user_id = :userId',
        { userId },
      );

      qb.where('pc.is_hide = 0');
      if (qbProductIds.length > 0) {
        qb.andWhere(
          `COALESCE(ds.department_id, IF(pc.is_service = 0, pc.product_id, NULL)) IN (SELECT department_id FROM department_services WHERE service_id IN (:...qbProductIds))`,
          { qbProductIds },
        );
      }
      if (qbStatusIds.length > 0) {
        qb.andWhere('pc.contact_status_id IN (:...qbStatusIds)', {
          qbStatusIds,
        });
      }
    } else if (type === ContactTypeEnum.COLLEAGUE) {
      qb.where('contacts.contact_type = :colleagueType', {
        colleagueType: ContactTypeEnum.COLLEAGUE,
      });
    } else {
      // Combined Logic (type is missing)
      qb.leftJoin(
        'user_product_contacts',
        'upc',
        'contacts.id = upc.contact_id AND upc.user_id = :userId',
        { userId },
      );
      qb.leftJoin('product_contacts', 'pc', 'contacts.id = pc.contact_id');
      qb.leftJoin(
        'department_services',
        'ds',
        'pc.is_service = 1 AND ds.service_id = pc.product_id',
      );

      qb.andWhere(
        new Brackets((combined) => {
          // CLIENT
          combined.where(
            new Brackets((c) => {
              c.where('contacts.contact_type = :clientType', {
                clientType: ContactTypeEnum.CLIENT,
              })
                .andWhere('upc.id IS NOT NULL')
                .andWhere('pc.product_id = upc.product_id')
                .andWhere('pc.is_hide = 0')
                .andWhere('pc.is_service = 0');
              if (qbProductIds.length > 0)
                c.andWhere('pc.product_id IN (:...qbProductIds)', {
                  qbProductIds,
                });
              if (qbStatusIds.length > 0)
                c.andWhere('pc.contact_status_id IN (:...qbStatusIds)', {
                  qbStatusIds,
                });

              if (targetDial !== DialTypeEnum.ALL) {
                if (targetDial === DialTypeEnum.MANUALDIAL)
                  c.andWhere('upc.is_manualdial = 1');
                else c.andWhere('upc.is_autodial = 1');
              }
            }),
          );

          // VENDOR
          combined.orWhere(
            new Brackets((v) => {
              v.where('contacts.contact_type = :vendorType', {
                vendorType: ContactTypeEnum.VENDOR,
              })
                .andWhere('pc.id IS NOT NULL')
                .andWhere('pc.is_hide = 0');

              v.andWhere((sq: SelectQueryBuilder<ContactEntity>) => {
                const sub = sq
                  .subQuery()
                  .select('user_products.id')
                  .from('user_products', 'user_products')
                  .innerJoin('products', 'd', 'user_products.product_id = d.id')
                  .where('user_products.user_id = :userId', { userId })
                  .andWhere('d.company_id = :companyId', {
                    companyId: company_id,
                  })
                  .andWhere('d.is_department = 1')
                  .andWhere('d.deleted_at IS NULL')
                  .andWhere(
                    '( (pc.is_service = 0 AND d.id = pc.product_id) OR (pc.is_service = 1 AND d.id = ds.department_id) )',
                  )
                  .getQuery();
                return `EXISTS (${sub})`;
              });

              if (qbProductIds.length > 0)
                v.andWhere(
                  `COALESCE(ds.department_id, IF(pc.is_service = 0, pc.product_id, NULL)) IN (SELECT department_id FROM department_services WHERE service_id IN (:...qbProductIds))`,
                  { qbProductIds },
                );
              if (qbStatusIds.length > 0)
                v.andWhere('pc.contact_status_id IN (:...qbStatusIds)', {
                  qbStatusIds,
                });
            }),
          );

          // COLLEAGUE
          combined.orWhere(
            new Brackets((col) => {
              col.where('contacts.contact_type = :colType', {
                colType: ContactTypeEnum.COLLEAGUE,
              });
            }),
          );
        }),
      );
    }

    if (search) {
      qb.andWhere(
        '(contacts.mobile LIKE :search OR contacts.firstname LIKE :search OR contacts.lastname LIKE :search OR contacts.business_name LIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (start_date && end_date) {
      qb.andWhere('contacts.created_at BETWEEN :startDate AND :endDate', {
        startDate: `${start_date} 00:00:00`,
        endDate: `${end_date} 23:59:59`,
      });
    }

    if (type) {
      qb.andWhere('contacts.contact_type = :type', { type });
    }
    qb.andWhere('contacts.company_id = :companyId', { companyId: company_id });

    // Deduplicate and Order IDs
    qb.groupBy('contacts.id');
    if (filter_by && targetDial != DialTypeEnum.AUTODIAL) {
      qb.orderBy(
        'contacts.firstname',
        filter_by === FilterByEnum.A_Z ? 'ASC' : 'DESC',
      );
    } else if (
      targetDial === DialTypeEnum.AUTODIAL &&
      (!type || type === ContactTypeEnum.CLIENT)
    ) {
      qb.addSelect('MAX(upc.id)', 'max_upc_id');
      qb.orderBy('max_upc_id', 'ASC');
    } else {
      qb.orderBy('contacts.id', 'DESC');
    }

    // Pagination Metadata
    const totalCountQuery = qb.clone();
    totalCountQuery.select('COUNT(DISTINCT contacts.id)', 'count');
    totalCountQuery.groupBy('');
    totalCountQuery.orderBy('');
    const totalCountResult = await totalCountQuery.getRawOne<{
      count: string | number;
    }>();
    const totalItems = Number(totalCountResult?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    qb.limit(limit);
    qb.offset((page - 1) * limit);

    const contactIdsResult = await qb.getRawMany<{ id: string }>();
    const contactIds = contactIdsResult.map((r) => r.id);

    if (contactIds.length === 0) {
      return {
        dial: targetDial,
        current_page: page,
        total_pages: totalPages || 1,
        total_items: 0,
        records: [],
      };
    }

    // STEP 2: Fetch details. Notes explicitly EXCLUDED.
    const detailQb = this.contactRepo.createQueryBuilder('contacts');
    detailQb.select([
      'contacts.id AS id',
      'contacts.firstname AS firstname',
      'contacts.lastname AS lastname',
      'contacts.mobile AS mobile',
      'contacts.business_name AS business_name',
      'contacts.designation AS designation',
      'contacts.email AS email',
      'contacts.alternate_number AS alternate_number',
      'contacts.contact_type AS contact_type',
      'contacts.created_at AS created_at',
    ]);

    if (!type || type !== ContactTypeEnum.COLLEAGUE) {
      detailQb.leftJoin(
        'user_product_contacts',
        'upc',
        'contacts.id = upc.contact_id AND upc.user_id = :userId AND contacts.contact_type = :clientType',
        { userId, clientType: ContactTypeEnum.CLIENT },
      );
      detailQb.leftJoin(
        'product_contacts',
        'pc',
        'pc.contact_id = contacts.id AND (upc.product_id = pc.product_id OR upc.product_id IS NULL) AND (pc.is_service = 0 OR contacts.contact_type = :vendorType) AND contacts.contact_type IN (:clientType, :vendorType)',
        {
          clientType: ContactTypeEnum.CLIENT,
          vendorType: ContactTypeEnum.VENDOR,
        },
      );

      detailQb.leftJoin(
        'products',
        'p',
        'p.id = pc.product_id AND p.company_id = contacts.company_id AND contacts.contact_type = :clientType AND p.deleted_at IS NULL',
        { clientType: ContactTypeEnum.CLIENT },
      );
      detailQb.leftJoin(
        'services',
        's',
        's.id = pc.product_id AND s.company_id = contacts.company_id AND contacts.contact_type = :vendorType AND s.deleted_at IS NULL',
        { vendorType: ContactTypeEnum.VENDOR },
      );

      detailQb.leftJoin(
        'contact_statuses',
        'cs',
        'cs.id = pc.contact_status_id AND cs.company_id = contacts.company_id',
      );

      detailQb.addSelect([
        'upc.is_manualdial AS is_manualdial',
        'upc.is_autodial AS is_autodial',
        'upc.id AS user_product_contact_id',
        'upc.attempts AS attempts',
        'COALESCE(p.id, s.id) AS p_id',
        'COALESCE(p.name, s.name) AS p_name',
        'pc.is_service AS is_service',
        'cs.id AS cs_id',
        'cs.name AS cs_name',
        'cs.color_code AS cs_color_code',
        'cs.is_hide AS cs_is_hide',
        'cs.is_unassigned AS cs_is_unassigned',
        '(SELECT description FROM notes n WHERE n.contact_id = contacts.id AND n.product_id = pc.product_id and description is not null ORDER BY n.id DESC LIMIT 1) AS latest_note',
      ]);
    }

    detailQb.where('contacts.id IN (:...contactIds)', { contactIds });

    if (
      targetDial === DialTypeEnum.AUTODIAL &&
      (!type || type === ContactTypeEnum.CLIENT)
    ) {
      detailQb.orderBy(
        '(SELECT MAX(id) FROM user_product_contacts WHERE contact_id = contacts.id AND user_id = :userId AND is_autodial = 1)',
        'ASC',
      );
    }

    const rawData = await detailQb.getRawMany<RawContactRow>();

    // Step 3: Group by contact ID
    const contactMap = this.mapRawToGrouped(rawData);

    const records = contactIds
      .map((id) => {
        const c = contactMap.get(id);
        if (c) {
          c.type = 'call'; // Default type for getContacts
          return c;
        }
        return null;
      })
      .filter((c): c is GroupedContact => Boolean(c));

    return {
      dial: targetDial,
      current_page: page,
      total_pages: totalPages || 1,
      total_items: totalItems,
      records: records,
    };
  }

  async checkContactExists(
    companyId: number,
    contactId: number,
  ): Promise<boolean> {
    const count = await this.contactRepo.count({
      where: { id: contactId, companyId },
    });
    return count > 0;
  }

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  async checkProductExists(
    companyId: number,
    productId: number,
    isService = false,
  ): Promise<boolean> {
    const table = isService ? 'services' : 'products';
    const result = await this.contactRepo.manager.query(
      `SELECT COUNT(*) as count FROM ${table} WHERE id = ? AND company_id = ? AND deleted_at IS NULL`,
      [productId, companyId],
    );
    return Number(result[0].count) > 0;
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  async getContactDetails(
    userId: number,
    dto: import('../../../ui/dtos/get-contact-details.dto').GetContactDetailsDto,
  ): Promise<unknown> {
    const { contact_id, company_id, type, product_id } = dto;
    const contactType = type;
    const manager = this.contactRepo.manager;

    // 1. Base Contact Query
    const contactRows = await manager.query(
      `SELECT id, firstname, lastname, mobile, business_name, designation, email, alternate_number, contact_type 
       FROM contacts 
       WHERE id = ? AND company_id = ? AND contact_type = ? LIMIT 1`,
      [contact_id, company_id, contactType],
    );
    const contact = contactRows as RawContactDetailRow[];

    if (!contact || contact.length === 0) {
      return null;
    }
    const c = contact[0];

    // 2. Fetch Product Contact (if applicable)
    let product: unknown = null;
    let contactStatus: unknown = null;
    let primaryLocation: unknown = null;

    if (contactType !== ContactTypeEnum.COLLEAGUE && product_id) {
      const table =
        contactType === ContactTypeEnum.VENDOR ? 'services' : 'products';
      const pcRowsQuery = await manager.query(
        `SELECT pc.id, pc.product_id, pc.is_service, pc.contact_id, pc.contact_status_id, pc.latitude, pc.longitude,
                p.id as p_id, p.name as p_name,
                cs.id as cs_id, cs.name as cs_name, cs.color_code as cs_color_code
         FROM product_contacts pc
         INNER JOIN ${table} p ON pc.product_id = p.id AND p.company_id = ?
         INNER JOIN contact_statuses cs ON pc.contact_status_id = cs.id AND cs.company_id = ?
         WHERE pc.contact_id = ? AND pc.product_id = ? AND pc.is_service = ? LIMIT 1`,
        [
          company_id,
          company_id,
          contact_id,
          product_id,
          contactType === ContactTypeEnum.VENDOR ? 1 : 0,
        ],
      );
      const pcRows = pcRowsQuery as RawProductContactRow[];
      if (pcRows.length > 0) {
        const pc = pcRows[0];
        product = { id: pc.p_id, name: pc.p_name };
        contactStatus = {
          id: pc.cs_id,
          name: pc.cs_name,
          color_code: pc.cs_color_code,
        };

        if (
          pc.latitude !== '0' &&
          pc.longitude !== '0' &&
          pc.latitude !== null &&
          pc.longitude !== null
        ) {
          primaryLocation = {
            latitude: Number(pc.latitude),
            longitude: Number(pc.longitude),
          };
        }
      }
    }

    // Prepare condition strings for relations
    const isServiceValue = contactType === ContactTypeEnum.VENDOR ? 1 : 0;
    const conditions = ['contact_id = ?'];
    let joinSql = '';

    if (contactType === ContactTypeEnum.COLLEAGUE) {
      conditions.push('user_id = ?');
    } else if (product_id) {
      conditions.push(
        '(base.product_id = ? OR base.product_id = 0 OR base.product_id IS NULL)',
      );
      // Parameter order must match query structure: Join parameters come BEFORE WHERE parameters
      joinSql = `LEFT JOIN product_contacts pc_filter ON pc_filter.contact_id = base.contact_id AND pc_filter.product_id = base.product_id AND pc_filter.is_service = ?`;
    }

    const getQuery = (
      table: string,
      alias: string,
      selectFields: string,
      extraJoins = '',
      extraJoinParams: unknown[] = [],
      overrideJoinSql?: string,
      overrideConditions?: string[],
      forceWhereProductId?: boolean,
    ) => {
      const baseAlias = alias || table;
      const finalJoinSql = (overrideJoinSql ?? joinSql).replace(
        /base/g,
        baseAlias,
      );
      const finalConditions = overrideConditions || conditions;
      const whereClause = finalConditions
        .map((c) =>
          c.includes('base.')
            ? c.replace(/base\./g, `${baseAlias}.`)
            : `${baseAlias}.${c}`,
        )
        .join(' AND ');

      const query = `SELECT ${selectFields} FROM ${table} ${alias} ${finalJoinSql} ${extraJoins} WHERE ${whereClause}`;

      const finalParams: unknown[] = [];
      if (contactType === ContactTypeEnum.COLLEAGUE) {
        finalParams.push(...extraJoinParams);
        finalParams.push(contact_id, userId);
      } else {
        if (product_id) {
          if (overrideJoinSql !== undefined) {
            if (overrideJoinSql !== '') {
              finalParams.push(product_id, isServiceValue);
            }
          } else {
            finalParams.push(isServiceValue);
          }
        }
        finalParams.push(...extraJoinParams);
        finalParams.push(contact_id);

        if (product_id && (!overrideConditions || forceWhereProductId)) {
          finalParams.push(product_id);
        }
      }

      return { query, finalParams };
    };

    // 3. Fetch Notes & Important Notes
    const notesData = getQuery(
      'notes',
      'n',
      `n.id, n.description, n.reminder_datetime, n.created_at, n.user_id, n.for_note,
       n.call_log_id, n.visit_log_id,
       IF(inote.id IS NOT NULL, 1, 0) as is_important,
       u.id as u_id, u.firstname as u_firstname, u.lastname as u_lastname`,
      `LEFT JOIN important_notes inote ON n.id = inote.note_id
       LEFT JOIN users u ON n.user_id = u.id`,
    );

    this.logger.log(
      { query: notesData.query, params: notesData.finalParams },
      'debug',
    );

    const rawNotesQuery = await manager.query(
      notesData.query,
      notesData.finalParams,
    );
    const rawNotes = rawNotesQuery as RawNoteRow[];

    const notes = rawNotes.map((n) => ({
      id: Number(n.id),
      description: n.description,
      reminder_datetime: n.reminder_datetime
        ? DateUtil.getDateTimeAccordingTimezone(
            n.reminder_datetime,
            'UTC',
            'Asia/Kolkata',
            'YYYY-MM-DD HH:mm:ss',
          )
        : null,
      created_at: n.created_at,
      user_id: Number(n.user_id),
      for_note: n.for_note,
      call_log_id: n.call_log_id ? Number(n.call_log_id) : 0,
      visit_log_id: n.visit_log_id ? Number(n.visit_log_id) : 0,
      is_important: Boolean(Number(n.is_important)),
      created_by: n.u_id
        ? {
            id: Number(n.u_id),
            firstname: n.u_firstname || '',
            lastname: n.u_lastname || '',
          }
        : null,
    }));

    // 4. Fetch Attachments
    const attachmentsData = getQuery(
      'attachments',
      'a',
      'a.id, a.title, a.url, a.created_at, a.updated_at',
    );

    this.logger.log(
      { query: attachmentsData.query, params: attachmentsData.finalParams },
      'debug',
    );

    const rawAttachmentsQuery = await manager.query(
      attachmentsData.query,
      attachmentsData.finalParams,
    );
    const rawAttachments = rawAttachmentsQuery as RawAttachmentRow[];
    const attachments = rawAttachments.map((a) => ({
      ...a,
      id: Number(a.id),
    }));

    // 5. Fetch Call Logs (Split into Specific and General)
    const callLogsFields = `cl.id, cl.mobile, cl.start_call_at, cl.duration, cl.status, cl.type, cl.recording_url, cl.contact_id, n.id as note_id, cl.created_at,
       n.description as note_description, n.reminder_datetime as note_reminder_datetime,
       nu.firstname as note_u_firstname, nu.lastname as note_u_lastname`;

    let rawCallLogs: RawCallLogRow[] = [];

    if (product_id) {
      // Query 1: Specific Product Call Logs (With Joins)
      const specificData = getQuery(
        'call_logs',
        'cl',
        callLogsFields,
        `LEFT JOIN notes n ON cl.id = n.call_log_id AND n.product_id = pc_filter.product_id
         LEFT JOIN users nu ON n.user_id = nu.id`,
        [],
        `LEFT JOIN product_contacts pc_filter ON pc_filter.contact_id = base.contact_id AND pc_filter.product_id = ? AND pc_filter.is_service = ?`,
        [
          'contact_id = ?',
          'base.product_id != 0',
          'base.product_id IS NOT NULL',
        ],
        false,
      );

      // Query 2: General Call Logs (Without Joins)
      const generalData = getQuery(
        'call_logs',
        'cl',
        `cl.id, cl.mobile, cl.start_call_at, cl.duration, cl.status, cl.type, cl.recording_url, cl.contact_id, 
         NULL as note_id, cl.created_at, NULL as note_description, NULL as note_reminder_datetime,
         NULL as note_u_firstname, NULL as note_u_lastname`,
        '',
        [],
        '', // Explicitly no product join
        ['contact_id = ?', '(base.product_id = 0 OR base.product_id IS NULL)'],
      );

      const [resSpecific, resGeneral] = await Promise.all([
        manager.query(specificData.query, specificData.finalParams),
        manager.query(generalData.query, generalData.finalParams),
      ]);
      rawCallLogs = [
        ...(resSpecific as RawCallLogRow[]),
        ...(resGeneral as RawCallLogRow[]),
      ];
    } else {
      const callLogsData = getQuery(
        'call_logs',
        'cl',
        callLogsFields,
        `LEFT JOIN notes n ON cl.id = n.call_log_id
         LEFT JOIN users nu ON n.user_id = nu.id`,
      );
      const results = await manager.query(
        callLogsData.query,
        callLogsData.finalParams,
      );
      rawCallLogs = results as RawCallLogRow[];
    }

    const callLogs = rawCallLogs.map((cl) => ({
      id: Number(cl.id),
      mobile: cl.mobile,
      start_call_at: cl.start_call_at,
      duration: cl.duration,
      status: cl.status,
      type: cl.type,
      recording_url: cl.recording_url,
      contact_id: Number(cl.contact_id),
      note_id: cl.note_id ? Number(cl.note_id) : null,
      created_at: cl.created_at,
      note: cl.note_id
        ? {
            id: Number(cl.note_id),
            description: cl.note_description,
            reminder_datetime: cl.note_reminder_datetime
              ? DateUtil.getDateTimeAccordingTimezone(
                  cl.note_reminder_datetime,
                  'UTC',
                  'Asia/Kolkata',
                  'YYYY-MM-DD HH:mm:ss',
                )
              : null,
            created_by:
              `${cl.note_u_firstname || ''} ${cl.note_u_lastname || ''}`.trim() ||
              null,
          }
        : null,
    }));

    // 6. Fetch Visit Logs & Location Change Requests Map
    const visitLogsData = getQuery(
      'visit_logs',
      'v',
      `v.id, v.photo, v.remark, v.datetime, v.visit_type_id, v.contact_id, v.created_at,
       v.latitude, v.longitude, v.primary_latitude, v.primary_longitude,
       vt.name as vt_name, vt.color_code as vt_color_code,
       (SELECT approved_status FROM location_change_requests lcr WHERE lcr.visit_log_id = v.id ORDER BY lcr.id DESC LIMIT 1) AS change_request_location_status,
       (SELECT approved_remark FROM location_change_requests lcr WHERE lcr.visit_log_id = v.id ORDER BY lcr.id DESC LIMIT 1) AS approved_rejected_remark,
       (SELECT user_remark FROM location_change_requests lcr WHERE lcr.visit_log_id = v.id ORDER BY lcr.id DESC LIMIT 1) AS change_request_location_user_remark`,
      `LEFT JOIN visit_types vt ON v.visit_type_id = vt.id AND vt.company_id = ?`,
      [company_id],
    );

    this.logger.log(
      { query: visitLogsData.query, params: visitLogsData.finalParams },
      'debug',
    );

    // this.logger.log(`Visit Logs Query: ${visitLogsData.query}`);
    // this.logger.log(
    //   `Visit Logs Params: ${JSON.stringify(visitLogsData.finalParams)}`,
    // );

    const rawVisitLogsQuery = await manager.query(
      visitLogsData.query,
      visitLogsData.finalParams,
    );
    const rawVisitLogs = rawVisitLogsQuery as RawVisitLogRow[];

    // Check if there's any pending location change request for this contact
    const pendingRequests = await manager.query(
      `SELECT id FROM location_change_requests WHERE contact_id = ? AND approved_status = 'pending' LIMIT 1`,
      [contact_id],
    );
    const hasPendingLocationChangeRequest = pendingRequests.length > 0;

    const visits = rawVisitLogs.map((v) => {
      let cr_status = v.change_request_location_status;
      let cr_remark = v.approved_rejected_remark;

      if (hasPendingLocationChangeRequest) {
        if (cr_status == null || ['rejected', 'pending'].includes(cr_status)) {
          cr_status = 'pending';
          cr_remark = 'Location change request is already submitted.';
        }
      }

      return {
        id: Number(v.id),
        photo: v.photo,
        remark: v.remark,
        datetime: v.datetime,
        visit_type_id: Number(v.visit_type_id),
        contact_id: Number(v.contact_id),
        change_request_location_status: cr_status,
        approved_rejected_remark: cr_remark,
        change_request_location_user_remark:
          v.change_request_location_user_remark,
        created_at: v.created_at,
        latitude: v.latitude ? Number(v.latitude) : 0,
        longitude: v.longitude ? Number(v.longitude) : 0,
        primary_latitude: v.primary_latitude ? Number(v.primary_latitude) : 0,
        primary_longitude: v.primary_longitude
          ? Number(v.primary_longitude)
          : 0,
        visit_type: v.visit_type_id
          ? {
              id: Number(v.visit_type_id),
              name: v.vt_name,
              color_code: v.vt_color_code,
            }
          : null,
      };
    });

    // 7. Merge activity logs
    const activityLogs = [
      ...notes
        .filter(
          (n) =>
            (!n.call_log_id || Number(n.call_log_id) === 0) &&
            n.for_note === 'others',
        )
        .map((n) => {
          const { call_log_id, visit_log_id, ...rest } = n;
          return {
            ...rest,
            action_id:
              call_log_id && Number(call_log_id) !== 0
                ? Number(call_log_id)
                : visit_log_id && Number(visit_log_id) !== 0
                  ? Number(visit_log_id)
                  : 0,
            activity_date: n.created_at,
            type: n.is_important ? 'important_notes' : 'notes',
          };
        }),
      ...visits.map((v) => ({
        ...v,
        action_id: v.id || 0,
        activity_date: v.datetime,
        type: 'visits',
      })),
      ...callLogs.map((cl) => ({
        ...cl,
        action_id: cl.id || 0,
        activity_date: cl.start_call_at,
        type: 'calls',
        call_type: cl.type,
      })),
    ];

    // 8. Sorting logic: Important notes on top (DESC by date), then others (DESC by date)
    activityLogs.sort((a, b) => {
      // const typeA = a.type === 'important_notes' ? 1 : 0;
      // const typeB = b.type === 'important_notes' ? 1 : 0;

      // if (typeA !== typeB) {
      //   return typeB - typeA; // Important notes first
      // }

      // Within each category, sort by activity_date DESC
      const dateA = new Date(a.activity_date || 0).getTime();
      const dateB = new Date(b.activity_date || 0).getTime();
      return dateB - dateA;
    });

    // Formatting activity_date to IST after sorting
    activityLogs.forEach((log) => {
      if (log.activity_date) {
        log.activity_date = DateUtil.getDateTimeAccordingTimezone(
          log.activity_date,
          'UTC',
          'Asia/Kolkata',
          'YYYY-MM-DD HH:mm:ss',
        );
      }
    });

    // Fetch Overall Last Contact Date (received status)
    const lastCall = await manager.query<{ start_call_at: Date }[]>(
      `SELECT start_call_at FROM call_logs 
       WHERE contact_id = ? AND status = 'received' 
       ORDER BY start_call_at DESC LIMIT 1`,
      [contact_id],
    );

    const last_contact_date =
      lastCall.length > 0
        ? DateUtil.getDateTimeAccordingTimezone(
            lastCall[0].start_call_at,
            'UTC',
            'Asia/Kolkata',
            'YYYY-MM-DD',
          )
        : null;

    // Fetch Overall Latest Reminder Date
    const lastNote = await manager.query<{ reminder_datetime: Date }[]>(
      `SELECT reminder_datetime FROM notes 
       WHERE contact_id = ? AND reminder_datetime IS NOT NULL 
       ORDER BY reminder_datetime DESC LIMIT 1`,
      [contact_id],
    );

    const reminder_date =
      lastNote.length > 0
        ? DateUtil.getDateTimeAccordingTimezone(
            lastNote[0].reminder_datetime,
            'UTC',
            'Asia/Kolkata',
            'YYYY-MM-DD',
          )
        : null;

    return {
      id: Number(c.id),
      firstname: c.firstname,
      lastname: c.lastname || '',
      mobile: c.mobile,
      business_name: c.business_name || '',
      designation: c.designation,
      primary_location: primaryLocation,
      email: c.email,
      alternate_number: c.alternate_number,
      contact_type: c.contact_type,
      product,
      reminder_date,
      last_contact_date,
      contact_status: contactStatus,
      // important_notes: importantNotes.map((n) => {
      //   const rest = { ...n };
      //   delete (rest as { call_log_id?: unknown }).call_log_id;
      //   return rest;
      // }),
      // notes: notes.map(({ call_log_id, ...rest }) => rest),
      attachments,
      // visits,
      // call_logs: callLogs,
      activity_logs: activityLogs,
    };
  }

  async checkContactStatus(
    companyId: number,
    statusId: number,
  ): Promise<boolean> {
    const res = await this.contactRepo.manager.query(
      'SELECT id FROM contact_statuses WHERE id = ? AND company_id = ? LIMIT 1',
      [statusId, companyId],
    );
    return res.length > 0;
  }

  async findContactStatus(
    companyId: number,
    statusId: number,
  ): Promise<ContactStatusRecord | null> {
    return await this.contactRepo.manager
      .query(
        'SELECT * FROM contact_statuses WHERE id = ? AND company_id = ? LIMIT 1',
        [statusId, companyId],
      )
      .then((res) => res[0] || null);
  }

  async findContactStatusesByCompany(companyId: number): Promise<unknown[]> {
    return await this.contactRepo.manager.query(
      'SELECT * FROM contact_statuses WHERE company_id = ?',
      [companyId],
    );
  }

  async createContact(data: Partial<ContactEntity>): Promise<ContactEntity> {
    const entity = this.contactRepo.create(data);
    return await this.contactRepo.save(entity);
  }

  async createProductContact(
    data: Partial<ProductContactEntity>,
  ): Promise<ProductContactEntity> {
    const entity = this.productContactRepo.create({
      ...data,
      attempts: data.attempts ?? 0,
      isHide: data.isHide ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.productContactRepo.save(entity);
  }

  async findProductContact(
    productId: number,
    contactId: number,
    isService = false,
  ): Promise<ProductContactEntity | null> {
    const isServiceValue = isService ? 1 : 0;
    const res = await this.contactRepo.manager.query(
      'SELECT id, product_id as productId, is_service as isService, contact_id as contactId, contact_status_id as contactStatusId FROM product_contacts WHERE product_id = ? AND contact_id = ? AND is_service = ? LIMIT 1',
      [productId, contactId, isServiceValue],
    );
    return res[0] || null;
  }

  async findProductContactById(
    id: number,
  ): Promise<ProductContactEntity | null> {
    const res = await this.contactRepo.manager.query(
      'SELECT id, product_id as productId, is_service as isService, contact_id as contactId, contact_status_id as contactStatusId FROM product_contacts WHERE id = ? LIMIT 1',
      [id],
    );
    return res[0] || null;
  }

  async updateProductContactStatus(
    id: number,
    statusId: number,
    isHide?: number,
    isService = false,
  ): Promise<void> {
    const isServiceValue = isService ? 1 : 0;
    if (isHide !== undefined) {
      await this.contactRepo.manager.query(
        'UPDATE product_contacts SET contact_status_id = ?, is_hide = ? WHERE id = ? AND is_service = ?',
        [statusId, isHide, id, isServiceValue],
      );
    } else {
      await this.contactRepo.manager.query(
        'UPDATE product_contacts SET contact_status_id = ? WHERE id = ? AND is_service = ?',
        [statusId, id, isServiceValue],
      );
    }
  }

  async updateProductContact(
    id: number,
    data: Partial<ProductContactEntity>,
  ): Promise<void> {
    await this.productContactRepo.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }

  async createUserProductContact(
    data: Partial<UserProductContactEntity>,
  ): Promise<UserProductContactEntity> {
    const entity = this.userProductContactRepo.create({
      ...data,
      attempts: data.attempts ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.userProductContactRepo.save(entity);
  }

  async deleteUserProductContact(
    productId: number,
    contactId: number,
    userId: number,
    isService = false,
  ): Promise<void> {
    await this.userProductContactRepo.delete({
      productId,
      contactId,
      userId,
      isService: !!isService,
    });
  }

  async updateUserProductContact(
    id: number,
    data: Partial<UserProductContactEntity>,
  ): Promise<void> {
    await this.userProductContactRepo.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }

  async findLastProductContact(
    contactId: number,
  ): Promise<ProductContactEntity | null> {
    return await this.productContactRepo.findOne({
      where: { contactId },
      order: { createdAt: 'DESC' },
    });
  }

  async findContactById(
    companyId: number,
    contactId: number,
  ): Promise<ContactEntity | null> {
    return await this.contactRepo.findOne({
      where: { id: contactId, companyId },
    });
  }

  async findContactByIdWithoutCompany(
    contactId: number,
  ): Promise<ContactEntity | null> {
    return await this.contactRepo.findOne({
      where: { id: contactId },
    });
  }

  async updateContact(id: number, data: Partial<ContactEntity>): Promise<void> {
    await this.contactRepo.update(id, data);
  }

  async findExcludedContact(
    mobile: string,
    userId: number,
  ): Promise<ExcludedContact | null> {
    const entity = await this.excludedContactRepo.findOne({
      where: { mobile, userId },
    });
    if (!entity) return null;

    return new ExcludedContact(
      Number(entity.id),
      entity.name,
      entity.mobile,
      Number(entity.userId),
      entity.type,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async saveAttachment(
    data: Partial<AttachmentEntity>,
  ): Promise<AttachmentEntity> {
    const newAttachment = this.attachmentRepo.create(data);
    return await this.attachmentRepo.save(newAttachment);
  }

  async countUserProductContacts(
    productId: number,
    contactId: number,
    isService = false,
  ): Promise<number> {
    return await this.userProductContactRepo.count({
      where: { productId, contactId, isService: !!isService },
    });
  }

  async getActionDetails(
    userId: number,
    dto: import('../../../ui/dtos/get-action-details-query.dto').GetActionDetailsQueryDto,
  ): Promise<GetContactsResponseDto> {
    const { company_id, action_type, page = 1, limit = 200 } = dto;

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    let totalItems = 0;
    let totalPages = 0;
    let actions: ActionItem[] = [];
    let contactIds: string[] = [];

    const qb = this.contactRepo.createQueryBuilder('contacts');
    qb.select('contacts.id', 'id');

    if (action_type === ActionTypeEnum.MY_PLAN) {
      // 1. Fetch from user_product_contacts where is_my_plan = 1
      const upcQb = this.userProductContactRepo
        .createQueryBuilder('upc')
        .select([
          'upc.contact_id as contact_id',
          'upc.created_at as time',
          'upc.product_id as product_id',
          'upc.is_service as is_service',
          'upc.id as upc_id',
        ])
        .innerJoin('contacts', 'c', 'c.id = upc.contact_id')
        .where('upc.user_id = :userId', { userId })
        .andWhere('c.company_id = :companyId', { companyId: company_id })
        .andWhere('upc.is_my_plan = :isMyPlan', { isMyPlan: true })
        .andWhere('c.deleted_at IS NULL');

      const upcResults = await upcQb.getRawMany<{
        contact_id: string;
        time: string;
        product_id: string;
        is_service: string | number;
        upc_id: string;
      }>();
      const upcMapped = upcResults.map((r) => ({
        id: r.contact_id,
        time: r.time,
        type: 'call',
        data_from: 'call',
        call_or_note_id: Number(r.upc_id),
        note_description: null,
        productId: Number(r.product_id),
        isService: Boolean(Number(r.is_service)),
      }));

      // 2. Fetch from notes where is_my_plan = 1 AND is_done = 0
      const notesQb = this.contactRepo.manager
        .createQueryBuilder('notes', 'n')
        .select([
          'n.contact_id as contact_id',
          'n.created_at as time',
          'n.for_note as for_note',
          'n.description as note_description',
          'n.product_id as product_id',
          'pc.is_service as is_service',
          'n.id as note_id',
        ])
        .innerJoin('contacts', 'c', 'c.id = n.contact_id')
        .innerJoin(
          'product_contacts',
          'pc',
          'n.contact_id = pc.contact_id AND n.product_id = pc.product_id AND pc.is_service = IF(c.contact_type = :vendorType, 1, 0)',
          { vendorType: ContactTypeEnum.VENDOR },
        )
        .where('n.user_id = :userId', { userId })
        .andWhere('c.company_id = :companyId', { companyId: company_id })
        .andWhere('n.is_my_plan = :isMyPlan', { isMyPlan: true })
        .andWhere('n.is_done = :isDone', { isDone: false })
        .andWhere('c.deleted_at IS NULL');

      const notesResults = await notesQb.getRawMany<{
        contact_id: string;
        time: string;
        for_note: string;
        note_description: string;
        product_id: string;
        is_service: string | number;
        note_id: string;
      }>();
      const notesMapped = notesResults.map((r) => ({
        id: r.contact_id,
        time: r.time,
        type: r.for_note === 'others' ? 'call' : r.for_note,
        data_from: 'notes',
        call_or_note_id: Number(r.note_id),
        note_description: r.note_description,
        productId: Number(r.product_id),
        isService: Boolean(Number(r.is_service)),
      }));

      const combined = [...upcMapped, ...notesMapped];
      combined.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );

      // Deduplicate by contact id
      const grouped = combined.reduce((acc, curr) => {
        const idKey = String(curr.id);
        const existing = acc.get(idKey);
        if (existing) {
          existing.actionProducts.push({
            productId: curr.productId,
            isService: curr.isService,
          });
          // For MY_PLAN, keep the most recent time and its associated note
          if (
            curr.time &&
            existing.time &&
            new Date(curr.time).getTime() > new Date(existing.time).getTime()
          ) {
            existing.time = curr.time;
            existing.note = curr.note_description || existing.note;
            existing.note_description =
              curr.note_description || existing.note_description;
            existing.call_or_note_id = curr.call_or_note_id;
            existing.type = curr.type;
            existing.data_from = curr.data_from;
          }
        } else {
          acc.set(idKey, {
            ...curr,
            note: curr.note_description,
            actionProducts: [
              { productId: curr.productId, isService: curr.isService },
            ],
          });
        }
        return acc;
      }, new Map<string, GroupedAction>());

      const uniqueCombined = Array.from(grouped.values());
      uniqueCombined.sort((a, b) => {
        const timeA = a.time ? new Date(a.time).getTime() : 0;
        const timeB = b.time ? new Date(b.time).getTime() : 0;
        return timeA - timeB;
      });

      totalItems = uniqueCombined.length;
      totalPages = Math.ceil(totalItems / limit);
      const paginated = uniqueCombined.slice((page - 1) * limit, page * limit);
      contactIds = paginated.map((p) => p.id);

      if (contactIds.length === 0) {
        return {
          dial: 'manualdial',
          current_page: page,
          total_pages: totalPages || 1,
          total_items: 0,
          records: [],
        };
      }

      actions = paginated.map((p) => ({
        id: p.id,
        time: p.time,
        note: p.note_description,
        type: p.type,
        data_from: p.data_from,
        call_or_note_id: p.call_or_note_id,
        actionProducts: p.actionProducts,
      }));
    } else {
      if (action_type === ActionTypeEnum.NEW) {
        qb.innerJoin(
          'user_product_contacts',
          'upc',
          'contacts.id = upc.contact_id',
        );
        qb.where('upc.user_id = :userId', { userId });
        qb.andWhere('upc.is_newly_assigned = :isNewlyAssigned', {
          isNewlyAssigned: true,
        });
        qb.andWhere('upc.is_my_plan = :isMyPlan', { isMyPlan: false });
        qb.andWhere('upc.called_at IS NULL');
      } else if (
        action_type === ActionTypeEnum.REMINDER ||
        action_type === ActionTypeEnum.OVERDUE
      ) {
        qb.innerJoin('notes', 'n', 'n.contact_id = contacts.id');
        qb.innerJoin(
          'product_contacts',
          'pc',
          'n.contact_id = pc.contact_id AND n.product_id = pc.product_id AND pc.is_service = IF(contacts.contact_type = :vendorType, 1, 0)',
          { vendorType: ContactTypeEnum.VENDOR },
        );
        qb.where('n.user_id = :userId', { userId });
        qb.andWhere('n.is_done = :isDone', { isDone: false });
        if (action_type === ActionTypeEnum.REMINDER) {
          qb.andWhere('n.reminder_datetime >= :todayStart', { todayStart });
        } else {
          qb.andWhere('n.reminder_datetime < :todayStart', { todayStart });
        }
        qb.andWhere('n.is_my_plan = :isMyPlan', { isMyPlan: false });
      }

      qb.andWhere('contacts.company_id = :companyId', {
        companyId: company_id,
      });
      qb.andWhere('contacts.deleted_at IS NULL');

      qb.groupBy('contacts.id');
      if (action_type === ActionTypeEnum.NEW) {
        qb.addSelect('MIN(upc.created_at)', 'max_time');
        qb.addSelect(
          "GROUP_CONCAT(CONCAT(upc.product_id, ':', upc.is_service))",
          'action_products_agg',
        );
        qb.addSelect('MIN(upc.id)', 'max_action_id');
        qb.orderBy('max_time', 'ASC');
      } else {
        qb.addSelect('MIN(n.reminder_datetime)', 'max_time');
        qb.addSelect(
          "GROUP_CONCAT(CONCAT(n.product_id, ':', pc.is_service))",
          'action_products_agg',
        );
        qb.addSelect('MIN(n.id)', 'max_action_id');
        qb.addSelect('MAX(n.description)', 'max_note');
        qb.addSelect('MAX(n.for_note)', 'max_for_note');
        qb.orderBy('max_time', 'ASC');
      }

      const totalCountQuery = qb.clone();
      totalCountQuery.select('COUNT(DISTINCT contacts.id)', 'count');
      totalCountQuery.groupBy('');
      totalCountQuery.orderBy('');
      const totalCountResult = await totalCountQuery.getRawOne<{
        count: string | number;
      }>();
      totalItems = Number(totalCountResult?.count || 0);
      totalPages = Math.ceil(totalItems / limit);

      qb.limit(limit);
      qb.offset((page - 1) * limit);

      const contactIdsResult = await qb.getRawMany<{
        id: string;
        max_time?: string;
        action_products_agg?: string;
        max_action_id?: string;
        max_note?: string;
        max_for_note?: string;
      }>();

      actions = contactIdsResult.map((r) => {
        let type = 'call';
        let data_from = 'call';
        if (
          action_type === ActionTypeEnum.REMINDER ||
          action_type === ActionTypeEnum.OVERDUE
        ) {
          type =
            r.max_for_note === 'others' ? 'call' : r.max_for_note || 'call';
          data_from = 'notes';
        }

        const actionProductsAgg = (r.action_products_agg || '').split(',');
        const actionProducts = actionProductsAgg
          .filter(Boolean)
          .map((pair: string) => {
            const [pId, isS] = pair.split(':');
            return {
              productId: Number(pId),
              isService: isS === '1',
            };
          });

        return {
          id: r.id,
          time: r.max_time || null,
          note: r.max_note || null,
          type: type,
          data_from: data_from,
          call_or_note_id: Number(r.max_action_id),
          actionProducts: actionProducts,
        };
      });

      contactIds = contactIdsResult.map((r) => r.id);

      if (contactIds.length === 0) {
        return {
          dial: 'manualdial',
          current_page: page,
          total_pages: totalPages || 1,
          total_items: 0,
          records: [],
        };
      }
    }

    // Shared detail fetching logic
    const detailQb = this.contactRepo.createQueryBuilder('contacts');
    detailQb.select([
      'contacts.id AS id',
      'contacts.firstname AS firstname',
      'contacts.lastname AS lastname',
      'contacts.mobile AS mobile',
      'contacts.business_name AS business_name',
      'contacts.designation AS designation',
      'contacts.email AS email',
      'contacts.alternate_number AS alternate_number',
      'contacts.contact_type AS contact_type',
      'contacts.created_at AS created_at',
    ]);

    detailQb.leftJoin(
      'user_product_contacts',
      'upc',
      'contacts.id = upc.contact_id AND upc.user_id = :userId',
      { userId },
    );
    detailQb.leftJoin(
      'product_contacts',
      'pc',
      'pc.contact_id = contacts.id AND (upc.product_id = pc.product_id OR upc.product_id IS NULL)',
    );
    detailQb.leftJoin(
      'products',
      'p',
      'p.id = pc.product_id AND p.company_id = contacts.company_id AND contacts.contact_type = :clientType AND p.deleted_at IS NULL',
      { clientType: ContactTypeEnum.CLIENT },
    );
    detailQb.leftJoin(
      'services',
      's',
      's.id = pc.product_id AND s.company_id = contacts.company_id AND contacts.contact_type = :vendorType AND s.deleted_at IS NULL',
      { vendorType: ContactTypeEnum.VENDOR },
    );
    detailQb.leftJoin(
      'contact_statuses',
      'cs',
      'cs.id = pc.contact_status_id AND cs.company_id = contacts.company_id',
    );

    detailQb.addSelect([
      'upc.is_manualdial AS is_manualdial',
      'upc.is_autodial AS is_autodial',
      'upc.id AS user_product_contact_id',
      'upc.attempts AS attempts',
      'pc.product_id AS p_id',
      'pc.is_service AS is_service',
      'IF(pc.is_service = 1, s.name, p.name) AS p_name',
      'cs.id AS cs_id',
      'cs.name AS cs_name',
      'cs.color_code AS cs_color_code',
      'cs.is_hide AS cs_is_hide',
      'cs.is_unassigned AS cs_is_unassigned',
    ]);

    detailQb.where('contacts.id IN (:...contactIds)', { contactIds });

    const rawData = await detailQb.getRawMany<RawContactRow>();
    const contactMap = this.mapRawToGrouped(rawData);

    const records = actions
      .map((action) => {
        const contact = contactMap.get(action.id);
        if (contact) {
          const actionProducts = action.actionProducts || [];

          // Clone and sort products to prioritize action ones
          const sortedProducts = [...contact.products].sort((a, b) => {
            const aIsAction = actionProducts.some(
              (ap: { productId: number; isService: boolean }) =>
                ap.productId === a.product.id && ap.isService === a.is_service,
            );
            const bIsAction = actionProducts.some(
              (ap: { productId: number; isService: boolean }) =>
                ap.productId === b.product.id && ap.isService === b.is_service,
            );

            if (aIsAction && !bIsAction) return -1;
            if (!aIsAction && bIsAction) return 1;
            return 0;
          });

          const formattedContact = {
            ...contact,
            products: sortedProducts,
          };

          if (
            action.time &&
            action.time !== 'undefined' &&
            action.time !== 'null'
          ) {
            formattedContact.schedule_at =
              DateUtil.getDateTimeAccordingTimezone(
                String(action.time),
                'UTC',
                'Asia/Kolkata',
                'YYYY-MM-DD HH:mm:ss',
              );
          }
          if (action.note) {
            formattedContact.note = action.note;
          }
          formattedContact.type = action.type;
          formattedContact.data_from = action.data_from;
          formattedContact.call_or_note_id = action.call_or_note_id;
          return formattedContact;
        }
        return null;
      })
      .filter((c): c is GroupedContact => Boolean(c));

    return {
      dial: 'manualdial',
      current_page: page,
      total_pages: totalPages || 1,
      total_items: totalItems,
      records: records,
    };
  }

  async getActionRecents(
    userId: number,
    dto: GetActionRecentsQueryDto,
  ): Promise<GetContactsResponseDto> {
    const { company_id, page = 1, limit = 200 } = dto;
    const offset = (page - 1) * limit;
    const manager = this.contactRepo.manager;

    // STEP 1: Fetch paginated action logs (calls, visits) using UNION ALL
    const unionQuery = `
      SELECT 
        actions.contact_id as contact_id, 
        actions.timestamp as timestamp, 
        actions.event_type as event_type, 
        actions.status as status, 
        actions.duration as duration, 
        actions.recording_url as recording_url, 
        actions.note_description as note_description, 
        actions.action_id as action_id,
        actions.action_products_agg as action_products_agg
      FROM (
        SELECT 
          cl.contact_id, 
          cl.start_call_at as timestamp, 
          'call' as event_type, 
          cl.status, 
          cl.duration, 
          cl.recording_url,
          null as note_description,
          cl.id as action_id,
          CONCAT(cl.product_id, ':', pc_cl.is_service) as action_products_agg
        FROM call_logs cl
        INNER JOIN contacts c ON cl.contact_id = c.id
        LEFT JOIN product_contacts pc_cl ON cl.contact_id = pc_cl.contact_id AND cl.product_id = pc_cl.product_id AND pc_cl.is_service = (CASE WHEN c.contact_type = 'vendor' THEN 1 ELSE 0 END)
        WHERE cl.user_id = ? AND cl.deleted_at IS NULL
        
        UNION ALL
        
        SELECT 
          vl.contact_id, 
          vl.datetime as timestamp, 
          'visit' as event_type, 
          null as status, 
          null as duration, 
          null as recording_url,
          GROUP_CONCAT(COALESCE(n_vl.description, '')) as note_description,
          vl.id as action_id,
          GROUP_CONCAT(CONCAT(vlpd.product_id, ':', pc_vl.is_service)) as action_products_agg
        FROM visit_logs vl
        INNER JOIN contacts c ON vl.contact_id = c.id
        INNER JOIN visit_log_product_details vlpd ON vl.id = vlpd.visit_log_id
        LEFT JOIN notes n_vl ON vl.id = n_vl.visit_log_id AND vlpd.product_id = n_vl.product_id
        LEFT JOIN product_contacts pc_vl ON vl.contact_id = pc_vl.contact_id AND vlpd.product_id = pc_vl.product_id AND pc_vl.is_service = (CASE WHEN c.contact_type = 'vendor' THEN 1 ELSE 0 END)
        WHERE vl.user_id = ?
        GROUP BY vl.id
      ) as actions
      INNER JOIN contacts c ON actions.contact_id = c.id
      WHERE c.company_id = ? AND c.deleted_at IS NULL
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;

    const totalCountQuery = `
      SELECT COUNT(*) as count FROM (
        SELECT cl.id
        FROM call_logs cl
        INNER JOIN contacts c ON cl.contact_id = c.id
        WHERE cl.user_id = ? AND cl.deleted_at IS NULL AND c.company_id = ?
        
        UNION ALL
        
        SELECT vl.id
        FROM visit_logs vl
        INNER JOIN contacts c ON vl.contact_id = c.id
        INNER JOIN visit_log_product_details vlpd ON vl.id = vlpd.visit_log_id
        WHERE vl.user_id = ? AND c.company_id = ?
        GROUP BY vl.id
      ) as actions
    `;

    const [logs, totalCountResult] = (await Promise.all([
      manager.query(unionQuery, [userId, userId, company_id, limit, offset]),
      manager.query(totalCountQuery, [userId, company_id, userId, company_id]),
    ])) as [RawActionLog[], { count: string | number }[]];

    const totalItems = Number(totalCountResult[0].count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    if (logs.length === 0) {
      return {
        dial: 'manualdial',
        current_page: page,
        total_pages: totalPages || 1,
        total_items: 0,
        records: [],
      };
    }

    const contactIds = logs.map((log) => log.contact_id);

    // STEP 2: Fetch contact details and products for these contacts
    // Reuse detail fetching logic from getActionDetails/getContacts
    // But we need to keep the order from 'logs' and allow duplicate contacts

    const detailQb = this.contactRepo.createQueryBuilder('contacts');
    detailQb.select([
      'contacts.id AS id',
      'contacts.firstname AS firstname',
      'contacts.lastname AS lastname',
      'contacts.mobile AS mobile',
      'contacts.business_name AS business_name',
      'contacts.designation AS designation',
      'contacts.email AS email',
      'contacts.alternate_number AS alternate_number',
      'contacts.contact_type AS contact_type',
      'contacts.created_at AS created_at',
    ]);

    detailQb.leftJoin(
      'user_product_contacts',
      'upc',
      'contacts.id = upc.contact_id AND upc.user_id = :userId',
      { userId },
    );
    detailQb.leftJoin(
      'product_contacts',
      'pc',
      'pc.contact_id = contacts.id AND (upc.product_id = pc.product_id OR upc.product_id IS NULL)',
    );
    detailQb.leftJoin(
      'products',
      'p',
      'p.id = pc.product_id AND p.company_id = contacts.company_id AND contacts.contact_type = :clientType AND p.deleted_at IS NULL',
      { clientType: ContactTypeEnum.CLIENT },
    );
    detailQb.leftJoin(
      'services',
      's',
      's.id = pc.product_id AND s.company_id = contacts.company_id AND contacts.contact_type = :vendorType AND s.deleted_at IS NULL',
      { vendorType: ContactTypeEnum.VENDOR },
    );
    detailQb.leftJoin(
      'contact_statuses',
      'cs',
      'cs.id = pc.contact_status_id AND cs.company_id = contacts.company_id',
    );

    detailQb.addSelect([
      'upc.is_manualdial AS is_manualdial',
      'upc.is_autodial AS is_autodial',
      'upc.id AS user_product_contact_id',
      'upc.attempts AS attempts',
      'pc.product_id AS p_id',
      'pc.is_service AS is_service',
      'IF(pc.is_service = 1, s.name, p.name) AS p_name',
      'cs.id AS cs_id',
      'cs.name AS cs_name',
      'cs.color_code AS cs_color_code',
      'cs.is_hide AS cs_is_hide',
      'cs.is_unassigned AS cs_is_unassigned',
    ]);

    detailQb.where('contacts.id IN (:...contactIds)', { contactIds });

    const rawData = await detailQb.getRawMany<RawContactRow>();

    // Map raw data to contact objects
    const contactInfoMap = new Map<string, GroupedContact>();
    for (const record of rawData) {
      const contactIdStr = String(record.id);
      if (!contactInfoMap.has(contactIdStr)) {
        contactInfoMap.set(contactIdStr, {
          id: Number(record.id),
          firstname: record.firstname,
          lastname: record.lastname,
          mobile: record.mobile,
          business_name: record.business_name,
          designation: record.designation,
          email: record.email,
          alternate_number: record.alternate_number,
          contact_type: record.contact_type,
          schedule_at: null,
          created_at: record.created_at
            ? DateUtil.getDateTimeAccordingTimezone(
                String(record.created_at),
                'UTC',
                'Asia/Kolkata',
                'YYYY-MM-DD HH:mm:ss',
              )
            : null,
          products: [],
          note: null,
          type: null,
          data_from: null,
          call_or_note_id: null,
        });
      }
      const contact = contactInfoMap.get(contactIdStr);
      if (
        contact &&
        record.p_id &&
        !contact.products.some(
          (p: ContactProductDto) =>
            p.product.id === Number(record.p_id) &&
            p.is_service === Boolean(Number(record.is_service)),
        )
      ) {
        contact.products.push({
          product: { id: Number(record.p_id), name: record.p_name || '' },
          is_service: Boolean(Number(record.is_service)),
          contact_status: record.cs_id
            ? {
                id: Number(record.cs_id),
                name: record.cs_name || '',
                color_code: record.cs_color_code || '',
                is_hide: Boolean(record.cs_is_hide),
                is_unassigned: Boolean(record.cs_is_unassigned),
              }
            : null,
          is_manualdial:
            record.is_manualdial !== null ? Number(record.is_manualdial) : 1,
          is_autodial:
            record.is_autodial !== null ? Number(record.is_autodial) : 0,
          attempts: record.attempts !== null ? Number(record.attempts) : 1,
          latest_note: record.latest_note ?? null,
        });
      }
    }

    // STEP 3: Construct the final list preserving action order and prioritizing interaction products
    const records = logs
      .map((log: RawActionLog) => {
        const contactIdStr = String(log.contact_id);
        const contactInfo = contactInfoMap.get(contactIdStr);
        if (!contactInfo) return null;

        const actionProductsAgg = (log.action_products_agg || '').split(',');
        const actionProducts = actionProductsAgg
          .filter(Boolean)
          .map((pair: string) => {
            const [pId, isS] = pair.split(':');
            return {
              productId: Number(pId),
              isService: isS === '1',
            };
          });

        const sortedProducts = [...contactInfo.products].sort((a, b) => {
          const aIsAction = actionProducts.some(
            (ap: { productId: number; isService: boolean }) =>
              ap.productId === a.product.id && ap.isService === a.is_service,
          );
          const bIsAction = actionProducts.some(
            (ap: { productId: number; isService: boolean }) =>
              ap.productId === b.product.id && ap.isService === b.is_service,
          );

          if (aIsAction && !bIsAction) return -1;
          if (!aIsAction && bIsAction) return 1;
          return 0;
        });

        return {
          ...contactInfo,
          products: sortedProducts,
          schedule_at: DateUtil.getDateTimeAccordingTimezone(
            String(log.timestamp),
            'UTC',
            'Asia/Kolkata',
            'YYYY-MM-DD HH:mm:ss',
          ),
          note:
            log.note_description ||
            (log.event_type === 'call'
              ? `Call Status: ${log.status || 'N/A'}, Duration: ${log.duration || '0'}`
              : null),
          type: log.event_type === 'visit' ? 'visit' : 'call',
          data_from: log.event_type === 'call' ? 'call' : 'notes',
          call_or_note_id: Number(log.action_id),
          action_id: Number(log.action_id),
        } as GroupedContact;
      })
      .filter((r): r is GroupedContact => r !== null);

    return {
      dial: 'manualdial',
      current_page: page,
      total_pages: totalPages || 1,
      total_items: totalItems,
      records,
    };
  }

  private mapRawToGrouped(
    rawData: RawContactRow[],
  ): Map<string, GroupedContact> {
    const contactMap = new Map<string, GroupedContact>();
    for (const record of rawData) {
      if (!contactMap.has(record.id)) {
        contactMap.set(record.id, {
          id: Number(record.id),
          firstname: record.firstname,
          lastname: record.lastname,
          mobile: record.mobile,
          business_name: record.business_name,
          designation: record.designation,
          email: record.email,
          alternate_number: record.alternate_number,
          contact_type: record.contact_type,
          schedule_at: null,
          created_at: record.created_at
            ? DateUtil.getDateTimeAccordingTimezone(
                String(record.created_at),
                'UTC',
                'Asia/Kolkata',
                'YYYY-MM-DD HH:mm:ss',
              )
            : null,
          products: [],
          note: null,
          type: null,
          data_from: null,
          call_or_note_id: null,
        });
      }

      const contact = contactMap.get(record.id);
      if (!contact) continue;

      if (record.p_id) {
        if (
          !contact.products.some(
            (p: ContactProductDto) =>
              p.product.id === Number(record.p_id) &&
              p.is_service === Boolean(Number(record.is_service)),
          )
        ) {
          contact.products.push({
            product: { id: Number(record.p_id), name: record.p_name || '' },
            is_service: Boolean(Number(record.is_service)),
            contact_status: record.cs_id
              ? {
                  id: Number(record.cs_id),
                  name: record.cs_name || '',
                  color_code: record.cs_color_code || '',
                  is_hide: Boolean(record.cs_is_hide),
                  is_unassigned: Boolean(record.cs_is_unassigned),
                }
              : null,
            is_manualdial:
              record.is_manualdial !== null ? Number(record.is_manualdial) : 1,
            is_autodial:
              record.is_autodial !== null ? Number(record.is_autodial) : 0,
            attempts: record.attempts !== null ? Number(record.attempts) : 1,
            latest_note: record.latest_note ?? null,
          });
        }
      }
    }
    return contactMap;
  }

  async findContactProducts(
    contactId: number,
    isVendor: boolean,
    userId: number,
    companyId: number,
  ): Promise<CheckContactProductResult[]> {
    const isServiceValue = isVendor ? 1 : 0;
    const table = isVendor ? 'services' : 'products';

    const sql = `
      SELECT 
        pc.product_id as id,
        p.name as name,
        cs.id as cs_id,
        cs.name as cs_name,
        cs.color_code as cs_color_code,
        (SELECT description FROM notes n 
         WHERE n.contact_id = pc.contact_id 
           AND n.product_id = pc.product_id 
         ORDER BY n.id DESC LIMIT 1) as latest_note
      FROM product_contacts pc
      INNER JOIN user_product_contacts upc 
        ON pc.contact_id = upc.contact_id 
        AND pc.product_id = upc.product_id 
        AND pc.is_service = upc.is_service
      LEFT JOIN ${table} p ON pc.product_id = p.id AND p.company_id = ? AND p.deleted_at IS NULL
      LEFT JOIN contact_statuses cs ON pc.contact_status_id = cs.id AND cs.company_id = ?
      WHERE pc.contact_id = ? 
        AND pc.is_service = ? 
        AND pc.is_hide = 0 
        AND upc.user_id = ?
    `;

    const results = await this.contactRepo.manager.query(sql, [
      companyId, // For product join (?)
      companyId, // For status join (?)
      contactId, // For WHERE (?)
      isServiceValue, // For WHERE (?)
      userId, // For WHERE (?)
    ]);

    return (results as RawCheckContactProductRow[]).map((r) => ({
      id: Number(r.id),
      name: r.name || '',
      status: r.cs_id
        ? {
            id: Number(r.cs_id),
            name: r.cs_name || '',
            color_code: r.cs_color_code || '',
          }
        : null,
      latest_note: r.latest_note,
    }));
  }

  async findDepartmentsByService(serviceId: number): Promise<number[]> {
    const results = await this.contactRepo.manager.query<
      { departmentId: string | number }[]
    >(
      'SELECT department_id as departmentId FROM department_services WHERE service_id = ?',
      [serviceId],
    );
    return results.map((r) => Number(r.departmentId));
  }

  async saveUserProduct(userId: number, productId: number): Promise<void> {
    const exists = await this.contactRepo.manager.query<unknown[]>(
      'SELECT id FROM user_products WHERE user_id = ? AND product_id = ? LIMIT 1',
      [userId, productId],
    );
    if (exists.length === 0) {
      await this.contactRepo.manager.query(
        'INSERT INTO user_products (user_id, product_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [userId, productId],
      );
    }
  }
}
