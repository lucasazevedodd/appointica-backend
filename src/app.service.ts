import { Injectable, Res } from '@nestjs/common';
import Twilio from 'twilio';
import { MessageRequest } from './types/messageRequest';
import dotenv from 'dotenv';
import {google} from 'googleapis';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = Twilio(accountSid, authToken);


const googleOAuthClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

@Injectable()
export class AppService {
  getGoogleAuthUrl(): string {
    const url = googleOAuthClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      prompt: 'consent',
      state: Date.now().toString()
    });

    return url;
  }

  async handleGoogleCallback(code: string) {
    try {
      const { tokens } = await googleOAuthClient.getToken(code);
      googleOAuthClient.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Full OAuth error:', error);
      throw error;
    }
  }

  async getEvents() {
    const calendar = google.calendar({ version: 'v3', auth: googleOAuthClient });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    });
    return response.data.items;
  }

  async createEvent(eventData: any) {
    const calendar = google.calendar({ version: 'v3', auth: googleOAuthClient });
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData
    });
    return response.data;
  }

  async updateEvent(eventId: string, eventData: any) {
    const calendar = google.calendar({ version: 'v3', auth: googleOAuthClient });
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: eventData
    });
    return response.data;
  }

  async deleteEvent(eventId: string) {
    const calendar = google.calendar({ version: 'v3', auth: googleOAuthClient });
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    });
    return { message: 'Event deleted successfully' };
  }

  async sendMessage({
    sender,
    recipient,
    body,
  }: MessageRequest): Promise<string> {
    await createMessage({ sender, recipient, body });
    return `${sender}: ${body}`;
  }
}

async function createMessage({ sender, recipient, body }: MessageRequest) {
  const message = await client.messages.create({
    body: body,
    from: `${sender}`,
    to: `${recipient}`,
  });

  console.log(message);
}
