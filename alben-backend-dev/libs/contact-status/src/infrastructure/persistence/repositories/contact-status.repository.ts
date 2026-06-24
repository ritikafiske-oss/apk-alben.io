import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactStatusRepositoryPort } from '../../../domain/ports/contact-status.repository.port';
import { ContactStatus } from '../../../domain/entities/contact-status.entity';
import { ContactStatusEntity } from '../entities/contact-status.entity';

@Injectable()
export class ContactStatusRepository implements ContactStatusRepositoryPort {
  constructor(
    @InjectRepository(ContactStatusEntity)
    private readonly contactStatusRepo: Repository<ContactStatusEntity>,
  ) {}

  async findContactStatuses(companyId: number): Promise<ContactStatus[]> {
    const entities = await this.contactStatusRepo.find({
      where: { companyId, status: 'active' },
      order: { name: 'ASC' },
      select: [
        'id',
        'name',
        'colorCode',
        'isHide',
        'isUnassigned',
        'companyId',
        'status',
        'isDefault',
      ],
    });

    return entities.map(
      (e) =>
        new ContactStatus(
          Number(e.id),
          e.name,
          e.colorCode,
          e.status,
          Number(e.companyId),
          e.isHide,
          e.isUnassigned,
          e.isDefault,
        ),
    );
  }

  async findContactStatusById(id: number): Promise<ContactStatus | null> {
    const entity = await this.contactStatusRepo.findOne({ where: { id } });
    if (!entity) return null;
    return new ContactStatus(
      Number(entity.id),
      entity.name,
      entity.colorCode,
      entity.status,
      Number(entity.companyId),
      entity.isHide,
      entity.isUnassigned,
      entity.isDefault,
    );
  }
}
