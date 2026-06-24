import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { VISIT_REPOSITORY } from '../domain/ports/visit.repository.port';
import type { VisitRepositoryPort } from '../domain/ports/visit.repository.port';
import {
  CreateVisitLogDto,
  VisitProductDetailDto,
} from '../ui/dtos/create-visit-log.dto';
import { DateUtil, DynamicLoggerService } from '@libs/common';
import type { ProductContactEntity } from '@libs/contacts';
import { UserService } from '@libs/users';
import { ProductService } from '@libs/products';
import { NotesService } from '@libs/notes';

@Injectable()
export class SaveVisitLogUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitsRepository: VisitRepositoryPort,
    private readonly logger: DynamicLoggerService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly notesService: NotesService,
  ) {}

  async execute(userId: number, dto: CreateVisitLogDto) {
    const companyId = Number(dto.company_id);
    const visits = dto.visits;

    const userCompany = await this.userService.validateUserCompany(
      userId,
      companyId,
    );

    if (
      userCompany &&
      ['telecaller', 'attendee_user'].includes(userCompany.role)
    ) {
      throw new BadRequestException({
        success: false,
        code: 'VISIT_CREATION_NOT_ALLOWED',
        message: 'Visit creation is not allowed for this user.',
        data: {},
      });
    }

    for (let k = 0; k < visits.length; k++) {
      const visit = visits[k];
      const mobile = visit.mobile;
      const rawProducts = visit.products || [];

      if (rawProducts.length === 0) {
        continue;
      }

      const createdAtDate = DateUtil.getDateTimeAccordingTimezone(
        visit.created_at,
        'Asia/Kolkata',
        'UTC',
      );

      const contact = await this.visitsRepository.findContact(
        mobile,
        companyId,
      );
      if (!contact) {
        continue;
      } else if (mobile.length != 10) {
        continue;
      }

      const visitLatitude = visit.latitude ?? 0;
      const visitLongitude = visit.longitude ?? 0;

      // Filter and validate all products in the batch UP FRONT (Option A - Strict)
      const validProducts: {
        dto: VisitProductDetailDto;
        productContact: ProductContactEntity;
        productId: number;
      }[] = [];
      for (const p of rawProducts) {
        const productId = Number(p.product_id);
        const pc = await this.visitsRepository.findProductContact(
          contact.id,
          productId,
        );

        if (pc) {
          validProducts.push({
            dto: p,
            productContact: pc,
            productId: productId,
          });
        }
      }

      // If no products in the batch are linked to the contact, skip the whole visit
      if (validProducts.length === 0) {
        continue;
      }

      // We use the first valid linked product for the main visit log table
      const primary = validProducts[0];

      // Duplicate check for the primary product
      const checkVisit = await this.visitsRepository.findDuplicateVisitLog(
        contact.id,
        primary.productId,
        createdAtDate,
        userId,
      );
      if (checkVisit) {
        continue;
      }

      // Calculate primary location from the primary product's contact link
      let pLat = visitLatitude;
      let pLong = visitLongitude;
      if (Number(primary.productContact.latitude) !== 0) {
        pLat = Number(primary.productContact.latitude);
      }
      if (Number(primary.productContact.longitude) !== 0) {
        pLong = Number(primary.productContact.longitude);
      }

      // Create main visit log
      const visitLog = await this.visitsRepository.createVisitLog({
        contactId: contact.id,
        productId: primary.productId,
        visitTypeId: primary.dto.visit_type_id,
        userId: userId,
        latitude: visitLatitude,
        longitude: visitLongitude,
        primaryLatitude: pLat,
        primaryLongitude: pLong,
        photo: visit.photo,
        remark: primary.dto.remark ?? null,
        datetime: createdAtDate,
        createdAt: createdAtDate,
      });

      const productDetailsToSave = [];

      for (const item of validProducts) {
        const { dto, productContact: pc, productId } = item;
        const reminderDate =
          dto.reminder_datetime && dto.reminder_datetime !== ''
            ? DateUtil.getDateTimeAccordingTimezone(
                dto.reminder_datetime,
                'Asia/Kolkata',
                'UTC',
              )
            : null;

        await this.productService.validateProductCompany(productId, companyId);

        productDetailsToSave.push({
          visitLogId: visitLog.id,
          productId: productId,
          visitTypeId: dto.visit_type_id,
        });

        // Create Note for each product
        await this.notesService.markNotesAsDone(contact.id, productId);
        await this.notesService.createNote({
          description: dto.remark || '',
          reminderDatetime: reminderDate,
          contactId: contact.id,
          productId: productId,
          userId: userId,
          forNote: 'visit',
          visitLogId: visitLog.id,
          isDone: false,
        });

        // Update location if it's the first visit for this product
        const count = await this.visitsRepository.countVisitLogs(
          contact.id,
          productId,
        );

        if (count == 1 || (count == 0 && productId !== primary.productId)) {
          await this.visitsRepository.updateProductContactLocation(
            Number(pc.id),
            visitLatitude,
            visitLongitude,
          );
          await this.visitsRepository.updateVisitLogPrimaryLocation(
            contact.id,
            productId,
            visitLatitude,
            visitLongitude,
          );
        }
      }

      if (productDetailsToSave.length > 0) {
        await this.visitsRepository.createVisitLogProductDetails(
          productDetailsToSave,
        );
      }

      await new Promise((r) => setTimeout(r, 500));
    }

    return null;
  }
}
