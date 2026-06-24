import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindOptionsOrder } from 'typeorm';
import { NotificationRepositoryPort } from '../../domain/ports/notification.repository.port';
import { MappedNotification } from '../../interfaces/notification.interface';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationMapper } from './mappers/notification.mapper';
import { Notification } from '../../domain/notification.entity';
import {
  RawProductContactStatus,
  RawSurpriseVisit,
} from '../../interfaces/raw-query-results.interface';

@Injectable()
export class NotificationRepository implements NotificationRepositoryPort {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  async countUnread(userId: number): Promise<number> {
    const where: FindOptionsWhere<NotificationEntity> = {
      userId,
      isRead: false,
    };
    return this.notificationRepo.count({ where });
  }

  async findPaginated(
    userId: number,
    page: number,
    limit: number,
    companyId: number,
  ): Promise<{
    records: MappedNotification[];
    total: number;
    lastPage: number;
  }> {
    const where: FindOptionsWhere<NotificationEntity> = { userId, companyId };
    const order: FindOptionsOrder<NotificationEntity> = { createdAt: 'DESC' };

    const [entities, total] = await this.notificationRepo.findAndCount({
      where,
      relations: ['company', 'note', 'product', 'contact'],
      order,
      take: limit,
      skip: (page - 1) * limit,
    });

    const records: MappedNotification[] = [];
    for (const entity of entities) {
      const domain: Notification = NotificationMapper.toDomain(entity);
      const mapped: MappedNotification = {
        ...domain,
        company: entity.company
          ? {
              id: Number(entity.company.id),
              business_name: entity.company.businessName,
              business_logo: entity.company.businessLogo,
            }
          : null,
        note: entity.note
          ? {
              id: Number(entity.note.id),
              description: entity.note.description,
              reminder_datetime: entity.note.reminderDatetime,
              created_at: entity.note.createdAt,
              for_note: entity.note.forNote,
            }
          : null,
        product: entity.product
          ? {
              id: Number(entity.product.id),
              name: entity.product.name,
            }
          : null,
        contact: entity.contact
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
          : null,
        contact_status: null,
      };

      if (entity.contactId && entity.productId) {
        const productContact = await this.notificationRepo.manager
          .createQueryBuilder('product_contacts', 'pc')
          .leftJoin('contact_statuses', 'cs', 'cs.id = pc.contact_status_id')
          .select('cs.id', 'id')
          .addSelect('cs.name', 'name')
          .addSelect('cs.color_code', 'color_code')
          .where('pc.product_id = :productId AND pc.contact_id = :contactId', {
            productId: entity.productId,
            contactId: entity.contactId,
          })
          .getRawOne<RawProductContactStatus>();

        if (productContact) {
          mapped.contact_status = {
            id: Number(productContact.id),
            name: productContact.name,
            color_code: productContact.color_code,
          };
        }
      }

      records.push(mapped);
    }

    return {
      records,
      total,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findLatestPendingSurpriseVisit(
    userId: number,
    companyId: number,
  ): Promise<{
    question_id: number;
    question: string;
    company_id: number;
  } | null> {
    const surpriseVisit = await this.notificationRepo.manager
      .createQueryBuilder()
      .select('sv.id', 'question_id')
      .addSelect('sv.question', 'question')
      .addSelect('sv.company_id', 'company_id')
      .from('surprise_visits', 'sv')
      .where(
        'sv.company_id = :companyId AND sv.user_id = :userId AND sv.answer IS NULL',
        {
          companyId,
          userId,
        },
      )
      .orderBy('sv.id', 'DESC')
      .getRawOne<RawSurpriseVisit>();

    if (!surpriseVisit) {
      return null;
    }

    return {
      question_id: Number(surpriseVisit.question_id),
      question: surpriseVisit.question,
      company_id: Number(surpriseVisit.company_id),
    };
  }
}
