import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { VISIT_REPOSITORY } from '../domain/ports/visit.repository.port';
import type { VisitRepositoryPort } from '../domain/ports/visit.repository.port';
import {
  VisitItemDto,
  VisitProductDetailDto,
} from '../ui/dtos/create-visit-log.dto';
import { StorageService } from '@libs/storage';
import { DateUtil, DynamicLoggerService } from '@libs/common';
import { MulterFile } from '../interfaces/multer-file.interface';
import { UserService } from '@libs/users';
import { ProductService } from '@libs/products';
import { NotesService } from '@libs/notes';
import type { ProductContactEntity } from '@libs/contacts';

@Injectable()
export class VisitsService {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitsRepository: VisitRepositoryPort,
    private readonly storageService: StorageService,
    private readonly logger: DynamicLoggerService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly notesService: NotesService,
  ) {}

  async getVisitTypes(companyId: number, userId: number) {
    await this.userService.validateUserCompany(userId, companyId);

    const visitTypes = await this.visitsRepository.getVisitTypes(companyId);
    return visitTypes;
  }

  async getVisitLogs(
    companyId: number,
    productId: number,
    userId: number,
    page: number,
    limit: number,
    visitTypeId?: number,
  ) {
    await this.userService.validateUserCompany(userId, companyId);

    await this.productService.validateProductCompany(productId, companyId);

    return this.visitsRepository.getVisitLogs(
      companyId,
      productId,
      userId,
      page,
      limit,
      visitTypeId,
    );
  }

  async saveSurpriseVisit(
    companyId: number,
    userId: number,
    questionId: number,
    answer: string,
    lat: number,
    long: number,
  ) {
    await this.userService.validateUserCompany(userId, companyId);
    await this.visitsRepository.saveSurpriseVisit(
      questionId,
      userId,
      companyId,
      answer,
      lat,
      long,
    );
    return null;
  }

  async saveVisitLog(
    userId: number,
    dataStr: string,
    files: Array<MulterFile>,
  ) {
    let parsedData: { company_id: number; visits: VisitItemDto[] };
    try {
      const initialParse = JSON.parse(dataStr) as unknown;
      if (typeof initialParse === 'string') {
        parsedData = JSON.parse(initialParse) as {
          company_id: number;
          visits: VisitItemDto[];
        };
      } else {
        parsedData = initialParse as {
          company_id: number;
          visits: VisitItemDto[];
        };
      }
    } catch (error) {
      this.logger.error(
        `Invalid JSON format when saving visit: ${(error as Error).message}`,
        (error as Error).stack,
        'exceptions',
      );
      throw new BadRequestException({
        success: false,
        code: 'ERR_INVALID_JSON_FORMAT',
        message: 'Invalid JSON format.',
        data: {},
      });
    }

    const companyId = Number(parsedData?.company_id);
    const visits = parsedData?.visits;

    if (!companyId || !visits || !Array.isArray(visits)) {
      throw new BadRequestException({
        success: false,
        code: 'VALIDATION_ERRORS',
        message: 'Validation errors.',
        data: {},
      });
    }

    await this.userService.validateUserCompany(userId, companyId);

    const userCompany = await this.visitsRepository.findUserCompany(
      companyId,
      userId,
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

    const fileMap = new Map<number, MulterFile>();
    if (files) {
      const visitPhotos = files.filter(
        (f) => f.fieldname === 'photos' || f.fieldname === 'photos[]',
      );

      if (visitPhotos.length > 0) {
        visitPhotos.forEach((f, index) => {
          fileMap.set(index, f);
        });
      } else {
        files.forEach((f) => {
          const match = f.fieldname.match(/\[(\d+)\]/);
          if (match && match[1]) {
            fileMap.set(parseInt(match[1]), f);
          }
        });
      }
    }

    if (fileMap.size !== visits.length) {
      throw new BadRequestException({
        success: false,
        code: 'VALIDATION_ERRORS',
        message:
          'Validation errors: photos array length does not match visits data length.',
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

      // Strict enforcement logic (Option A)
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

      if (validProducts.length === 0) {
        continue;
      }

      const primary = validProducts[0];
      const primaryReminderDate =
        primary.dto.reminder_datetime && primary.dto.reminder_datetime !== ''
          ? DateUtil.getDateTimeAccordingTimezone(
              primary.dto.reminder_datetime,
              'Asia/Kolkata',
              'UTC',
            )
          : null;

      const checkVisit = await this.visitsRepository.findDuplicateVisitLog(
        contact.id,
        primary.productId,
        primaryReminderDate,
        userId,
      );

      if (checkVisit) {
        continue;
      }

      let attachmentPath: string | null = null;
      const file = fileMap.get(k);
      if (file) {
        const directory = `uploads/${companyId}/visit_logs`;
        try {
          attachmentPath = await this.storageService.uploadFile(
            file,
            directory,
          );
        } catch (e) {
          this.logger.error(
            `Failed to upload visit log photo: ${(e as Error).message}`,
            (e as Error).stack,
            'exceptions',
          );
          throw e;
        }
      }

      let pLat = visitLatitude;
      let pLong = visitLongitude;

      if (Number(primary.productContact.latitude) !== 0) {
        pLat = Number(primary.productContact.latitude);
      }
      if (Number(primary.productContact.longitude) !== 0) {
        pLong = Number(primary.productContact.longitude);
      }

      const visitLog = await this.visitsRepository.createVisitLog({
        contactId: contact.id,
        productId: primary.productId,
        visitTypeId: primary.dto.visit_type_id,
        userId: userId,
        latitude: visitLatitude,
        longitude: visitLongitude,
        primaryLatitude: pLat,
        primaryLongitude: pLong,
        photo: attachmentPath || visit.photo,
        remark: primary.dto.remark ?? null,
        datetime: primaryReminderDate,
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

        await this.notesService.markNotesAsDone(contact.id, productId);
        await this.notesService.createNote({
          description: dto.remark || '',
          reminderDatetime: reminderDate,
          contactId: contact.id,
          productId: productId,
          userId: userId,
          forNote: 'visit',
          isDone: false,
        });

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
