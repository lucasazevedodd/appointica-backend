import { Injectable } from '@nestjs/common';
import Twilio from 'twilio';
import { MessageRequest } from './types/messageRequest';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = Twilio(accountSid, authToken);

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
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
    from: `whatsapp:+${sender}`,
    to: `whatsapp:+${recipient}`,
  });

  console.log(message);
}
