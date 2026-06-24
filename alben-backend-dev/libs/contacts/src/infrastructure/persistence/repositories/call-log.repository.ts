import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallLogRepositoryPort } from '../../../domain/ports/call-log.repository.port';
import { CallLogEntity } from '../entities/call-log.entity';
import { CallLogProductDetailEntity } from '../entities/call-log-product-detail.entity';
import { GetCallLogsDto } from '../../../ui/dtos/get-call-logs.dto';
import { DateUtil } from '@libs/common';
import { RawContactBasicRow } from '../../../interfaces/raw-contact-basic-row.interface';
import { RawCallLogBasicRow } from '../../../interfaces/raw-call-log-basic-row.interface';
import { RawProductNoteRow } from '../../../interfaces/raw-product-note-row.interface';
import { GroupedCallLogContact } from '../../../interfaces/grouped-call-log-contact.interface';

@Injectable()
export class CallLogRepository implements CallLogRepositoryPort {
  constructor(
    @InjectRepository(CallLogEntity)
    private readonly callLogRepo: Repository<CallLogEntity>,
    @InjectRepository(CallLogProductDetailEntity)
    private readonly productDetailRepo: Repository<CallLogProductDetailEntity>,
  ) {}

  async getCallLogs(
    userId: number,
    dto: GetCallLogsDto,
  ): Promise<{
    current_page: number;
    total_pages: number;
    total_items: number;
    records: unknown[];
  }> {
    const manager = this.callLogRepo.manager;

    const companyId = dto.company_id;
    const productIdFilter = dto.product_id ?? 'all';
    const contactType = dto.contact_type ?? 'all';
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 200;
    const search = dto.search ?? null;
    let startDate = dto.start_date ?? null;
    let endDate = dto.end_date ?? null;
    const callType = dto.call_type ?? null;
    const statusIdFilter = dto.status_id ?? null;

    if (startDate && endDate) {
      startDate = `${startDate} 00:00:00`;
      endDate = `${endDate} 23:59:59`;
    }

    // Parameters for finding relevant contacts and their latest calls
    const filterParams: unknown[] = [companyId, userId];

    // Filter string components common to both count and ID search
    let filterCondition = `
      INNER JOIN contacts sub_c ON sub_cl.contact_id = sub_c.id
      LEFT JOIN call_log_product_details sub_clpd ON sub_cl.id = sub_clpd.call_log_id
      LEFT JOIN product_contacts sub_pc ON sub_c.id = sub_pc.contact_id 
        AND sub_clpd.product_id = sub_pc.product_id
        AND sub_pc.is_service = IF(sub_c.contact_type = 'vendor', 1, 0)
      WHERE sub_c.company_id = ? AND sub_cl.user_id = ?
    `;

    if (productIdFilter !== 'all') {
      const qbProductIds = String(productIdFilter)
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id !== '')
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      if (qbProductIds.length > 0) {
        filterCondition += ` AND sub_clpd.product_id IN (${qbProductIds.join(',')}) AND sub_pc.product_id IS NOT NULL`;
      }
    }

    if (statusIdFilter) {
      const qbStatusIds = String(statusIdFilter)
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id !== '')
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      if (qbStatusIds.length > 0) {
        filterCondition += ` AND sub_pc.contact_status_id IN (${qbStatusIds.join(',')})`;
      }
    }

    if (contactType !== 'all') {
      filterCondition += ` AND sub_c.contact_type = ?`;
      filterParams.push(contactType);
    }

    if (callType) {
      filterCondition += ` AND sub_cl.type = ?`;
      filterParams.push(callType);
    }

    if (search) {
      filterCondition += ` AND (sub_c.mobile LIKE ? OR sub_c.firstname LIKE ? OR sub_c.lastname LIKE ? OR sub_c.business_name LIKE ?)`;
      const likeSearch = `%${search}%`;
      filterParams.push(likeSearch, likeSearch, likeSearch, likeSearch);
    }

    if (startDate && endDate) {
      filterCondition += ` AND sub_cl.created_at BETWEEN ? AND ? `;
      filterParams.push(startDate, endDate);
    }

    filterCondition += ` AND sub_cl.created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)`;

    // PASS 1.1: COUNT TOTAL ITEMS (Unique Contacts Called)
    const countQuery = `
      SELECT COUNT(DISTINCT sub_cl.contact_id) as total
      FROM call_logs sub_cl
      ${filterCondition}
    `;
    const countResult = await manager.query<{ total: number }[]>(
      countQuery,
      filterParams,
    );
    const totalItems =
      countResult.length > 0 ? Number(countResult[0].total) : 0;
    const totalPages = Math.ceil(totalItems / limit);

    if (totalItems === 0) {
      return {
        current_page: Number(page),
        total_pages: totalPages || 1,
        total_items: 0,
        records: [],
      };
    }

    // PASS 1.2: FIND PAGINATED IDs (contact_id and its latest match call log ID)
    const offset = (page - 1) * limit;
    const idParams = [...filterParams, limit, offset];
    const idsQuery = `
      SELECT sub_cl.contact_id, MAX(sub_cl.id) as latest_call_id
      FROM call_logs sub_cl
      ${filterCondition}
      GROUP BY sub_cl.contact_id
      ORDER BY latest_call_id DESC
      LIMIT ? OFFSET ?
    `;
    const paginatedIds: Array<{ contact_id: number; latest_call_id: number }> =
      await manager.query(idsQuery, idParams);

    const contactIds = paginatedIds.map((p) => p.contact_id);
    const latestCallIds = paginatedIds.map((p) => p.latest_call_id);

    // PASS 2: HYDRATE DETAILS (Only for the paginated page)

    // 2.1 Fetch Contact Basic Info
    const rawContacts = await manager.query<RawContactBasicRow[]>(`
      SELECT c.* FROM contacts c WHERE c.id IN (${contactIds.join(',')})
    `);

    // 2.2 Fetch Latest Call Log Detail
    const rawCallLogs = await manager.query<RawCallLogBasicRow[]>(`
      SELECT cl.* FROM call_logs cl WHERE cl.id IN (${latestCallIds.join(',')})
    `);

    // 2.3 Fetch Products and Latest Notes per Product
    const rawProducts = await manager.query<RawProductNoteRow[]>(`
      SELECT pc.contact_id, pc.product_id, pc.contact_status_id, pc.is_service,
             IF(c.contact_type = 'vendor', s.name, p.name) as product_name,
             cs.name as status_name, cs.color_code as status_color_code, cs.is_hide as status_is_hide, cs.is_unassigned as status_is_unassigned,
             n.id as note_id, n.description as note_description, n.reminder_datetime as note_reminder_datetime,
             n.user_id as note_user_id, nu.firstname as nu_firstname, nu.lastname as nu_lastname
      FROM product_contacts pc
      INNER JOIN contacts c ON pc.contact_id = c.id
      LEFT JOIN products p ON pc.product_id = p.id AND c.contact_type = 'client' AND p.company_id = c.company_id
      LEFT JOIN services s ON pc.product_id = s.id AND c.contact_type = 'vendor' AND s.company_id = c.company_id
      LEFT JOIN contact_statuses cs ON pc.contact_status_id = cs.id AND cs.company_id = c.company_id
      LEFT JOIN LATERAL (
          SELECT n_inner.* FROM notes n_inner
          INNER JOIN product_contacts pc_n ON n_inner.contact_id = pc_n.contact_id AND n_inner.product_id = pc_n.product_id
          WHERE n_inner.contact_id = pc.contact_id 
            AND n_inner.product_id = pc.product_id 
            AND pc_n.is_service = pc.is_service 
          ORDER BY n_inner.id DESC LIMIT 1
      ) n ON true
      LEFT JOIN users nu ON n.user_id = nu.id
      WHERE pc.contact_id IN (${contactIds.join(',')})
    `);

    // Assemble everything back together into the map for correct grouping and order
    const contactsMap = new Map<number, GroupedCallLogContact>();

    for (const pRow of paginatedIds) {
      const cId = Number(pRow.contact_id);
      const rawC = rawContacts.find((c) => Number(c.id) === cId);
      const rawCL = rawCallLogs.find(
        (cl) => Number(cl.id) === Number(pRow.latest_call_id),
      );

      if (rawC) {
        contactsMap.set(cId, {
          id: cId,
          firstname: rawC.firstname || '',
          lastname: rawC.lastname || '',
          mobile: rawC.mobile,
          business_name: rawC.business_name || '',
          designation: rawC.designation || '',
          email: rawC.email || '',
          alternate_number: rawC.alternate_number || '',
          contact_type: rawC.contact_type,
          products: [],
          call_logs: rawCL
            ? {
                id: Number(rawCL.id),
                mobile: rawCL.mobile,
                start_call_at: DateUtil.getDateTimeAccordingTimezone(
                  rawCL.start_call_at,
                  'UTC',
                  'Asia/Kolkata',
                  'YYYY-MM-DD HH:mm:ss',
                ),
                duration: rawCL.duration,
                status: rawCL.status,
                type: rawCL.type,
                recording_url: rawCL.recording_url,
                contact_id: Number(rawCL.contact_id),
                user_id: Number(rawCL.user_id),
                latitude: Number(rawCL.latitude),
                longitude: Number(rawCL.longitude),
                created_at: rawCL.created_at,
              }
            : null,
        });
      }
    }

    for (const row of rawProducts) {
      const cId = Number(row.contact_id);
      const contact = contactsMap.get(cId);
      if (contact) {
        let noteObj = null;
        if (row.note_id) {
          noteObj = {
            id: Number(row.note_id),
            description: row.note_description || '',
            reminder_datetime: row.note_reminder_datetime
              ? DateUtil.getDateTimeAccordingTimezone(
                  row.note_reminder_datetime,
                  'UTC',
                  'Asia/Kolkata',
                  'YYYY-MM-DD HH:mm:ss',
                )
              : '',
            user_id: Number(row.note_user_id),
            created_by: {
              id: Number(row.note_user_id),
              firstname: row.nu_firstname || '',
              lastname: row.nu_lastname || '',
            },
          };
        }

        contact.products.push({
          product: {
            id: Number(row.product_id),
            name: row.product_name || '',
          },
          contact_status: row.contact_status_id
            ? {
                id: Number(row.contact_status_id),
                name: row.status_name || '',
                color_code: row.status_color_code || '',
                is_hide: Boolean(row.status_is_hide),
                is_unassigned: Boolean(row.status_is_unassigned),
              }
            : null,
          note: noteObj,
        });
      }
    }

    const records = Array.from(contactsMap.values());

    return {
      current_page: Number(page),
      total_pages: totalPages || 1,
      total_items: totalItems,
      records: records,
    };
  }

  async createCallLog(data: Partial<CallLogEntity>): Promise<CallLogEntity> {
    const callLog = this.callLogRepo.create({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await this.callLogRepo.save(callLog);
  }

  async findExistingCallLog(
    contactId: number,
    mobile: string,
    startCallAt: Date,
    duration: number | string,
    userId: number,
  ): Promise<CallLogEntity | null> {
    return await this.callLogRepo.findOne({
      where: {
        contact_id: contactId,
        mobile: mobile,
        start_call_at: startCallAt,
        duration: duration.toString(),
        user_id: userId,
      },
      select: ['id'],
    });
  }

  async findLastCallLog(contactId: number): Promise<CallLogEntity | null> {
    return await this.callLogRepo.findOne({
      where: { contact_id: contactId },
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<CallLogEntity | null> {
    return await this.callLogRepo.findOne({
      where: { id },
    });
  }

  async updateCallLog(id: number, data: Partial<CallLogEntity>): Promise<void> {
    await this.callLogRepo.update(id, {
      ...data,
      updated_at: new Date(),
    });
  }

  async createCallLogProductDetail(
    data: Partial<CallLogProductDetailEntity>,
  ): Promise<void> {
    const detail = this.productDetailRepo.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.productDetailRepo.save(detail);
  }
}
