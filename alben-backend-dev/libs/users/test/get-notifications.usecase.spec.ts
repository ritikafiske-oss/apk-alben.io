import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GetNotificationsUseCase } from '../src/application/get-notifications.usecase';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from '../src/domain/ports/notification.repository.port';
import { UserService } from '../src/application/user.service';
import { GetNotificationsDto } from '../src/ui/dtos/get-notifications.dto';
import { UserCompany } from '../src/domain/user-company.entity';

describe('GetNotificationsUseCase', () => {
  let useCase: GetNotificationsUseCase;
  let notificationRepo: jest.Mocked<NotificationRepositoryPort>;
  let userService: jest.Mocked<UserService>;

  const mockUserCompany = new UserCompany(
    1, // id
    1, // userId
    1, // companyId
    'Check Out', // activityStatus
    'active', // status
    'staff', // role
  );

  beforeEach(async () => {
    const mockNotificationRepo = {
      countUnread: jest.fn(),
      findPaginated: jest.fn(),
      findLatestPendingSurpriseVisit: jest.fn(),
    };

    const mockUserService = {
      validateUserCompany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNotificationsUseCase,
        {
          provide: NOTIFICATION_REPOSITORY,
          useValue: mockNotificationRepo,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    useCase = module.get<GetNotificationsUseCase>(GetNotificationsUseCase);
    notificationRepo = module.get(NOTIFICATION_REPOSITORY);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return notifications and surprise visit on success', async () => {
    // Arrange
    const userId = 1;
    const dto: GetNotificationsDto = { company_id: 1, page: 1, limit: 10 };

    userService.validateUserCompany.mockResolvedValue(mockUserCompany);
    notificationRepo.countUnread.mockResolvedValue(5);
    notificationRepo.findPaginated.mockResolvedValue({
      records: [
        {
          id: 101,
          title: 'Test Notif',
          description: 'Desc',
          isRead: false,
          userId: 1,
          sentBy: 2,
          contactId: null,
          productId: null,
          productIds: null,
          noteId: null,
          noteIds: null,
          companyId: 1,
          notificationType: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
          company: null,
          note: null,
          product: null,
          contact: null,
          contact_status: null,
        },
      ],
      total: 1,
      lastPage: 1,
    });
    notificationRepo.findLatestPendingSurpriseVisit.mockResolvedValue({
      question_id: 1,
      question: 'How are you?',
      company_id: 1,
    });

    // Act
    const result = await useCase.execute(userId, dto);

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userService.validateUserCompany).toHaveBeenCalledWith(
      userId,
      dto.company_id,
    );
    expect(result.success).toBe(true);
    expect(result.code).toBe('DATA_FETCHED');
    expect(result.data.total_unread).toBe(5);
    expect(result.data.records).toHaveLength(1);
    expect(result.data.surprise_visit).toBeDefined();
    expect(result.data.surprise_visit?.question).toBe('How are you?');
  });

  it('should handle empty states correctly', async () => {
    // Arrange
    const userId = 1;
    const dto: GetNotificationsDto = { company_id: 1, page: 1, limit: 10 };

    userService.validateUserCompany.mockResolvedValue(mockUserCompany);
    notificationRepo.countUnread.mockResolvedValue(0);
    notificationRepo.findPaginated.mockResolvedValue({
      records: [],
      total: 0,
      lastPage: 0,
    });
    notificationRepo.findLatestPendingSurpriseVisit.mockResolvedValue(null);

    // Act
    const result = await useCase.execute(userId, dto);

    // Assert
    expect(result.data.total_unread).toBe(0);
    expect(result.data.records).toHaveLength(0);
    expect(result.data.surprise_visit).toBeNull();
  });

  it('should throw BadRequestException if company validation fails', async () => {
    // Arrange
    const userId = 1;
    const dto: GetNotificationsDto = { company_id: 999 };

    userService.validateUserCompany.mockRejectedValue(
      new Error('Invalid company'),
    );

    // Act & Assert
    await expect(useCase.execute(userId, dto)).rejects.toThrow(
      BadRequestException,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userService.validateUserCompany).toHaveBeenCalledWith(userId, 999);
  });
});
