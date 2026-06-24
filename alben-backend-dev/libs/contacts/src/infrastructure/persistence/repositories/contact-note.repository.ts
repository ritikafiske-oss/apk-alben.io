import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteEntity } from '@libs/notes';
import { ContactEntity } from '../entities/contact.entity';
import { ProductEntity } from '@libs/products';
import { UserEntity } from '@libs/users';

@Injectable()
export class ContactNoteRepository {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteRepo: Repository<NoteEntity>,
    @InjectRepository(ContactEntity)
    private readonly contactRepo: Repository<ContactEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findReminderNotes(
    userId: number,
    companyId: number,
    filter: {
      productId?: number;
      type?: 'All' | 'visit' | 'others';
      filterBy: 'today' | 'tomorrow' | 'upcoming' | 'past';
      contactType?: 'client' | 'vendor' | 'colleague';
      page: number;
      limit: number;
    },
  ): Promise<{ notes: unknown[]; total: number }> {
    const { productId, type, filterBy, contactType, page, limit } = filter;

    const query = this.noteRepo
      .createQueryBuilder('note')
      .innerJoinAndMapOne(
        'note.contact',
        ContactEntity,
        'contact',
        'contact.id = note.contactId',
      )
      .leftJoinAndMapOne(
        'note.product',
        ProductEntity,
        'product',
        'product.id = note.productId',
      )
      .leftJoinAndMapOne(
        'note.createdBy',
        UserEntity,
        'createdBy',
        'createdBy.id = note.userId',
      )
      .leftJoinAndSelect(
        'contact.productContacts',
        'productContact',
        'productContact.productId = note.productId',
      )
      .leftJoinAndSelect('productContact.contactStatus', 'contactStatus')

      .where('note.userId = :userId', { userId })
      .andWhere('note.reminderDatetime IS NOT NULL');

    if (contactType) {
      query.andWhere('contact.contactType = :contactType', { contactType });
    }
    query.andWhere('contact.companyId = :companyId', { companyId });

    if (productId) {
      query.andWhere('note.productId = :productId', { productId });
    }

    if (type && type !== 'All') {
      query.andWhere('note.forNote = :forNote', { forNote: type });
    }

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    if (filterBy === 'today') {
      query.andWhere('note.reminderDatetime BETWEEN :start AND :end', {
        start: todayStart,
        end: todayEnd,
      });
      query.orderBy('note.reminderDatetime', 'ASC');
    } else if (filterBy === 'tomorrow') {
      query.andWhere('note.reminderDatetime BETWEEN :start AND :end', {
        start: tomorrowStart,
        end: tomorrowEnd,
      });
      query.orderBy('note.reminderDatetime', 'ASC');
    } else if (filterBy === 'upcoming') {
      query.andWhere('note.reminderDatetime >= :now', { now: new Date() });
      query.orderBy('note.reminderDatetime', 'ASC');
    } else if (filterBy === 'past') {
      query.andWhere('note.reminderDatetime < :now', { now: new Date() });
      query.orderBy('note.reminderDatetime', 'DESC');
    }

    query.skip((page - 1) * limit).take(limit);

    const [notes, total] = await query.getManyAndCount();

    return { notes, total };
  }
}
