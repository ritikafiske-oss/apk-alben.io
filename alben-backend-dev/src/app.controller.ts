import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ExceptionHandler } from '@libs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    try {
      return this.appService.getHello();
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}
