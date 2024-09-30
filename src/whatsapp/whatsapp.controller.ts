import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send-messages')
  async sendMessagesToStudents(
    @Body('userId') userId: string, // Receive userId from frontend
    @Body('numbers') numbers: string[],
    @Body('message') message: string,
  ) {
    console.log('heree');
    try {
      // Send messages using the service (user-specific)
      const { success, failed } =
        await this.whatsappService.sendMessagesToMultipleStudents(
          userId,
          numbers,
          message,
        );

      return {
        status: 'success',
        message: `Messages processed. ${success.length} succeeded, ${failed.length} failed.`,
        data: {
          success,
          failed,
        },
      };
    } catch (error) {
      return { status: 'error', message: 'An unexpected error occurred.' };
    }
  }
}
