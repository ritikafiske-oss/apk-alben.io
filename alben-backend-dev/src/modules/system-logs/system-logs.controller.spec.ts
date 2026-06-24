import { Test, TestingModule } from '@nestjs/testing';
import { SystemLogsController } from './system-logs.controller';
import { SystemLogsService } from './system-logs.service';

describe('SystemLogsController', () => {
  let controller: SystemLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemLogsController],
      providers: [
        {
          provide: SystemLogsService,
          useValue: {
            getAvailableCategories: jest.fn().mockReturnValue([]),
            getLogsForCategory: jest.fn().mockReturnValue([]),
            getLogFilePath: jest.fn().mockReturnValue(null),
            deleteLog: jest.fn(),
            resetLog: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SystemLogsController>(SystemLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
