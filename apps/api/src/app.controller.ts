import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('Health & System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Server is healthy and running',
    schema: {
      example: {
        success: true,
        data: 'Hello World!',
        message: 'Operasi berhasil',
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
