import { Controller, Get, Param, Post, Put, Delete, Query, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';

import type { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response): void {
    const authUrl = this.appService.getGoogleAuthUrl();
    res.redirect(authUrl);
  }

  @Get('auth/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      await this.appService.handleGoogleCallback(code);
      res.redirect('/events');
    } catch (error) {
      res.status(400).send('Authorization failed: ' + error.message);
    }
  }

  @Get('events')
  async getEvents() {
    return this.appService.getEvents();
  }

  @Post('events')
  async createEvent(@Req() request: Request) {
    return this.appService.createEvent(request.body);
  }

  @Put('events/:id')
  async updateEvent(@Param('id') id: string, @Req() request: Request) {
    return this.appService.updateEvent(id, request.body);
  }

  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string) {
    return this.appService.deleteEvent(id);
  }

  @Get('auth/google/callback')
  handleGoogleCallback(@Query('code') code: string){
    return this.appService.handleGoogleCallback(code);
  }

  @Post('sendMessage')
  sendMessage(
    @Query('body') body: string,
    @Query('sender') sender: string,
    @Query('recipient') recipient: string,
  ): Promise<string> {
    return this.appService.sendMessage({ sender, recipient, body });
  }

  @Post('whatsapp')
  whatsapp(@Req() request: Request) {
   
    const { From:user, To:company, WaId, Body, ProfileName, NumMedia } = request.body;
    const mediaArray: Array<string> = [];

    if (NumMedia) {
      for (let i = 0; i < NumMedia; i++) {
        mediaArray.push(request.body[`MediaUrl${i}`]);
      }
    }

    const body = `Fala, ${ProfileName}!`

    this.appService.sendMessage({ sender:company, recipient:user, body });
    console.log(request.body);
  }
}
