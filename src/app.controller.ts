import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';

import type { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('sendMessage')
  sendMessage(
    @Query('body') body: string,
    @Query('sender') sender: string,
    @Query('recipient') recipient: string,
  ): Promise<string> {
    return this.appService.sendMessage({ sender, recipient, body });
  }
}
