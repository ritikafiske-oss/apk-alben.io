import { Test, TestingModule } from '@nestjs/testing';
import { SystemLogsService } from './system-logs.service';
import { DynamicLoggerService } from '@libs/common';

describe('SystemLogsService', () => {
  let service: SystemLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemLogsService,
        {
          provide: DynamicLoggerService,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SystemLogsService>(SystemLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
