import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode';
import { WhatsappGateway } from './whatsapp.gateway';

@Injectable()
export class WhatsappService {
  private logger = new Logger(WhatsappService.name);
  private client: Client | null = null; // Store the WhatsApp client

  constructor(
    @Inject(forwardRef(() => WhatsappGateway))
    private readonly whatsappGateway: WhatsappGateway,
  ) {}

  // Generate the QR code for the user when they register
  generateQrCodeForUser(userId: string, socketId: string) {
    if (!this.client) {
      // Only create the client if it hasn't been created yet
      this.client = new Client({
        puppeteer: {
          headless: true, // You can set this to false if you want to see the browser
        },
        authStrategy: new LocalAuth(), // Keeps the session for future logins
      });

      this.client.on('qr', async (qr) => {
        // Generate the QR code as a data URL
        const qrCodeUrl = await qrcode.toDataURL(qr);
        // Emit the QR code to the user via WebSocket
        this.whatsappGateway.emitQrCodeToUser(socketId, qrCodeUrl);
      });

      this.client.on('ready', () => {
        this.logger.log(`WhatsApp client ready for user ${userId}`);
        // Emit a signal that the QR code has been scanned
        this.whatsappGateway.emitQrScannedToUser(socketId);
      });

      this.client.on('auth_failure', (message) => {
        this.logger.error(`Authentication failure for ${userId}: ${message}`);
        this.client = null; // Reset the client if authentication fails
      });

      this.client.on('disconnected', () => {
        this.logger.log(`WhatsApp client disconnected for user ${userId}`);
        this.client = null; // Reset the client on disconnect
      });

      this.client.initialize();
    } else {
      this.logger.log('Client is already initialized');
    }
  }

  // Send messages to multiple students using the stored client
  async sendMessagesToMultipleStudents(
    userId: string,
    phoneNumbers: string[],
    message: string,
  ): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    if (!this.client) {
      throw new Error('WhatsApp client is not initialized');
    }

    for (const phoneNumber of phoneNumbers) {
      try {
        await this.sendMessageToSingleStudent(userId, phoneNumber, message);
        success.push(phoneNumber);
        this.logger.log(`Message successfully sent to ${phoneNumber}`);
      } catch (error) {
        failed.push(phoneNumber);
        this.logger.error(`Failed to send message to ${phoneNumber}: ${error}`);
      }
    }

    return { success, failed };
  }

  // Send a message to a single student using the stored client
  private async sendMessageToSingleStudent(
    userId: string,
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    if (!this.client) {
      throw new Error('WhatsApp client is not initialized');
    }

    return new Promise(async (resolve, reject) => {
      try {
        // Ensure the client is ready before sending a message
        if (this.client && this.client.info) {
          const chatId = `${phoneNumber}@c.us`;
          await this.client.sendMessage(chatId, message);
          resolve();
        } else {
          reject('WhatsApp client is not ready');
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
